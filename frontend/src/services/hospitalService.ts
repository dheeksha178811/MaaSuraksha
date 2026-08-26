// ---------------------------------------------------------------------------
// Hospital Service (Module 6)
//
//   COMPONENT
//     ↓
//   hospitalService.ts   <-- you are here
//     ↓
//   src/data/hospitalMockData.ts (mock data NOW)
//     ↓ (future)
//   fetch('/api/hospitals/...') → Node.js/Express → MongoDB
//
// Hospital pages only ever call the functions exported from this file —
// never the raw arrays in `hospitalMockData.ts` directly. Reads/writes go
// through an in-memory store seeded from that file's exports, so creating or
// updating a record (a delivery, a bed, a referral, ...) persists for the
// rest of the session exactly like a real API call would, without the
// underlying mock seed data itself ever being mutated. When a real backend
// exists, every function body here becomes a `fetch` call; no caller needs
// to change.
//
// Phase 6 Part 14: getHospital/updateHospitalProfile/getHospitalSettings/
// updateHospitalSettings now ARE that real fetch call, against
// /api/hospital/profile and /api/hospital/settings (hospital_profiles /
// hospital_settings). Every other export below — dashboard, patients,
// deliveries, neonatal, beds, vaccines, referrals, reports — is still the
// in-memory mock store seeded from hospitalMockData.ts, unaffected by this
// change; it keeps its own internal `_hospital.id` (the mock id) for
// self-consistency, entirely decoupled from the real profile below.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';
import { mockDoctor, mockHospital } from '@/data/mockData';
import {
  HOSPITAL_NOW_ISO,
  HOSPITAL_TODAY_ISO,
  defaultHospitalSettings,
  deliveryRecords,
  getMotherAge,
  getMotherName,
  hospitalActivity,
  hospitalAlerts,
  hospitalBeds,
  hospitalPatients,
  hospitalReferrals,
  neonatalRecords,
  vaccineInventory,
} from '@/data/hospitalMockData';
import {
  BedStatus,
  BedType,
  DeliveryRecord,
  DeliveryStatus,
  DeliveryType,
  HospitalActivityItem,
  HospitalAlert,
  HospitalBed,
  HospitalCareType,
  HospitalPatient,
  HospitalProfile,
  HospitalReferral,
  HospitalReport,
  HospitalReportRequest,
  HospitalReportType,
  HospitalSettings,
  NeonatalCareLevel,
  NeonatalRecord,
  NeonatalStatus,
  PatientCareStatus,
  PatientRiskLevel,
  ReferralPriority,
  ReferralStatus,
  VaccineInventoryItem,
  VaccineInventoryStatus,
} from '@/types';

// --- Real backend client (profile/settings only — see header note) ---------

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
const patchRequest = (path: string, body?: unknown) => authedFetch(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });

const LATENCY_MS = 300;
const simulateLatency = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const nextId = (prefix: string, existing: { id: string }[]): string => {
  let max = 0;
  existing.forEach((item) => {
    const match = new RegExp(`^${prefix}_(\\d+)$`).exec(item.id);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  });
  return `${prefix}_${String(max + 1).padStart(2, '0')}`;
};

// --- In-memory store (seeded once from the mock data module) ---------------

let _hospital: HospitalProfile = clone(mockHospital);
const _patients: HospitalPatient[] = clone(hospitalPatients);
const _deliveries: DeliveryRecord[] = clone(deliveryRecords);
const _neonatal: NeonatalRecord[] = clone(neonatalRecords);
const _beds: HospitalBed[] = clone(hospitalBeds);
const _vaccines: VaccineInventoryItem[] = clone(vaccineInventory);
const _referrals: HospitalReferral[] = clone(hospitalReferrals);
const _alerts: HospitalAlert[] = clone(hospitalAlerts);
const _activity: HospitalActivityItem[] = clone(hospitalActivity);
let _settings: HospitalSettings = clone(defaultHospitalSettings);

const logActivity = (type: HospitalActivityItem['type'], description: string, relatedId?: string) => {
  _activity.unshift({
    id: nextId('act', _activity),
    hospitalId: _hospital.id,
    type,
    description,
    timestamp: HOSPITAL_NOW_ISO,
    relatedId,
  });
};

