// ---------------------------------------------------------------------------
// Real backend client for the mother-domain APIs built in Phase 6 Parts 1-2
// (profile/settings/emergency-contact/children) and the mother data APIs
// added afterward (growth, milestones, vaccinations, daily goals, nutrition
// reminders, appointments) — see PROJECT_STATE.md. This is Phase 6 Part 4:
// the first frontend consumer of any of those endpoints. Maps each
// endpoint's raw (snake_case) row shape onto the existing frontend types in
// `@/types`, so pages that already render those types don't need UI changes.
//
// Everything here requires the real JWT persisted by useMockAuth's
// loginWithCredentials — there is no mock fallback: a mother viewing real
// data must be really signed in. Callers should treat NotAuthenticatedError
// as an expected, handleable state (e.g. via AsyncStateView), not a bug.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY, fetchCurrentUser } from '@/services/authApi';
import { defaultMotherSettings } from '@/data/motherSettingsMockData';
import { LogMeasurementInput } from '@/data/motherGrowthMockData';
import { RequestAppointmentInput } from '@/data/motherAppointmentsMockData';
import {
  AppointmentCategory,
  ChildProfile,
  DailyGoalItem,
  EmergencyContact,
  GrowthMeasurement,
  GrowthRecipientType,
  MilestoneRecord,
  MotherAppointment,
  MotherAppointmentStatus,
  MotherSettings,
  MotherVaccinationRecord,
  NotificationPreferences,
  PrivacyPreferences,
  ReminderPreferences,
  Report,
  ReportCategory,
  ReportStatus,
  SettingsLanguage,
  VaccineStatus,
} from '@/types';

export class NotAuthenticatedError extends AuthApiError {}

function getToken(): string {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    throw new NotAuthenticatedError('Sign in with your real account to view this data.');
  }
  return token;
}

async function authedFetch(path: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new AuthNetworkError('Unable to reach the MaaSuraksha server. Please make sure the backend is running.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof body.message === 'string' ? body.message : `Request failed with status ${res.status}.`;
    throw new AuthApiError(message);
  }
  return body;
}

const get = (path: string) => authedFetch(path);
const post = (path: string, body?: unknown) => authedFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
const put = (path: string, body?: unknown) => authedFetch(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
const patch = (path: string, body?: unknown) => authedFetch(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });

// --- Recipient name resolution ---------------------------------------------
// growth/milestone/vaccination rows only carry recipient_type + child_id —
// no name. The mother's own name comes from her authenticated identity
// (already fetched for session restore in useMockAuth); a child's name comes
// from her own children list. Resolved once per list-fetch and reused for
// every row, rather than fetched per-row.
interface RecipientContext {
  motherName: string;
  primaryChild?: ChildProfile;
}

async function resolveRecipientContext(): Promise<RecipientContext> {
  const token = getToken();
  const [user, children] = await Promise.all([fetchCurrentUser(token), getChildren()]);
  return { motherName: user.name, primaryChild: children[0] };
}

function recipientName(ctx: RecipientContext, recipientType: string | null, childId: string | null): string {
  if (recipientType === 'CHILD') {
    return ctx.primaryChild && ctx.primaryChild.id === childId ? ctx.primaryChild.name : ctx.primaryChild?.name ?? 'Child';
  }
  return ctx.motherName;
}

// --- Profile / settings / emergency contact / children ---------------------

export async function getEmergencyContact(): Promise<EmergencyContact | null> {
  const body = await get('/auth/me/emergency-contact');
  const contact = body.contact as { name: string; relation: string | null; phone: string } | null;
  if (!contact) return null;
  return { name: contact.name, relation: contact.relation ?? '', phone: contact.phone };
}

export async function updateEmergencyContact(input: EmergencyContact): Promise<EmergencyContact> {
  const body = await put('/auth/me/emergency-contact', input);
  const contact = body.contact as { name: string; relation: string | null; phone: string };
  return { name: contact.name, relation: contact.relation ?? '', phone: contact.phone };
}

interface SettingsRowShape {
  language?: SettingsLanguage | null;
  notifications?: Partial<NotificationPreferences> | null;
  reminders?: Partial<ReminderPreferences> | null;
  privacy?: Partial<PrivacyPreferences> | null;
}

