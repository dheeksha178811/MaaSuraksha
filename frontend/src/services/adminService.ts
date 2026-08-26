// ---------------------------------------------------------------------------
// Admin Service (Module 7)
//
//   COMPONENT
//     ↓
//   adminService.ts   <-- you are here
//     ↓
//   src/data/adminMockData.ts (mock data NOW, itself aggregating the
//     existing Hospital/Doctor mock data rather than duplicating it)
//     ↓ (future)
//   fetch('/api/admin/...') → Node.js/Express → MongoDB
//
// Admin pages only ever call the functions exported from this file — never
// the raw arrays in `adminMockData.ts` directly. Mirrors the same
// in-memory-store pattern as `hospitalService.ts` so acknowledging an alert
// or updating a high-risk case's status persists for the session exactly
// like a real API call would.
//
// getAdminSettings/updateAdminSettings/getAdminProfile/updateAdminProfile
// now ARE real fetch calls, against /api/admin/settings and
// /api/admin/profile (admin_settings / admin_profiles). Every other export
// below — facilities, program overview, maternal analytics, immunization,
// high-risk monitoring, alerts, dashboard, reports — is still the
// in-memory mock store, unaffected by this change. getAdminProfile/
// updateAdminProfile have no frontend consumer yet: /admin/profile still
// renders AdminPlaceholderPage ("Coming in Module 7") — there is no real
// profile form in this app to wire them into.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';
import {
  ADMIN_NOW_ISO,
  adminAlerts,
  defaultAdminSettings,
  facilities,
  getFacilityName,
  highRiskCases,
  immunizationCoverage,
} from '@/data/adminMockData';
import {
  AdminAlert,
  AdminAlertType,
  AdminReport,
  AdminReportRequest,
  AdminReportType,
  AdminSettings,
  Facility,
  FacilityType,
  HighRiskCase,
  HighRiskCaseStatus,
  HospitalAlertStatus,
  HospitalOperationalStatus,
  ImmunizationCoverageStat,
  MaternalAnalyticsSnapshot,
  PatientRiskLevel,
  ProgramOverviewSummary,
} from '@/types';

// --- Real backend client (profile/settings only — see header note) ---------

export class NotAuthenticatedError extends AuthApiError {}

function getToken(): string {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
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

// --- In-memory store (seeded once from the mock data module) ---------------

const _facilities: Facility[] = clone(facilities);
const _highRiskCases: HighRiskCase[] = clone(highRiskCases);
const _alerts: AdminAlert[] = clone(adminAlerts);
const _immunization: ImmunizationCoverageStat[] = clone(immunizationCoverage);
let _settings: AdminSettings = clone(defaultAdminSettings);

// --- Facilities --------------------------------------------------------

export interface FacilityFilters {
  status?: HospitalOperationalStatus;
  facilityType?: FacilityType;
  search?: string;
}

export async function getFacilities(filters: FacilityFilters = {}): Promise<Facility[]> {
  let results = _facilities.slice();
  if (filters.status) results = results.filter((f) => f.status === filters.status);
  if (filters.facilityType) results = results.filter((f) => f.facilityType === filters.facilityType);
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter((f) => f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q));
  }
  return simulateLatency(clone(results).sort((a, b) => a.name.localeCompare(b.name)));
}

export async function getFacilityById(id: string): Promise<Facility | undefined> {
  const facility = _facilities.find((f) => f.id === id);
  return simulateLatency(facility ? clone(facility) : undefined);
}

// --- Program Overview ----------------------------------------------------

export async function getProgramOverview(): Promise<ProgramOverviewSummary> {
  const summary: ProgramOverviewSummary = {
    totalFacilities: _facilities.length,
    activeFacilities: _facilities.filter((f) => f.status === 'ACTIVE').length,
    totalRegisteredMothers: _facilities.reduce((sum, f) => sum + f.registeredMothers, 0),
    totalDoctors: _facilities.reduce((sum, f) => sum + f.doctorCount, 0),
    activePregnancies: _facilities.reduce((sum, f) => sum + f.activePregnancies, 0),
    deliveriesThisMonth: _facilities.reduce((sum, f) => sum + f.deliveriesThisMonth, 0),
    highRiskCasesCount: _highRiskCases.filter((c) => c.status !== 'RESOLVED').length,
  };
  return simulateLatency(summary);
}