// --- Hospital profile --------------------------------------------------

// hospital_profiles has no available_beds column — bed availability is
// tracked per-row in the (untouched, out-of-scope) beds module, not
// aggregated onto the profile — so this stays undefined from the real API,
// same as the existing UI's `hospital.availableBeds ?? '—'` already handles.
export interface HospitalProfileView extends HospitalProfile {
  tagline?: string;
  establishedYear?: number;
  accreditations?: string[];
  visitingHours?: string;
  emergencyContactNumber?: string;
  ambulanceAvailable?: boolean;
}

interface HospitalProfileRowShape {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  facility_name: string;
  facility_type: string | null;
  license_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  contact_number: string | null;
  total_beds: number;
  neonatal_icu_available: boolean;
  status: string | null;
  tagline: string | null;
  established_year: number | null;
  accreditations: string[] | null;
  visiting_hours: string | null;
  emergency_contact_number: string | null;
  ambulance_available: boolean;
  created_at: string;
}

function toHospitalProfile(row: HospitalProfileRowShape): HospitalProfileView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    role: 'hospital',
    facilityName: row.facility_name,
    facilityType: (row.facility_type as HospitalProfile['facilityType']) ?? 'Private Maternity Center',
    licenseNumber: row.license_number ?? '',
    address: row.address ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    postalCode: row.postal_code ?? undefined,
    contactNumber: row.contact_number ?? '',
    totalBeds: row.total_beds,
    availableBeds: undefined,
    neonatalICUAvailable: row.neonatal_icu_available,
    status: (row.status as HospitalProfile['status']) ?? 'ACTIVE',
    createdAt: row.created_at,
    tagline: row.tagline ?? undefined,
    establishedYear: row.established_year ?? undefined,
    accreditations: row.accreditations ?? undefined,
    visitingHours: row.visiting_hours ?? undefined,
    emergencyContactNumber: row.emergency_contact_number ?? undefined,
    ambulanceAvailable: row.ambulance_available,
  };
}

export async function getHospital(): Promise<HospitalProfileView> {
  const body = await get('/hospital/profile');
  return toHospitalProfile(body.profile as HospitalProfileRowShape);
}

// Only the fields EditHospitalProfileModal.tsx collects — matches the
// backend's own whitelist exactly (updateProfileForRole('hospital', ...)).
// Facility identity fields (facilityName, facilityType, licenseNumber,
// tagline, accreditations, ...) are managed by MaaSuraksha and are not part
// of this type at all, matching the modal's own copy about that.
export type HospitalProfileUpdate = Partial<
  Pick<HospitalProfile, 'address' | 'city' | 'state' | 'postalCode' | 'contactNumber' | 'totalBeds'>
>;

export async function updateHospitalProfile(patch: HospitalProfileUpdate): Promise<HospitalProfileView> {
  const body = await patchRequest('/hospital/profile', patch);
  return toHospitalProfile(body.profile as HospitalProfileRowShape);
}

// --- Dashboard -----------------------------------------------------------

export interface HospitalDashboardData {
  summary: {
    registeredMothersCount: number;
    todaysAdmissionsCount: number;
    todaysDeliveriesCount: number;
    neonatalCareCount: number;
    availableBedsCount: number;
    pendingReferralsCount: number;
  };
  operations: {
    admissions: number;
    scheduledDeliveries: number;
    completedDeliveries: number;
    neonatalAdmissions: number;
    discharges: number;
  };
  alerts: HospitalAlert[];
  activity: HospitalActivityItem[];
}