// A mother account with no settings row yet is normal (see settingsService.ts
// on the backend) — every missing section falls back to this app's existing
// mock defaults (motherSettingsMockData.ts) rather than an invented value.
function mergeSettings(row: SettingsRowShape | null): MotherSettings {
  return {
    motherId: defaultMotherSettings.motherId,
    language: row?.language ?? defaultMotherSettings.language,
    notifications: { ...defaultMotherSettings.notifications, ...(row?.notifications ?? {}) },
    reminders: { ...defaultMotherSettings.reminders, ...(row?.reminders ?? {}) },
    privacy: { ...defaultMotherSettings.privacy, ...(row?.privacy ?? {}) },
  };
}

export async function getSettings(): Promise<MotherSettings> {
  const body = await get('/auth/me/settings');
  return mergeSettings(body.settings as SettingsRowShape | null);
}

export interface SettingsPatch {
  language?: SettingsLanguage;
  notifications?: NotificationPreferences;
  reminders?: ReminderPreferences;
  privacy?: PrivacyPreferences;
}

// Each JSON column is replaced wholesale server-side (no field-level merge —
// see settingsService.ts's COALESCE-per-column upsert), so callers must pass
// the complete section object for anything they're changing, not just the
// changed key.
export async function updateSettings(input: SettingsPatch): Promise<MotherSettings> {
  const body = await patch('/auth/me/settings', input);
  return mergeSettings(body.settings as SettingsRowShape | null);
}

export interface MyProfileSummary {
  name: string;
  phone: string;
  email: string;
  location: string;
}

// GET /auth/me's `profile` field carries the role-specific profile row
// (mother_profiles here) as an untyped object — location lives there, not on
// the flat user record authApi.ts's RealAuthUser models.
export async function getMyProfile(): Promise<MyProfileSummary> {
  const body = await get('/auth/me');
  const user = body.user as { name: string; phone: string | null; email: string; profile?: { location?: string | null } };
  return {
    name: user.name,
    phone: user.phone ?? '',
    email: user.email,
    location: user.profile?.location ?? '',
  };
}

export interface ProfilePatch {
  phone?: string;
  email?: string;
  location?: string;
}

// `name` is deliberately not accepted here: the real backend's PATCH /me
// only ever writes users.phone/email and mother_profiles' own editable
// columns (age/stage/pregnancyWeek/deliveryDate/bloodGroup/location) — there
// is no name column write path (see authService.ts updateUserRow).
export async function updateProfile(input: ProfilePatch): Promise<void> {
  await patch('/auth/me', {
    phone: input.phone,
    email: input.email,
    profile: input.location !== undefined ? { location: input.location } : undefined,
  });
}

interface ChildProfileRowShape {
  id: string;
  name: string;
  gender: string | null;
  date_of_birth: string | null;
  birth_weight_kg: string | null;
  current_weight_kg: string | null;
  blood_group: string | null;
}

function ageDisplayFromDob(dob: string | null): string {
  if (!dob) return 'Unknown age';
  const days = Math.max(0, Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24)));
  const weeks = Math.floor(days / 7);
  if (weeks < 12) return `${weeks} week${weeks === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'}`;
}

export async function getChildren(): Promise<ChildProfile[]> {
  const body = await get('/auth/me/children');
  const rows = (body.children as ChildProfileRowShape[]) ?? [];
  return rows.map((row) => ({
    id: row.id,
    motherId: '',
    name: row.name,
    gender: (row.gender as ChildProfile['gender']) ?? 'boy',
    dateOfBirth: row.date_of_birth ?? '',
    ageDisplay: ageDisplayFromDob(row.date_of_birth),
    birthWeightKg: row.birth_weight_kg != null ? Number(row.birth_weight_kg) : 0,
    currentWeightKg: row.current_weight_kg != null ? Number(row.current_weight_kg) : 0,
    bloodGroup: row.blood_group ?? '',
    birthHospital: '',
  }));
}

// --- Growth measurements -----------------------------------------------------

interface GrowthMeasurementRowShape {
  id: string;
  mother_id: string;
  child_id: string | null;
  doctor_id: string | null;
  hospital_id: string | null;
  doctor_name: string | null;
  hospital_name: string | null;
  recipient_type: string;
  measured_on: string;
  weight_kg: string | null;
  height_cm: string | null;
  head_circumference_cm: string | null;
  context: string | null;
  notes: string | null;
  logged_by_mother: boolean;
}

