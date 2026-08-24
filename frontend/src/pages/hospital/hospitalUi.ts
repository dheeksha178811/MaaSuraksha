import {
  AlertTriangle,
  ArrowRightLeft,
  Baby,
  BedDouble,
  ClipboardList,
  HeartPulse,
  LucideIcon,
  Syringe,
  UserPlus,
} from 'lucide-react';
import {
  AlertSeverity,
  BedStatus,
  BedType,
  DeliveryStatus,
  DeliveryType,
  HospitalActivityType,
  HospitalAlertType,
  HospitalCareType,
  NeonatalCareLevel,
  NeonatalStatus,
  PatientCareStatus,
  ReferralPriority,
  ReferralStatus,
  TemperatureStatus,
  VaccineInventoryStatus,
} from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

// Reused across the Doctor and Hospital portals — both operate on the same
// `PatientRiskLevel` union, so this stays a single source of truth rather
// than a second copy of the same three-value mapping.
export { getRiskBadgeVariant, formatClinicalTimestamp } from '@/pages/doctor/doctorUi';

// --- Patient care status -----------------------------------------------

export const PATIENT_STATUS_LABELS: Record<PatientCareStatus, string> = {
  ADMITTED: 'Admitted',
  OUTPATIENT: 'Outpatient',
  DISCHARGED: 'Discharged',
  TRANSFERRED: 'Transferred',
  POSTPARTUM: 'Postpartum',
};

export const getPatientStatusBadgeVariant = (status: PatientCareStatus): BadgeVariant => {
  switch (status) {
    case 'ADMITTED':
      return 'sandal';
    case 'OUTPATIENT':
      return 'outline';
    case 'DISCHARGED':
      return 'sage';
    case 'TRANSFERRED':
      return 'peach';
    case 'POSTPARTUM':
      return 'warm';
    default:
      return 'outline';
  }
};

export const CARE_TYPE_LABELS: Record<HospitalCareType, string> = {
  ANTENATAL: 'Antenatal',
  DELIVERY: 'Delivery',
  POSTNATAL: 'Postnatal',
  NEONATAL: 'Neonatal',
  GENERAL: 'General',
};

// --- Deliveries ----------------------------------------------------------

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  VAGINAL: 'Vaginal',
  C_SECTION: 'C-Section',
  ASSISTED: 'Assisted',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const getDeliveryStatusBadgeVariant = (status: DeliveryStatus): BadgeVariant => {
  switch (status) {
    case 'SCHEDULED':
      return 'sandal';
    case 'IN_PROGRESS':
      return 'peach';
    case 'COMPLETED':
      return 'sage';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'outline';
  }
};

// --- Neonatal ------------------------------------------------------------

export const NEONATAL_CARE_LEVEL_LABELS: Record<NeonatalCareLevel, string> = {
  ROUTINE: 'Routine',
  OBSERVATION: 'Observation',
  NICU: 'NICU',
  SPECIAL_CARE: 'Special Care',
};

export const NEONATAL_STATUS_LABELS: Record<NeonatalStatus, string> = {
  STABLE: 'Stable',
  OBSERVATION: 'Observation',
  CRITICAL: 'Critical',
  DISCHARGED: 'Discharged',
  TRANSFERRED: 'Transferred',
};

export const getNeonatalStatusBadgeVariant = (status: NeonatalStatus): BadgeVariant => {
  switch (status) {
    case 'STABLE':
      return 'sage';
    case 'OBSERVATION':
      return 'sandal';
    case 'CRITICAL':
      return 'danger';
    case 'DISCHARGED':
      return 'outline';
    case 'TRANSFERRED':
      return 'peach';
    default:
      return 'outline';
  }
};

// --- Beds ------------------------------------------------------------------

export const BED_TYPE_LABELS: Record<BedType, string> = {
  GENERAL: 'General',
  MATERNITY: 'Maternity',
  POSTNATAL: 'Postnatal',
  NICU: 'NICU',
  EMERGENCY: 'Emergency',
};

export const BED_STATUS_LABELS: Record<BedStatus, string> = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  MAINTENANCE: 'Maintenance',
};

export const getBedStatusBadgeVariant = (status: BedStatus): BadgeVariant => {
  switch (status) {
    case 'AVAILABLE':
      return 'sage';
    case 'OCCUPIED':
      return 'sandal';
    case 'RESERVED':
      return 'peach';
    case 'MAINTENANCE':
      return 'danger';
    default:
      return 'outline';
  }
};

// --- Vaccines / Cold Chain -------------------------------------------------