export async function getHospitalDashboard(): Promise<HospitalDashboardData> {
  const today = HOSPITAL_TODAY_ISO;

  const todaysAdmissions = _patients.filter((p) => p.admissionDate === today);
  const todaysDeliveries = _deliveries.filter((d) => d.deliveryDate === today);
  const completedToday = todaysDeliveries.filter((d) => d.status === 'COMPLETED');
  const todaysDischarges = _patients.filter((p) => p.dischargeDate === today);
  const activeNeonatal = _neonatal.filter((n) => n.status !== 'DISCHARGED' && n.status !== 'TRANSFERRED');

  const summary = {
    registeredMothersCount: _patients.length,
    todaysAdmissionsCount: todaysAdmissions.length,
    todaysDeliveriesCount: completedToday.length,
    neonatalCareCount: activeNeonatal.length,
    availableBedsCount: _beds.filter((b) => b.status === 'AVAILABLE').length,
    pendingReferralsCount: _referrals.filter((r) => r.status === 'PENDING').length,
  };

  const operations = {
    admissions: todaysAdmissions.length,
    scheduledDeliveries: todaysDeliveries.length,
    completedDeliveries: completedToday.length,
    neonatalAdmissions: _neonatal.filter((n) => n.admissionDate === today).length,
    discharges: todaysDischarges.length,
  };

  return simulateLatency({
    summary,
    operations,
    alerts: clone(_alerts.filter((a) => a.status === 'ACTIVE')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    activity: clone(_activity)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 8),
  });
}

// --- Patients --------------------------------------------------------------

export interface HospitalPatientView extends HospitalPatient {
  motherName: string;
  age: number;
  doctorName: string;
  bedLabel?: string;
}

export interface HospitalPatientFilters {
  status?: PatientCareStatus;
  riskLevel?: PatientRiskLevel;
  careType?: HospitalCareType;
  search?: string;
}

const toPatientView = (patient: HospitalPatient): HospitalPatientView => {
  const bed = patient.bedId ? _beds.find((b) => b.id === patient.bedId) : undefined;
  return {
    ...patient,
    motherName: getMotherName(patient.motherId),
    age: getMotherAge(patient.motherId),
    doctorName: patient.doctorId === mockDoctor.id ? mockDoctor.name : patient.doctorId,
    bedLabel: bed ? `${bed.bedNumber} (${bed.ward})` : undefined,
  };
};

export async function getHospitalPatients(filters: HospitalPatientFilters = {}): Promise<HospitalPatientView[]> {
  let results = _patients.filter((p) => p.hospitalId === _hospital.id).map(toPatientView);

  if (filters.status) results = results.filter((p) => p.status === filters.status);
  if (filters.riskLevel) results = results.filter((p) => p.riskLevel === filters.riskLevel);
  if (filters.careType) results = results.filter((p) => p.careType === filters.careType);
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter((p) => p.motherName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }

  return simulateLatency(clone(results).sort((a, b) => b.admissionDate.localeCompare(a.admissionDate)));
}

export interface HospitalPatientDetail extends HospitalPatientView {
  deliveries: DeliveryRecord[];
  neonatalRecords: NeonatalRecord[];
  referrals: HospitalReferral[];
  activity: HospitalActivityItem[];
}

export async function getHospitalPatientById(id: string): Promise<HospitalPatientDetail | undefined> {
  const patient = _patients.find((p) => p.id === id && p.hospitalId === _hospital.id);
  if (!patient) return simulateLatency(undefined);

  const view = toPatientView(patient);
  const detail: HospitalPatientDetail = {
    ...view,
    deliveries: clone(_deliveries.filter((d) => d.motherId === patient.motherId)),
    neonatalRecords: clone(_neonatal.filter((n) => n.motherId === patient.motherId)),
    referrals: clone(_referrals.filter((r) => r.motherId === patient.motherId)),
    activity: clone(_activity.filter((a) => a.relatedId === patient.id)),
  };
  return simulateLatency(detail);
}

// --- Deliveries --------------------------------------------------------

export interface DeliveryRecordView extends DeliveryRecord {
  motherName: string;
  doctorName: string;
}

export interface DeliveryFilters {
  status?: DeliveryStatus;
  deliveryType?: DeliveryType;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

const toDeliveryView = (record: DeliveryRecord): DeliveryRecordView => ({
  ...record,
  motherName: getMotherName(record.motherId),
  doctorName: record.doctorId === mockDoctor.id ? mockDoctor.name : record.doctorId,
});

export async function getDeliveryRecords(filters: DeliveryFilters = {}): Promise<DeliveryRecordView[]> {
  let results = _deliveries.filter((d) => d.hospitalId === _hospital.id).map(toDeliveryView);

  if (filters.status) results = results.filter((d) => d.status === filters.status);
  if (filters.deliveryType) results = results.filter((d) => d.deliveryType === filters.deliveryType);
  if (filters.dateFrom) results = results.filter((d) => d.deliveryDate >= filters.dateFrom!);
  if (filters.dateTo) results = results.filter((d) => d.deliveryDate <= filters.dateTo!);
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter((d) => d.motherName.toLowerCase().includes(q));
  }