function toGrowthMeasurement(row: GrowthMeasurementRowShape, ctx: RecipientContext): GrowthMeasurement {
  return {
    measurementId: row.id,
    motherId: row.mother_id,
    childId: row.child_id ?? undefined,
    doctorId: row.doctor_id ?? '',
    doctorName: row.doctor_name ?? '',
    hospitalId: row.hospital_id ?? '',
    hospitalName: row.hospital_name ?? '',
    recipientType: row.recipient_type as GrowthRecipientType,
    recipientName: recipientName(ctx, row.recipient_type, row.child_id),
    date: row.measured_on,
    weightKg: row.weight_kg != null ? Number(row.weight_kg) : undefined,
    heightCm: row.height_cm != null ? Number(row.height_cm) : undefined,
    headCircumferenceCm: row.head_circumference_cm != null ? Number(row.head_circumference_cm) : undefined,
    // context is nullable on the backend (the home-logging form never
    // collects it — see growthMeasurementService.ts) but the card renders it
    // as its own heading, so a missing one falls back to a neutral label
    // rather than being left blank.
    context: row.context ?? (row.logged_by_mother ? 'Home measurement' : 'Growth measurement'),
    notes: row.notes ?? undefined,
    loggedByMother: row.logged_by_mother,
  };
}

export async function getGrowthMeasurements(): Promise<GrowthMeasurement[]> {
  const [body, ctx] = await Promise.all([get('/mother/growth-measurements'), resolveRecipientContext()]);
  const rows = (body.measurements as GrowthMeasurementRowShape[]) ?? [];
  return rows.map((row) => toGrowthMeasurement(row, ctx));
}

export async function logGrowthMeasurement(input: LogMeasurementInput): Promise<GrowthMeasurement> {
  const childId = input.recipientType === 'CHILD' ? (await getChildren())[0]?.id : undefined;
  const [body, ctx] = await Promise.all([
    post('/mother/growth-measurements', {
      recipientType: input.recipientType,
      childId,
      date: input.date,
      weightKg: input.weightKg,
      heightCm: input.heightCm,
      headCircumferenceCm: input.headCircumferenceCm,
      notes: input.notes,
    }),
    resolveRecipientContext(),
  ]);
  return toGrowthMeasurement(body.measurement as GrowthMeasurementRowShape, ctx);
}

// --- Milestones --------------------------------------------------------------

interface MilestoneRowShape {
  id: string;
  mother_id: string;
  child_id: string | null;
  recipient_type: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  target_age_range: string | null;
  status: string | null;
  achieved_date: string | null;
  notes: string | null;
}

