// ---------------------------------------------------------------------------
// Module 6 — Hospital Portal operational domain.
// These types model the facility-side workspace (admissions, deliveries,
// neonatal care, beds, cold-chain vaccine inventory, referrals, reports, and
// settings) for a single `HospitalProfile` (see ./hospital.ts). Every record
// carries a stable id plus its owning `hospitalId`, and cross-references
// existing domain entities (`motherId`, `doctorId`) by id rather than
// duplicating those records, so this can migrate directly to MongoDB
// collections (`hospitalPatients`, `deliveryRecords`, `neonatalRecords`,
// `hospitalBeds`, `vaccineInventory`, `referrals`, ...) later.
// ---------------------------------------------------------------------------

import { Gender } from './child';
import { PatientRiskLevel } from './careTeam';

// --- Hospital Patients / Admissions ----------------------------------------

export type PatientCareStatus = 'ADMITTED' | 'OUTPATIENT' | 'DISCHARGED' | 'TRANSFERRED' | 'POSTPARTUM';

export type HospitalCareType = 'ANTENATAL' | 'DELIVERY' | 'POSTNATAL' | 'NEONATAL' | 'GENERAL';

export interface HospitalPatient {
  id: string;
  hospitalId: string;
  motherId: string;
  doctorId: string;
  status: PatientCareStatus;
  riskLevel: PatientRiskLevel;
  admissionDate: string; // ISO date
  dischargeDate?: string; // ISO date
  careType: HospitalCareType;
  ward: string;
  bedId?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Deliveries --------------------------------------------------------

export type DeliveryType = 'VAGINAL' | 'C_SECTION' | 'ASSISTED';
export type DeliveryStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface DeliveryRecord {
  id: string;
  hospitalId: string;
  motherId: string;
  doctorId: string;
  admissionId?: string; // -> HospitalPatient.id
  deliveryDate: string; // ISO date
  deliveryTime: string; // "HH:mm"
  deliveryType: DeliveryType;
  status: DeliveryStatus;
  gestationalAge: number; // weeks
  babyCount: number;
  maternalOutcome: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Neonatal Care -----------------------------------------------------

export type NeonatalCareLevel = 'ROUTINE' | 'OBSERVATION' | 'NICU' | 'SPECIAL_CARE';
export type NeonatalStatus = 'STABLE' | 'OBSERVATION' | 'CRITICAL' | 'DISCHARGED' | 'TRANSFERRED';

export interface NeonatalRecord {
  id: string;
  hospitalId: string;
  motherId: string;
  deliveryId: string;
  doctorId: string;
  bedId?: string;
  dateOfBirth: string; // ISO date
  gender: Gender;
  birthWeightKg: number;
  gestationalAge: number; // weeks
  careLevel: NeonatalCareLevel;
  status: NeonatalStatus;
  admissionDate: string;
  dischargeDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Beds ----------------------------------------------------------------

export type BedType = 'GENERAL' | 'MATERNITY' | 'POSTNATAL' | 'NICU' | 'EMERGENCY';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export interface HospitalBed {
  id: string;
  hospitalId: string;
  ward: string;
  bedNumber: string;
  bedType: BedType;
  status: BedStatus;
  patientId?: string; // -> HospitalPatient.id; only set when OCCUPIED or RESERVED
  lastUpdatedAt: string;
}

// --- Vaccines / Cold Chain -----------------------------------------------

export type VaccineInventoryStatus = 'AVAILABLE' | 'LOW_STOCK' | 'EXPIRED' | 'QUARANTINED';
export type TemperatureStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface VaccineInventoryItem {
  id: string;
  hospitalId: string;
  vaccineName: string;
  vaccineCode: string;
  batchNumber: string;
  manufacturer: string;
  quantityReceived: number;
  quantityAvailable: number;
  expiryDate: string; // ISO date
  storageLocation: string;
  minTemperature: number; // °C
  maxTemperature: number; // °C
  currentTemperature: number; // °C
  temperatureStatus: TemperatureStatus;
  receivedDate: string; // ISO date
  status: VaccineInventoryStatus;
}

// --- Referrals -------------------------------------------------------------

export type ReferralPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';
export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface HospitalReferral {
  id: string;
  hospitalId: string; // the hospital this referral console/record belongs to
  motherId: string;
  fromHospitalId: string;
  toHospitalId: string;
  toHospitalName: string; // denormalized display cache — toHospitalId remains the identity
  referringDoctorId: string;
  reason: string;
  priority: ReferralPriority;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// --- Reports -----------------------------------------------------------

export type HospitalReportType =
  | 'DELIVERY'
  | 'MATERNAL_CARE'
  | 'NEONATAL'
  | 'BED_UTILIZATION'
  | 'VACCINE_INVENTORY'
  | 'REFERRAL';

export interface HospitalReportRequest {
  hospitalId: string;
  reportType: HospitalReportType;
  startDate: string; // ISO date
  endDate: string; // ISO date
  filters?: Record<string, string>;
}

export interface HospitalReportSummaryMetric {
  label: string;
  value: string;
}

export interface HospitalReport {
  reportId: string;
  hospitalId: string;
  reportType: HospitalReportType;
  generatedAt: string; // ISO datetime
  startDate: string;
  endDate: string;
  summary: HospitalReportSummaryMetric[];
  data: Array<Record<string, string | number>>;
  fileUrl?: string; // reserved for a future generated-document URL
}

// --- Alerts & Activity ------------------------------------------------

export type HospitalAlertType =
  | 'BED_CAPACITY'
  | 'VACCINE_STOCK'
  | 'HIGH_RISK_REFERRAL'
  | 'NEONATAL_BED_SHORTAGE'
  | 'FOLLOW_UP_REQUIRED';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type HospitalAlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface HospitalAlert {
  id: string;
  hospitalId: string;
  type: HospitalAlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  createdAt: string; // ISO datetime
  status: HospitalAlertStatus;
}

export type HospitalActivityType =
  | 'MOTHER_ADMITTED'
  | 'DELIVERY_RECORDED'
  | 'NEONATAL_ADMISSION'
  | 'REFERRAL_CREATED'
  | 'VACCINE_BATCH_RECEIVED'
  | 'BED_STATUS_CHANGED';

export interface HospitalActivityItem {
  id: string;
  hospitalId: string;
  type: HospitalActivityType;
  description: string;
  timestamp: string; // ISO datetime
  relatedId?: string;
}

// --- Dashboard -----------------------------------------------------------

export interface HospitalDashboardSummary {
  registeredMothersCount: number;
  todaysAdmissionsCount: number;
  todaysDeliveriesCount: number;
  neonatalCareCount: number;
  availableBedsCount: number;
  pendingReferralsCount: number;
}

export interface HospitalTodaysOperations {
  admissions: number;
  scheduledDeliveries: number;
  completedDeliveries: number;
  neonatalAdmissions: number;
  discharges: number;
}

export interface HospitalDashboardBundle {
  summary: HospitalDashboardSummary;
  operations: HospitalTodaysOperations;
  alerts: HospitalAlert[];
  activity: HospitalActivityItem[];
}

// --- Settings --------------------------------------------------------------

export interface HospitalFacilityPreferences {
  autoAssignBeds: boolean;
  showBedAvailabilityWidget: boolean;
}

export interface HospitalNotificationPreferences {
  criticalBedAlerts: boolean;
  vaccineStockAlerts: boolean;
  temperatureAlerts: boolean;
  referralAlerts: boolean;
  deliveryNotifications: boolean;
  reportNotifications: boolean;
}

export interface HospitalOperationalPreferences {
  defaultPatientListView: PatientCareStatus | 'ALL';
  defaultReferralView: ReferralStatus | 'ALL';
  lowStockThreshold: number; // doses
}

export interface HospitalPrivacySecurityPreferences {
  twoFactorEnabled: boolean;
  restrictPatientDataExport: boolean;
}

export interface HospitalSettings {
  hospitalId: string;
  facility: HospitalFacilityPreferences;
  notifications: HospitalNotificationPreferences;
  operational: HospitalOperationalPreferences;
  privacy: HospitalPrivacySecurityPreferences;
}