  return simulateLatency(
    clone(results).sort((a, b) => `${b.deliveryDate}T${b.deliveryTime}`.localeCompare(`${a.deliveryDate}T${a.deliveryTime}`))
  );
}

export interface CreateDeliveryInput {
  motherId: string;
  doctorId: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: DeliveryType;
  gestationalAge: number;
  babyCount: number;
  maternalOutcome: string;
  notes?: string;
}

export async function createDeliveryRecord(input: CreateDeliveryInput): Promise<DeliveryRecord> {
  const record: DeliveryRecord = {
    id: nextId('del', _deliveries),
    hospitalId: _hospital.id,
    motherId: input.motherId,
    doctorId: input.doctorId,
    deliveryDate: input.deliveryDate,
    deliveryTime: input.deliveryTime,
    deliveryType: input.deliveryType,
    status: input.deliveryDate === HOSPITAL_TODAY_ISO ? 'IN_PROGRESS' : 'SCHEDULED',
    gestationalAge: input.gestationalAge,
    babyCount: input.babyCount,
    maternalOutcome: input.maternalOutcome || 'Pending',
    notes: input.notes,
    createdAt: HOSPITAL_NOW_ISO,
    updatedAt: HOSPITAL_NOW_ISO,
  };
  _deliveries.unshift(record);
  logActivity('DELIVERY_RECORDED', `Delivery recorded for ${getMotherName(record.motherId)}.`, record.id);
  return simulateLatency(clone(record));
}

export async function updateDeliveryRecord(
  id: string,
  patch: Partial<Omit<DeliveryRecord, 'id' | 'hospitalId' | 'createdAt'>>
): Promise<DeliveryRecord> {
  const record = _deliveries.find((d) => d.id === id);
  if (!record) throw new Error(`Delivery record ${id} not found.`);
  Object.assign(record, patch, { updatedAt: HOSPITAL_NOW_ISO });
  return simulateLatency(clone(record));
}

// --- Neonatal Records ----------------------------------------------------

export interface NeonatalRecordView extends NeonatalRecord {
  motherName: string;
  bedLabel?: string;
}

export interface NeonatalFilters {
  status?: NeonatalStatus;
  careLevel?: NeonatalCareLevel;
  search?: string;
}

export async function getNeonatalRecords(filters: NeonatalFilters = {}): Promise<NeonatalRecordView[]> {
  let results: NeonatalRecordView[] = _neonatal
    .filter((n) => n.hospitalId === _hospital.id)
    .map((n) => ({
      ...n,
      motherName: getMotherName(n.motherId),
      bedLabel: n.bedId ? _beds.find((b) => b.id === n.bedId)?.bedNumber : undefined,
    }));

  if (filters.status) results = results.filter((n) => n.status === filters.status);
  if (filters.careLevel) results = results.filter((n) => n.careLevel === filters.careLevel);
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter((n) => n.motherName.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
  }

  return simulateLatency(clone(results).sort((a, b) => b.admissionDate.localeCompare(a.admissionDate)));
}

// --- Beds --------------------------------------------------------------

export interface HospitalBedView extends HospitalBed {
  patientName?: string;
}

export interface BedFilters {
  ward?: string;
  bedType?: BedType;
  status?: BedStatus;
}

export async function getHospitalBeds(filters: BedFilters = {}): Promise<HospitalBedView[]> {
  let results: HospitalBedView[] = _beds
    .filter((b) => b.hospitalId === _hospital.id)
    .map((b) => ({
      ...b,
      patientName: b.patientId ? getMotherName(_patients.find((p) => p.id === b.patientId)?.motherId || '') : undefined,
    }));

  if (filters.ward) results = results.filter((b) => b.ward === filters.ward);
  if (filters.bedType) results = results.filter((b) => b.bedType === filters.bedType);
  if (filters.status) results = results.filter((b) => b.status === filters.status);

  return simulateLatency(clone(results).sort((a, b) => a.bedNumber.localeCompare(b.bedNumber)));
}