function toMilestone(row: MilestoneRowShape, ctx: RecipientContext): MilestoneRecord {
  return {
    milestoneId: row.id,
    motherId: row.mother_id,
    childId: row.child_id ?? undefined,
    recipientType: (row.recipient_type as GrowthRecipientType) ?? 'MOTHER',
    recipientName: recipientName(ctx, row.recipient_type, row.child_id),
    category: (row.category as MilestoneRecord['category']) ?? 'MOTOR',
    title: row.title ?? '',
    description: row.description ?? '',
    targetAgeRange: row.target_age_range ?? '',
    status: (row.status as MilestoneRecord['status']) ?? 'upcoming',
    achievedDate: row.achieved_date ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function getMilestones(): Promise<MilestoneRecord[]> {
  const [body, ctx] = await Promise.all([get('/mother/milestones'), resolveRecipientContext()]);
  const rows = (body.milestones as MilestoneRowShape[]) ?? [];
  return rows.map((row) => toMilestone(row, ctx));
}

export async function markMilestoneAchieved(milestoneId: string): Promise<MilestoneRecord> {
  const [body, ctx] = await Promise.all([
    patch(`/mother/milestones/${milestoneId}/achieve`),
    resolveRecipientContext(),
  ]);
  return toMilestone(body.milestone as MilestoneRowShape, ctx);
}

// --- Vaccinations --------------------------------------------------------------

interface VaccinationRowShape {
  id: string;
  mother_id: string;
  child_id: string | null;
  doctor_id: string | null;
  hospital_id: string | null;
  doctor_name: string | null;
  hospital_name: string | null;
  recipient_type: string | null;
  vaccine_code: string | null;
  vaccine_name: string | null;
  dose_label: string | null;
  recommended_date: string | null;
  given_date: string | null;
  status: string | null;
  location: string | null;
  administered_by: string | null;
  notes: string | null;
  reminder_enabled: boolean;
}

function toVaccination(row: VaccinationRowShape, ctx: RecipientContext): MotherVaccinationRecord {
  return {
    vaccinationId: row.id,
    motherId: row.mother_id,
    childId: row.child_id ?? undefined,
    doctorId: row.doctor_id ?? '',
    doctorName: row.doctor_name ?? '',
    hospitalId: row.hospital_id ?? '',
    hospitalName: row.hospital_name ?? '',
    recipientType: (row.recipient_type as MotherVaccinationRecord['recipientType']) ?? 'MOTHER',
    recipientName: recipientName(ctx, row.recipient_type, row.child_id),
    vaccineName: row.vaccine_name ?? row.vaccine_code ?? 'Vaccine',
    doseLabel: row.dose_label ?? '',
    recommendedDate: row.recommended_date ?? '',
    givenDate: row.given_date ?? undefined,
    status: (row.status as VaccineStatus) ?? 'upcoming',
    location: row.location ?? '',
    notes: row.notes ?? undefined,
    administeredBy: row.administered_by ?? undefined,
    reminderEnabled: row.reminder_enabled,
  };
}

export async function getVaccinations(): Promise<MotherVaccinationRecord[]> {
  const [body, ctx] = await Promise.all([get('/mother/vaccinations'), resolveRecipientContext()]);
  const rows = (body.vaccinations as VaccinationRowShape[]) ?? [];
  return rows.map((row) => toVaccination(row, ctx));
}

export async function toggleVaccinationReminder(vaccinationId: string): Promise<MotherVaccinationRecord> {
  const [body, ctx] = await Promise.all([
    patch(`/mother/vaccinations/${vaccinationId}/reminder`),
    resolveRecipientContext(),
  ]);
  return toVaccination(body.vaccination as VaccinationRowShape, ctx);
}

// --- Daily goals ---------------------------------------------------------------

interface DailyGoalRowShape {
  id: string;
  mother_id: string;
  category: string | null;
  title: string | null;
  target_label: string | null;
  target_count: number | null;
  completed_count: number;
}

function toDailyGoal(row: DailyGoalRowShape): DailyGoalItem {
  return {
    goalId: row.id,
    motherId: row.mother_id,
    category: (row.category as DailyGoalItem['category']) ?? 'ACTIVITY',
    title: row.title ?? '',
    targetLabel: row.target_label ?? '',
    targetCount: row.target_count ?? 0,
    completedCount: row.completed_count,
  };
}

export async function getDailyGoals(): Promise<DailyGoalItem[]> {
  const body = await get('/mother/daily-goals');
  return ((body.goals as DailyGoalRowShape[]) ?? []).map(toDailyGoal);
}

export async function incrementDailyGoal(goalId: string): Promise<DailyGoalItem> {
  const body = await patch(`/mother/daily-goals/${goalId}/increment`);
  return toDailyGoal(body.goal as DailyGoalRowShape);
}

export async function decrementDailyGoal(goalId: string): Promise<DailyGoalItem> {
  const body = await patch(`/mother/daily-goals/${goalId}/decrement`);
  return toDailyGoal(body.goal as DailyGoalRowShape);
}

// --- Nutrition reminders ---------------------------------------------------------

interface NutritionReminderRowShape {
  id: string;
  mother_id: string;
  title: string | null;
  description: string | null;
  timing: string | null;
  enabled: boolean;
}

function toNutritionReminder(row: NutritionReminderRowShape) {
  return {
    reminderId: row.id,
    motherId: row.mother_id,
    title: row.title ?? '',
    description: row.description ?? '',
    timing: row.timing ?? '',
    enabled: row.enabled,
  };
}

export async function getNutritionReminders() {
  const body = await get('/mother/nutrition-reminders');
  return ((body.reminders as NutritionReminderRowShape[]) ?? []).map(toNutritionReminder);
}

export async function toggleNutritionReminder(reminderId: string) {
  const body = await patch(`/mother/nutrition-reminders/${reminderId}/toggle`);
  return toNutritionReminder(body.reminder as NutritionReminderRowShape);
}

// --- Appointments ---------------------------------------------------------------

interface AppointmentRowShape {
  id: string;
  mother_id: string;
  child_id: string | null;
  doctor_id: string;
  hospital_id: string;
  doctor_name: string | null;
  hospital_name: string | null;
  category: string | null;
  title: string | null;
  appt_date: string | null;
  appt_time: string | null;
  location: string | null;
  reason: string | null;
  status: string | null;
  notes: string | null;
}

function toAppointment(row: AppointmentRowShape, ctx: RecipientContext): MotherAppointment {
  return {
    appointmentId: row.id,
    motherId: row.mother_id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name ?? '',
    hospitalId: row.hospital_id,
    hospitalName: row.hospital_name ?? '',
    category: (row.category as AppointmentCategory) ?? 'ANTENATAL_CHECKUP',
    title: row.title ?? '',
    date: row.appt_date ?? '',
    // Postgres TIME comes back as "HH:MM:SS" — trimmed to "HH:MM" for display.
    time: row.appt_time ? row.appt_time.slice(0, 5) : '',
    location: row.location ?? '',
    reason: row.reason ?? '',
    status: (row.status as MotherAppointmentStatus) ?? 'requested',
    notes: row.notes ?? undefined,
    childId: row.child_id ?? undefined,
    childName: row.child_id ? ctx.primaryChild?.name : undefined,
  };
}

export async function getAppointments(): Promise<MotherAppointment[]> {
  const [body, ctx] = await Promise.all([get('/mother/appointments'), resolveRecipientContext()]);
  const rows = (body.appointments as AppointmentRowShape[]) ?? [];
  return rows.map((row) => toAppointment(row, ctx));
}

export async function requestAppointment(input: RequestAppointmentInput): Promise<MotherAppointment> {
  const [body, ctx] = await Promise.all([
    post('/mother/appointments', {
      category: input.category,
      reason: input.reason,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
    }),
    resolveRecipientContext(),
  ]);
  return toAppointment(body.appointment as AppointmentRowShape, ctx);
}

export async function cancelAppointment(appointmentId: string): Promise<MotherAppointment> {
  const [body, ctx] = await Promise.all([
    patch(`/mother/appointments/${appointmentId}/cancel`),
    resolveRecipientContext(),
  ]);
  return toAppointment(body.appointment as AppointmentRowShape, ctx);
}

export async function rescheduleAppointment(
  appointmentId: string,
  newDate: string,
  newTime: string
): Promise<MotherAppointment> {
  const [body, ctx] = await Promise.all([
    patch(`/mother/appointments/${appointmentId}/reschedule`, { newDate, newTime }),
    resolveRecipientContext(),
  ]);
  return toAppointment(body.appointment as AppointmentRowShape, ctx);
}

// --- Documents (Reports & Documents page) -----------------------------------

interface DocumentRowShape {
  id: string;
  name: string;
  category: string | null;
  doc_date: string | null;
  status: string | null;
  description: string | null;
  file_size: string | null;
  file_type: string | null;
  file_url: string | null;
  doctor_name: string | null;
  hospital_name: string | null;
}

function toReport(row: DocumentRowShape): Report {
  return {
    id: row.id,
    name: row.name,
    category: (row.category as ReportCategory) ?? 'OTHER',
    date: row.doc_date ?? '',
    doctor: row.doctor_name ?? '',
    hospital: row.hospital_name ?? '',
    status: (row.status as ReportStatus) ?? 'PENDING',
    description: row.description ?? undefined,
    fileSize: row.file_size ?? undefined,
    fileType: row.file_type ?? undefined,
  };
}

// Every document a doctor has uploaded for this mother (documents.mother_id
// scoped server-side from her own JWT) — no mock fallback and no locally
// inserted rows: a report only ever appears here once it is genuinely in
// the documents table.
export async function getDocuments(): Promise<Report[]> {
  const body = await get('/mother/documents');
  return ((body.documents as DocumentRowShape[]) ?? []).map(toReport);
}