export const VACCINE_STATUS_LABELS: Record<VaccineInventoryStatus, string> = {
  AVAILABLE: 'Available',
  LOW_STOCK: 'Low Stock',
  EXPIRED: 'Expired',
  QUARANTINED: 'Quarantined',
};

export const getVaccineStatusBadgeVariant = (status: VaccineInventoryStatus): BadgeVariant => {
  switch (status) {
    case 'AVAILABLE':
      return 'sage';
    case 'LOW_STOCK':
      return 'sandal';
    case 'EXPIRED':
      return 'danger';
    case 'QUARANTINED':
      return 'peach';
    default:
      return 'outline';
  }
};

export const TEMPERATURE_STATUS_LABELS: Record<TemperatureStatus, string> = {
  NORMAL: 'Normal',
  WARNING: 'Warning',
  CRITICAL: 'Critical',
};

export const getTemperatureStatusBadgeVariant = (status: TemperatureStatus): BadgeVariant => {
  switch (status) {
    case 'NORMAL':
      return 'sage';
    case 'WARNING':
      return 'sandal';
    case 'CRITICAL':
      return 'danger';
    default:
      return 'outline';
  }
};

// --- Referrals ---------------------------------------------------------

export const REFERRAL_PRIORITY_LABELS: Record<ReferralPriority, string> = {
  ROUTINE: 'Routine',
  URGENT: 'Urgent',
  EMERGENCY: 'Emergency',
};

export const getReferralPriorityBadgeVariant = (priority: ReferralPriority): BadgeVariant => {
  switch (priority) {
    case 'ROUTINE':
      return 'outline';
    case 'URGENT':
      return 'sandal';
    case 'EMERGENCY':
      return 'danger';
    default:
      return 'outline';
  }
};

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  IN_TRANSIT: 'In Transit',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export const getReferralStatusBadgeVariant = (status: ReferralStatus): BadgeVariant => {
  switch (status) {
    case 'PENDING':
      return 'sandal';
    case 'ACCEPTED':
      return 'peach';
    case 'IN_TRANSIT':
      return 'warm';
    case 'COMPLETED':
      return 'sage';
    case 'REJECTED':
    case 'CANCELLED':
      return 'danger';
    default:
      return 'outline';
  }
};

// --- Alerts --------------------------------------------------------------

export const ALERT_TYPE_LABELS: Record<HospitalAlertType, string> = {
  BED_CAPACITY: 'Bed Capacity',
  VACCINE_STOCK: 'Vaccine Stock',
  HIGH_RISK_REFERRAL: 'High-Risk Referral',
  NEONATAL_BED_SHORTAGE: 'Neonatal Bed Shortage',
  FOLLOW_UP_REQUIRED: 'Follow-up Required',
};

export const getAlertSeverityBadgeVariant = (severity: AlertSeverity): BadgeVariant => {
  switch (severity) {
    case 'INFO':
      return 'outline';
    case 'WARNING':
      return 'sandal';
    case 'CRITICAL':
      return 'danger';
    default:
      return 'outline';
  }
};

export const getAlertTypeIcon = (type: HospitalAlertType): LucideIcon => {
  switch (type) {
    case 'BED_CAPACITY':
      return BedDouble;
    case 'VACCINE_STOCK':
      return Syringe;
    case 'HIGH_RISK_REFERRAL':
      return ArrowRightLeft;
    case 'NEONATAL_BED_SHORTAGE':
      return AlertTriangle;
    case 'FOLLOW_UP_REQUIRED':
      return ClipboardList;
    default:
      return AlertTriangle;
  }
};

// --- Activity --------------------------------------------------------------

export const ACTIVITY_TYPE_LABELS: Record<HospitalActivityType, string> = {
  MOTHER_ADMITTED: 'Mother Admitted',
  DELIVERY_RECORDED: 'Delivery Recorded',
  NEONATAL_ADMISSION: 'Neonatal Admission',
  REFERRAL_CREATED: 'Referral Created',
  VACCINE_BATCH_RECEIVED: 'Vaccine Batch Received',
  BED_STATUS_CHANGED: 'Bed Status Changed',
};

export const getActivityTypeIcon = (type: HospitalActivityType): LucideIcon => {
  switch (type) {
    case 'MOTHER_ADMITTED':
      return UserPlus;
    case 'DELIVERY_RECORDED':
      return Baby;
    case 'NEONATAL_ADMISSION':
      return HeartPulse;
    case 'REFERRAL_CREATED':
      return ArrowRightLeft;
    case 'VACCINE_BATCH_RECEIVED':
      return Syringe;
    case 'BED_STATUS_CHANGED':
      return BedDouble;
    default:
      return ClipboardList;
  }
};