/**
 * Changes a bed's status through the service layer (never directly in a
 * component) so the "Available beds can't have a patientId" invariant is
 * enforced in exactly one place.
 */
export async function updateBedStatus(bedId: string, status: BedStatus, patientId?: string): Promise<HospitalBed> {
  const bed = _beds.find((b) => b.id === bedId);
  if (!bed) throw new Error(`Bed ${bedId} not found.`);

  const canHavePatient = status === 'OCCUPIED' || status === 'RESERVED';
  if (!canHavePatient && patientId) {
    throw new Error('Only Occupied or Reserved beds may have an assigned patient.');
  }

  // Clear the bed reference on the previously linked patient, if any.
  if (bed.patientId && bed.patientId !== patientId) {
    const previousPatient = _patients.find((p) => p.id === bed.patientId);
    if (previousPatient) previousPatient.bedId = undefined;
  }

  bed.status = status;
  bed.patientId = canHavePatient ? patientId : undefined;
  bed.lastUpdatedAt = HOSPITAL_NOW_ISO;

  if (bed.patientId) {
    const patient = _patients.find((p) => p.id === bed.patientId);
    if (patient) patient.bedId = bed.id;
  }

  logActivity('BED_STATUS_CHANGED', `Bed ${bed.bedNumber} (${bed.ward}) marked ${statusLabel(status)}.`, bed.id);
  return simulateLatency(clone(bed));
}

const statusLabel = (status: BedStatus): string =>
  status.charAt(0) + status.slice(1).toLowerCase();

// --- Vaccines / Cold Chain -----------------------------------------------

export interface VaccineFilters {
  status?: VaccineInventoryStatus;
  vaccineCode?: string;
  batchNumber?: string;
  search?: string;
}

export async function getVaccineInventory(filters: VaccineFilters = {}): Promise<VaccineInventoryItem[]> {
  let results = _vaccines.filter((v) => v.hospitalId === _hospital.id);

  if (filters.status) results = results.filter((v) => v.status === filters.status);
  if (filters.vaccineCode) results = results.filter((v) => v.vaccineCode === filters.vaccineCode);
  if (filters.batchNumber) results = results.filter((v) => v.batchNumber === filters.batchNumber);
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter(
      (v) => v.vaccineName.toLowerCase().includes(q) || v.batchNumber.toLowerCase().includes(q)
    );
  }

  return simulateLatency(clone(results).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)));
}

export interface ReceiveVaccineStockInput {
  vaccineName: string;
  vaccineCode: string;
  batchNumber: string;
  manufacturer: string;
  quantityReceived: number;
  expiryDate: string;
  storageLocation: string;
  minTemperature: number;
  maxTemperature: number;
}

export async function receiveVaccineStock(input: ReceiveVaccineStockInput): Promise<VaccineInventoryItem> {
  if (input.quantityReceived < 0) throw new Error('Quantity cannot be negative.');
  if (Number.isNaN(Date.parse(input.expiryDate))) throw new Error('Expiry date is invalid.');

  const item: VaccineInventoryItem = {
    id: nextId('vinv', _vaccines),
    hospitalId: _hospital.id,
    vaccineName: input.vaccineName,
    vaccineCode: input.vaccineCode,
    batchNumber: input.batchNumber,
    manufacturer: input.manufacturer,
    quantityReceived: input.quantityReceived,
    quantityAvailable: input.quantityReceived,
    expiryDate: input.expiryDate,
    storageLocation: input.storageLocation,
    minTemperature: input.minTemperature,
    maxTemperature: input.maxTemperature,
    currentTemperature: (input.minTemperature + input.maxTemperature) / 2,
    temperatureStatus: 'NORMAL',
    receivedDate: HOSPITAL_TODAY_ISO,
    status: 'AVAILABLE',
  };
  _vaccines.unshift(item);
  logActivity('VACCINE_BATCH_RECEIVED', `Received ${item.quantityReceived} doses of ${item.vaccineName}, batch ${item.batchNumber}.`, item.id);
  return simulateLatency(clone(item));
}

