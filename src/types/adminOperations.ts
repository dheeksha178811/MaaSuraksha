// ---------------------------------------------------------------------------
// Module 7 — Admin / Program Administration domain.
// Program-level oversight sits ABOVE the existing Hospital (`HospitalProfile`,
// Module 6) and Doctor (`AssignedPatient`) domains rather than duplicating
// them: a `Facility` here is the district-wide directory entry a hospital
// shows up in, and `HighRiskCase.motherId` / `.hospitalId` / `.doctorId`
// reference the same identifiers already used across the app. Every record
// carries a stable id so this can migrate directly to MongoDB collections
// (`facilities`, `highRiskCases`, `adminAlerts`, ...) later.
// ---------------------------------------------------------------------------

import { HospitalOperationalStatus } from './hospital';
import { AlertSeverity, HospitalAlertStatus } from './hospitalOperations';
import { PatientRiskLevel } from './careTeam';

// --- Facilities --------------------------------------------------------

export type FacilityType = 'Government PHC' | 'District Hospital' | 'Private Maternity Center';

export interface Facility {
  id: string;
  name: string;
  facilityType: FacilityType;
  city: string;
  state: string;
  totalBeds: number;
  availableBeds: number;
  registeredMothers: number;
  activePregnancies: number;
  deliveriesThisMonth: number;
  highRiskCases: number;
  doctorCount: number;
  neonatalICUAvailable: boolean;
  status: HospitalOperationalStatus;
  lastReportedAt: string; // ISO datetime
}

// --- Program Overview ----------------------------------------------------

export interface ProgramOverviewSummary {
  totalFacilities: number;
  activeFacilities: number;
  totalRegisteredMothers: number;
  totalDoctors: number;
  activePregnancies: number;
  deliveriesThisMonth: number;
  highRiskCasesCount: number;
}

// --- Maternal Analytics --------------------------------------------------

export interface AnalyticsBreakdownItem {
  label: string;
  value: number; // percent, 0-100
}

export interface MaternalAnalyticsSnapshot {
  totalPregnanciesTracked: number;
  antenatalCoveragePercent: number;
  institutionalDeliveryPercent: number;
  highRiskPercent: number;
  deliveryTypeBreakdown: AnalyticsBreakdownItem[];
  maternalOutcomeBreakdown: AnalyticsBreakdownItem[];
}

// --- Immunization ----------------------------------------------------------

export interface ImmunizationCoverageStat {
  id: string;
  vaccineName: string;
  vaccineCode: string;
  targetPopulation: number;
  covered: number;
}

// --- High-Risk Monitoring ----------------------------------------------

export type HighRiskCaseStatus = 'FLAGGED' | 'UNDER_REVIEW' | 'MONITORING' | 'RESOLVED';

export interface HighRiskCase {
  id: string;
  motherId: string;
  motherName: string; // denormalized display cache — motherId remains the identity
  hospitalId: string;
  doctorId: string;
  riskLevel: PatientRiskLevel;
  riskFactors: string[];
  status: HighRiskCaseStatus;
  flaggedAt: string; // ISO date
  updatedAt: string; // ISO date
  notes?: string;
}

// --- Alerts --------------------------------------------------------------

export type AdminAlertType =
  | 'FACILITY_CAPACITY'
  | 'IMMUNIZATION_COVERAGE'
  | 'HIGH_RISK_CASE'
  | 'FACILITY_REPORTING_OVERDUE'
  | 'REFERRAL_ESCALATION';

export interface AdminAlert {
  id: string;
  type: AdminAlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  facilityId?: string;
  createdAt: string; // ISO datetime
  status: HospitalAlertStatus;
}

// --- Reports -----------------------------------------------------------

export type AdminReportType =
  | 'PROGRAM_OVERVIEW'
  | 'FACILITY_PERFORMANCE'
  | 'MATERNAL_ANALYTICS'
  | 'IMMUNIZATION_COVERAGE'
  | 'HIGH_RISK_MONITORING';

export interface AdminReportRequest {
  reportType: AdminReportType;
  startDate: string;
  endDate: string;
  facilityId?: string;
}

export interface AdminReportSummaryMetric {
  label: string;
  value: string;
}

export interface AdminReport {
  reportId: string;
  reportType: AdminReportType;
  generatedAt: string; // ISO datetime
  startDate: string;
  endDate: string;
  summary: AdminReportSummaryMetric[];
  data: Array<Record<string, string | number>>;
}

// --- Settings ------------------------------------------------------------

export interface AdminNotificationPreferences {
  facilityCapacityAlerts: boolean;
  immunizationCoverageAlerts: boolean;
  highRiskCaseAlerts: boolean;
  referralEscalationAlerts: boolean;
  weeklyDigest: boolean;
}

export interface AdminProgramPreferences {
  defaultFacilityView: 'ALL' | HospitalOperationalStatus;
  defaultAlertFilter: 'ALL' | HospitalAlertStatus;
  highRiskReviewThresholdDays: number;
}

export interface AdminPrivacySecurityPreferences {
  twoFactorEnabled: boolean;
  restrictDataExport: boolean;
}

export interface AdminSettings {
  adminId: string;
  notifications: AdminNotificationPreferences;
  program: AdminProgramPreferences;
  privacy: AdminPrivacySecurityPreferences;
}