// --- Maternal Analytics ----------------------------------------------------

export async function getMaternalAnalytics(): Promise<MaternalAnalyticsSnapshot> {
  const totalRegistered = _facilities.reduce((sum, f) => sum + f.registeredMothers, 0);
  const totalActive = _facilities.reduce((sum, f) => sum + f.activePregnancies, 0);
  // Uses the same facility-level `highRiskCases` figures as the Facilities
  // and Program Overview pages (population-scale aggregates), not the small
  // individually-tracked case list — dividing that handful of sample records
  // by the full registered-mother population produced a misleadingly tiny
  // percentage (~0.4%) unrelated to what the rest of the app reports.
  const highRiskAggregate = _facilities.reduce((sum, f) => sum + f.highRiskCases, 0);

  const snapshot: MaternalAnalyticsSnapshot = {
    totalPregnanciesTracked: totalActive,
    antenatalCoveragePercent: 88,
    institutionalDeliveryPercent: 96,
    highRiskPercent: totalRegistered ? Math.round((highRiskAggregate / totalRegistered) * 1000) / 10 : 0,
    deliveryTypeBreakdown: [
      { label: 'Vaginal', value: 62 },
      { label: 'C-Section', value: 34 },
      { label: 'Assisted', value: 4 },
    ],
    maternalOutcomeBreakdown: [
      { label: 'Stable', value: 91 },
      { label: 'Under Observation', value: 7 },
      { label: 'Critical', value: 2 },
    ],
  };
  return simulateLatency(snapshot);
}

// --- Immunization ----------------------------------------------------------

export async function getImmunizationCoverage(): Promise<ImmunizationCoverageStat[]> {
  return simulateLatency(clone(_immunization).sort((a, b) => a.covered / a.targetPopulation - b.covered / b.targetPopulation));
}

// --- High-Risk Monitoring ----------------------------------------------

export interface HighRiskFilters {
  status?: HighRiskCaseStatus;
  riskLevel?: PatientRiskLevel;
  facilityId?: string;
  search?: string;
}

export async function getHighRiskCases(filters: HighRiskFilters = {}): Promise<HighRiskCase[]> {
  let results = _highRiskCases.slice();
  if (filters.status) results = results.filter((c) => c.status === filters.status);
  if (filters.riskLevel) results = results.filter((c) => c.riskLevel === filters.riskLevel);
  if (filters.facilityId) results = results.filter((c) => c.hospitalId === filters.facilityId);
  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter((c) => c.motherName.toLowerCase().includes(q));
  }
  return simulateLatency(clone(results).sort((a, b) => b.flaggedAt.localeCompare(a.flaggedAt)));
}

export async function updateHighRiskCaseStatus(id: string, status: HighRiskCaseStatus): Promise<HighRiskCase> {
  const record = _highRiskCases.find((c) => c.id === id);
  if (!record) throw new Error(`High-risk case ${id} not found.`);
  record.status = status;
  record.updatedAt = ADMIN_NOW_ISO.slice(0, 10);
  return simulateLatency(clone(record));
}

// --- Alerts --------------------------------------------------------------

export interface AdminAlertFilters {
  status?: HospitalAlertStatus;
  severity?: AdminAlert['severity'];
  type?: AdminAlertType;
}