/**
 * Adjusts the available quantity for a batch and re-derives its status from
 * the new quantity (unless the batch is EXPIRED or QUARANTINED, which only
 * `updateVaccineInventoryStatus` can change).
 */
export async function adjustVaccineQuantity(
  id: string,
  quantityAvailable: number,
  lowStockThreshold = _settings.operational.lowStockThreshold
): Promise<VaccineInventoryItem> {
  if (quantityAvailable < 0) throw new Error('Quantity cannot be negative.');
  const item = _vaccines.find((v) => v.id === id);
  if (!item) throw new Error(`Vaccine batch ${id} not found.`);

  item.quantityAvailable = quantityAvailable;
  if (item.status !== 'EXPIRED' && item.status !== 'QUARANTINED') {
    item.status = quantityAvailable <= lowStockThreshold ? 'LOW_STOCK' : 'AVAILABLE';
  }
  return simulateLatency(clone(item));
}

export async function updateVaccineInventoryStatus(
  id: string,
  status: VaccineInventoryStatus
): Promise<VaccineInventoryItem> {
  const item = _vaccines.find((v) => v.id === id);
  if (!item) throw new Error(`Vaccine batch ${id} not found.`);
  item.status = status;
  return simulateLatency(clone(item));
}

// --- Referrals ---------------------------------------------------------

const REFERRAL_TRANSITIONS: Record<ReferralStatus, ReferralStatus[]> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export const canTransitionReferral = (from: ReferralStatus, to: ReferralStatus): boolean =>
  REFERRAL_TRANSITIONS[from].includes(to);

export interface ReferralAction {
  label: string;
  nextStatus: ReferralStatus;
  tone: 'default' | 'danger';
}

const REFERRAL_ACTION_LABELS: Record<ReferralStatus, ReferralAction> = {
  PENDING: { label: 'Mark Pending', nextStatus: 'PENDING', tone: 'default' },
  ACCEPTED: { label: 'Accept', nextStatus: 'ACCEPTED', tone: 'default' },
  IN_TRANSIT: { label: 'Mark In Transit', nextStatus: 'IN_TRANSIT', tone: 'default' },
  COMPLETED: { label: 'Mark Completed', nextStatus: 'COMPLETED', tone: 'default' },
  REJECTED: { label: 'Reject', nextStatus: 'REJECTED', tone: 'danger' },
  CANCELLED: { label: 'Cancel', nextStatus: 'CANCELLED', tone: 'danger' },
};

export const getAvailableReferralActions = (status: ReferralStatus): ReferralAction[] =>
  REFERRAL_TRANSITIONS[status].map((next) => REFERRAL_ACTION_LABELS[next]);

export interface ReferralFilters {
  status?: ReferralStatus;
  priority?: ReferralPriority;
  search?: string;
}

export async function getReferrals(filters: ReferralFilters = {}): Promise<HospitalReferral[]> {
  let results = _referrals.filter((r) => r.hospitalId === _hospital.id);

  if (filters.status) results = results.filter((r) => r.status === filters.status);
  if (filters.priority) results = results.filter((r) => r.priority === filters.priority);
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter(
      (r) => getMotherName(r.motherId).toLowerCase().includes(q) || r.reason.toLowerCase().includes(q)
    );
  }

  return simulateLatency(clone(results).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export interface CreateReferralInput {
  motherId: string;
  toHospitalId: string;
  toHospitalName: string;
  referringDoctorId: string;
  reason: string;
  priority: ReferralPriority;
  notes?: string;
}

export async function createReferral(input: CreateReferralInput): Promise<HospitalReferral> {
  const referral: HospitalReferral = {
    id: nextId('ref', _referrals),
    hospitalId: _hospital.id,
    motherId: input.motherId,
    fromHospitalId: _hospital.id,
    toHospitalId: input.toHospitalId,
    toHospitalName: input.toHospitalName,
    referringDoctorId: input.referringDoctorId,
    reason: input.reason,
    priority: input.priority,
    status: 'PENDING',
    createdAt: HOSPITAL_NOW_ISO,
    updatedAt: HOSPITAL_NOW_ISO,
    notes: input.notes,
  };
  _referrals.unshift(referral);
  logActivity('REFERRAL_CREATED', `Referral created for ${getMotherName(referral.motherId)} to ${referral.toHospitalName}.`, referral.id);
  return simulateLatency(clone(referral));
}

export async function updateReferralStatus(id: string, nextStatus: ReferralStatus): Promise<HospitalReferral> {
  const referral = _referrals.find((r) => r.id === id);
  if (!referral) throw new Error(`Referral ${id} not found.`);
  if (!canTransitionReferral(referral.status, nextStatus)) {
    throw new Error(`Cannot move a referral from ${referral.status} to ${nextStatus}.`);
  }
  referral.status = nextStatus;
  referral.updatedAt = HOSPITAL_NOW_ISO;
  return simulateLatency(clone(referral));
}

// --- Reports -----------------------------------------------------------

const REPORT_TYPE_LABELS: Record<HospitalReportType, string> = {
  DELIVERY: 'Delivery Report',
  MATERNAL_CARE: 'Maternal Care Report',
  NEONATAL: 'Neonatal Report',
  BED_UTILIZATION: 'Bed Utilization Report',
  VACCINE_INVENTORY: 'Vaccine Inventory Report',
  REFERRAL: 'Referral Report',
};

function buildReportForType(request: HospitalReportRequest): Pick<HospitalReport, 'summary' | 'data'> {
  const inRange = (date: string) => date >= request.startDate && date <= request.endDate;

  switch (request.reportType) {
    case 'DELIVERY': {
      const rows = _deliveries.filter((d) => inRange(d.deliveryDate));
      const completed = rows.filter((d) => d.status === 'COMPLETED');
      const cSections = completed.filter((d) => d.deliveryType === 'C_SECTION');
      return {
        summary: [
          { label: 'Total Deliveries', value: String(rows.length) },
          { label: 'Completed', value: String(completed.length) },
          { label: 'C-Section Rate', value: completed.length ? `${Math.round((cSections.length / completed.length) * 100)}%` : '—' },
        ],
        data: rows.map((d) => ({
          Delivery: d.id,
          Mother: getMotherName(d.motherId),
          Date: d.deliveryDate,
          Type: d.deliveryType,
          Status: d.status,
        })),
      };
    }
    case 'MATERNAL_CARE': {
      const rows = _patients.filter((p) => inRange(p.admissionDate));
      return {
        summary: [
          { label: 'Admissions in Range', value: String(rows.length) },
          { label: 'High Risk', value: String(rows.filter((p) => p.riskLevel === 'HIGH').length) },
          { label: 'Currently Admitted', value: String(rows.filter((p) => p.status === 'ADMITTED').length) },
        ],
        data: rows.map((p) => ({
          Patient: p.id,
          Mother: getMotherName(p.motherId),
          Status: p.status,
          Risk: p.riskLevel,
          Admitted: p.admissionDate,
        })),
      };
    }
    case 'NEONATAL': {
      const rows = _neonatal.filter((n) => inRange(n.admissionDate));
      return {
        summary: [
          { label: 'Neonatal Admissions', value: String(rows.length) },
          { label: 'NICU Care', value: String(rows.filter((n) => n.careLevel === 'NICU').length) },
          { label: 'Critical', value: String(rows.filter((n) => n.status === 'CRITICAL').length) },
        ],
        data: rows.map((n) => ({
          Record: n.id,
          Mother: getMotherName(n.motherId),
          CareLevel: n.careLevel,
          Status: n.status,
          BirthWeightKg: n.birthWeightKg,
        })),
      };
    }
    case 'BED_UTILIZATION': {
      const total = _beds.length;
      const occupied = _beds.filter((b) => b.status === 'OCCUPIED').length;
      return {
        summary: [
          { label: 'Total Beds', value: String(total) },
          { label: 'Occupied', value: String(occupied) },
          { label: 'Utilization', value: total ? `${Math.round((occupied / total) * 100)}%` : '—' },
        ],
        data: _beds.map((b) => ({ Bed: b.bedNumber, Ward: b.ward, Type: b.bedType, Status: b.status })),
      };
    }
    case 'VACCINE_INVENTORY': {
      const rows = _vaccines.filter((v) => inRange(v.receivedDate));
      return {
        summary: [
          { label: 'Batches Received in Range', value: String(rows.length) },
          { label: 'Total Doses Available', value: String(_vaccines.reduce((sum, v) => sum + v.quantityAvailable, 0)) },
          { label: 'Low Stock Batches', value: String(_vaccines.filter((v) => v.status === 'LOW_STOCK').length) },
        ],
        data: _vaccines.map((v) => ({
          Vaccine: v.vaccineName,
          Batch: v.batchNumber,
          Available: v.quantityAvailable,
          Status: v.status,
          Expiry: v.expiryDate,
        })),
      };
    }
    case 'REFERRAL': {
      const rows = _referrals.filter((r) => inRange(r.createdAt.slice(0, 10)));
      return {
        summary: [
          { label: 'Referrals in Range', value: String(rows.length) },
          { label: 'Emergency Priority', value: String(rows.filter((r) => r.priority === 'EMERGENCY').length) },
          { label: 'Completed', value: String(rows.filter((r) => r.status === 'COMPLETED').length) },
        ],
        data: rows.map((r) => ({
          Referral: r.id,
          Mother: getMotherName(r.motherId),
          Priority: r.priority,
          Status: r.status,
          To: r.toHospitalName,
        })),
      };
    }
    default:
      return { summary: [], data: [] };
  }
}

let reportSequence = 0;

export async function getHospitalReports(request: HospitalReportRequest): Promise<HospitalReport> {
  reportSequence += 1;
  const { summary, data } = buildReportForType(request);
  const report: HospitalReport = {
    reportId: `hrpt_${String(reportSequence).padStart(3, '0')}`,
    hospitalId: request.hospitalId,
    reportType: request.reportType,
    generatedAt: HOSPITAL_NOW_ISO,
    startDate: request.startDate,
    endDate: request.endDate,
    summary,
    data,
  };
  return simulateLatency(report);
}

export const getHospitalReportTypeLabel = (type: HospitalReportType): string => REPORT_TYPE_LABELS[type];

// --- Settings ------------------------------------------------------------

interface HospitalSettingsRowShape {
  hospital_id: string;
  facility: Partial<HospitalSettings['facility']> | null;
  notifications: Partial<HospitalSettings['notifications']> | null;
  operational: Partial<HospitalSettings['operational']> | null;
  privacy: Partial<HospitalSettings['privacy']> | null;
}

// A hospital account with no settings row yet is normal (no *_settings row
// is created at registration — see settingsService.ts) — every missing
// section falls back to this app's existing mock defaults, not an invented
// value. Also updates the local `_settings` cache below, since
// adjustVaccineQuantity() (Vaccines module, out of scope for this part)
// still reads its default lowStockThreshold from it — keeping it in sync
// means that untouched module keeps seeing whatever was actually saved.
function mergeHospitalSettings(row: HospitalSettingsRowShape | null): HospitalSettings {
  return {
    hospitalId: row?.hospital_id ?? defaultHospitalSettings.hospitalId,
    facility: { ...defaultHospitalSettings.facility, ...(row?.facility ?? {}) },
    notifications: { ...defaultHospitalSettings.notifications, ...(row?.notifications ?? {}) },
    operational: { ...defaultHospitalSettings.operational, ...(row?.operational ?? {}) },
    privacy: { ...defaultHospitalSettings.privacy, ...(row?.privacy ?? {}) },
  };
}

export async function getHospitalSettings(): Promise<HospitalSettings> {
  const body = await get('/hospital/settings');
  _settings = mergeHospitalSettings(body.settings as HospitalSettingsRowShape | null);
  return clone(_settings);
}

export async function updateHospitalSettings(patch: Partial<HospitalSettings>): Promise<HospitalSettings> {
  const body = await patchRequest('/hospital/settings', patch);
  _settings = mergeHospitalSettings(body.settings as HospitalSettingsRowShape | null);
  return clone(_settings);
}