export async function getAdminAlerts(filters: AdminAlertFilters = {}): Promise<AdminAlert[]> {
  let results = _alerts.slice();
  if (filters.status) results = results.filter((a) => a.status === filters.status);
  if (filters.severity) results = results.filter((a) => a.severity === filters.severity);
  if (filters.type) results = results.filter((a) => a.type === filters.type);
  return simulateLatency(clone(results).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function acknowledgeAlert(id: string): Promise<AdminAlert> {
  const alert = _alerts.find((a) => a.id === id);
  if (!alert) throw new Error(`Alert ${id} not found.`);
  alert.status = 'ACKNOWLEDGED';
  return simulateLatency(clone(alert));
}

export async function resolveAlert(id: string): Promise<AdminAlert> {
  const alert = _alerts.find((a) => a.id === id);
  if (!alert) throw new Error(`Alert ${id} not found.`);
  alert.status = 'RESOLVED';
  return simulateLatency(clone(alert));
}

// --- Dashboard -----------------------------------------------------------

export interface AdminDashboardData {
  overview: ProgramOverviewSummary;
  alerts: AdminAlert[];
  topFacilities: Facility[];
  activeHighRiskCases: HighRiskCase[];
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const overview = await getProgramOverview();
  return simulateLatency({
    overview,
    alerts: clone(_alerts.filter((a) => a.status === 'ACTIVE')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    topFacilities: clone(_facilities)
      .sort((a, b) => a.availableBeds / a.totalBeds - b.availableBeds / b.totalBeds)
      .slice(0, 5),
    activeHighRiskCases: clone(_highRiskCases)
      .filter((c) => c.status !== 'RESOLVED')
      .sort((a, b) => b.flaggedAt.localeCompare(a.flaggedAt))
      .slice(0, 5),
  });
}

// --- Reports -----------------------------------------------------------

const REPORT_TYPE_LABELS: Record<AdminReportType, string> = {
  PROGRAM_OVERVIEW: 'Program Overview Report',
  FACILITY_PERFORMANCE: 'Facility Performance Report',
  MATERNAL_ANALYTICS: 'Maternal Analytics Report',
  IMMUNIZATION_COVERAGE: 'Immunization Coverage Report',
  HIGH_RISK_MONITORING: 'High-Risk Monitoring Report',
};

export const getAdminReportTypeLabel = (type: AdminReportType): string => REPORT_TYPE_LABELS[type];

function buildAdminReport(request: AdminReportRequest): Pick<AdminReport, 'summary' | 'data'> {
  const scopedFacilities = request.facilityId ? _facilities.filter((f) => f.id === request.facilityId) : _facilities;

  switch (request.reportType) {
    case 'PROGRAM_OVERVIEW': {
      const registered = scopedFacilities.reduce((sum, f) => sum + f.registeredMothers, 0);
      const deliveries = scopedFacilities.reduce((sum, f) => sum + f.deliveriesThisMonth, 0);
      return {
        summary: [
          { label: 'Facilities', value: String(scopedFacilities.length) },
          { label: 'Registered Mothers', value: String(registered) },
          { label: 'Deliveries This Month', value: String(deliveries) },
        ],
        data: scopedFacilities.map((f) => ({
          Facility: f.name,
          City: f.city,
          RegisteredMothers: f.registeredMothers,
          Status: f.status,
        })),
      };
    }
    case 'FACILITY_PERFORMANCE': {
      return {
        summary: [
          { label: 'Facilities Reviewed', value: String(scopedFacilities.length) },
          {
            label: 'Avg. Bed Occupancy',
            value: scopedFacilities.length
              ? `${Math.round(
                  scopedFacilities.reduce((sum, f) => sum + (f.totalBeds - f.availableBeds) / f.totalBeds, 0) /
                    scopedFacilities.length *
                    100
                )}%`
              : '—',
          },
          { label: 'High-Risk Cases', value: String(scopedFacilities.reduce((sum, f) => sum + f.highRiskCases, 0)) },
        ],
        data: scopedFacilities.map((f) => ({
          Facility: f.name,
          TotalBeds: f.totalBeds,
          AvailableBeds: f.availableBeds,
          Deliveries: f.deliveriesThisMonth,
        })),
      };
    }
    case 'MATERNAL_ANALYTICS': {
      const activePregnancies = scopedFacilities.reduce((sum, f) => sum + f.activePregnancies, 0);
      return {
        summary: [
          { label: 'Active Pregnancies', value: String(activePregnancies) },
          { label: 'Institutional Delivery Rate', value: '96%' },
          { label: 'High-Risk Cases', value: String(scopedFacilities.reduce((sum, f) => sum + f.highRiskCases, 0)) },
        ],
        data: scopedFacilities.map((f) => ({
          Facility: f.name,
          ActivePregnancies: f.activePregnancies,
          HighRiskCases: f.highRiskCases,
        })),
      };
    }
    case 'IMMUNIZATION_COVERAGE': {
      return {
        summary: [
          { label: 'Vaccines Tracked', value: String(_immunization.length) },
          {
            label: 'Avg. Coverage',
            value: `${Math.round(
              (_immunization.reduce((sum, v) => sum + v.covered / v.targetPopulation, 0) / _immunization.length) * 100
            )}%`,
          },
          {
            label: 'Below 85% Target',
            value: String(_immunization.filter((v) => v.covered / v.targetPopulation < 0.85).length),
          },
        ],
        data: _immunization.map((v) => ({
          Vaccine: v.vaccineName,
          Target: v.targetPopulation,
          Covered: v.covered,
          CoveragePercent: `${Math.round((v.covered / v.targetPopulation) * 100)}%`,
        })),
      };
    }
    case 'HIGH_RISK_MONITORING': {
      const scoped = request.facilityId ? _highRiskCases.filter((c) => c.hospitalId === request.facilityId) : _highRiskCases;
      return {
        summary: [
          { label: 'Total Cases', value: String(scoped.length) },
          { label: 'High Risk', value: String(scoped.filter((c) => c.riskLevel === 'HIGH').length) },
          { label: 'Resolved', value: String(scoped.filter((c) => c.status === 'RESOLVED').length) },
        ],
        data: scoped.map((c) => ({
          Mother: c.motherName,
          Facility: getFacilityName(c.hospitalId),
          Risk: c.riskLevel,
          Status: c.status,
        })),
      };
    }
    default:
      return { summary: [], data: [] };
  }
}

let reportSequence = 0;

export async function getAdminReports(request: AdminReportRequest): Promise<AdminReport> {
  reportSequence += 1;
  const { summary, data } = buildAdminReport(request);
  const report: AdminReport = {
    reportId: `arpt_${String(reportSequence).padStart(3, '0')}`,
    reportType: request.reportType,
    generatedAt: ADMIN_NOW_ISO,
    startDate: request.startDate,
    endDate: request.endDate,
    summary,
    data,
  };
  return simulateLatency(report);
}

// --- Profile ---------------------------------------------------------------
// No AdminProfilePage exists yet — /admin/profile still renders
// AdminPlaceholderPage ("Coming in Module 7") — so nothing in this app calls
// these two yet. They're wired to the real backend so a future profile page
// only needs to call them, not build the API client too.

export interface AdminProfileView {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  jurisdictionLevel?: string;
  createdAt: string;
}

interface AdminProfileRowShape {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  jurisdiction_level: string | null;
  created_at: string;
}

function toAdminProfile(row: AdminProfileRowShape): AdminProfileView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    title: row.title ?? undefined,
    jurisdictionLevel: row.jurisdiction_level ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getAdminProfile(): Promise<AdminProfileView> {
  const body = await get('/admin/profile');
  return toAdminProfile(body.profile as AdminProfileRowShape);
}

// Only title/jurisdictionLevel are self-editable — the same whitelist
// updateProfileForRole('admin', ...) enforces at the SQL level.
export type AdminProfileUpdate = Partial<Pick<AdminProfileView, 'title' | 'jurisdictionLevel'>>;

export async function updateAdminProfile(patch: AdminProfileUpdate): Promise<AdminProfileView> {
  const body = await patchRequest('/admin/profile', patch);
  return toAdminProfile(body.profile as AdminProfileRowShape);
}

// --- Settings ------------------------------------------------------------

interface AdminSettingsRowShape {
  admin_id: string;
  notifications: Partial<AdminSettings['notifications']> | null;
  program: Partial<AdminSettings['program']> | null;
  privacy: Partial<AdminSettings['privacy']> | null;
}

// An admin account with no settings row yet is normal (no *_settings row is
// created at registration — see settingsService.ts) — every missing section
// falls back to this app's existing mock defaults, not an invented value.
// Also updates the local `_settings` cache, matching the pattern used for
// hospitalService.ts's equivalent (kept for consistency even though no other
// function in this file currently reads `_settings`).
function mergeAdminSettings(row: AdminSettingsRowShape | null): AdminSettings {
  return {
    adminId: row?.admin_id ?? defaultAdminSettings.adminId,
    notifications: { ...defaultAdminSettings.notifications, ...(row?.notifications ?? {}) },
    program: { ...defaultAdminSettings.program, ...(row?.program ?? {}) },
    privacy: { ...defaultAdminSettings.privacy, ...(row?.privacy ?? {}) },
  };
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const body = await get('/admin/settings');
  _settings = mergeAdminSettings(body.settings as AdminSettingsRowShape | null);
  return clone(_settings);
}

export async function updateAdminSettings(patch: Partial<AdminSettings>): Promise<AdminSettings> {
  const body = await patchRequest('/admin/settings', patch);
  _settings = mergeAdminSettings(body.settings as AdminSettingsRowShape | null);
  return clone(_settings);
}
