import {
  AlertTriangle,
  ArrowRightLeft,
  BedDouble,
  ClipboardCheck,
  LucideIcon,
  Syringe,
} from 'lucide-react';
import {
  AdminAlertType,
  AlertSeverity,
  FacilityType,
  HighRiskCaseStatus,
  HospitalAlertStatus,
  HospitalOperationalStatus,
} from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

// Reused across Doctor, Hospital, and Admin — all three operate on the same
// `PatientRiskLevel` union and want the same clinical-timestamp formatting,
// so this stays a single source of truth.
export { getRiskBadgeVariant, formatClinicalTimestamp } from '@/pages/doctor/doctorUi';

// --- Facility status -----------------------------------------------------

export const FACILITY_STATUS_LABELS: Record<HospitalOperationalStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  UNDER_MAINTENANCE: 'Under Maintenance',
};

export const getFacilityStatusBadgeVariant = (status: HospitalOperationalStatus): BadgeVariant => {
  switch (status) {
    case 'ACTIVE':
      return 'sage';
    case 'INACTIVE':
      return 'danger';
    case 'UNDER_MAINTENANCE':
      return 'sandal';
    default:
      return 'outline';
  }
};

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  'Government PHC': 'Government PHC',
  'District Hospital': 'District Hospital',
  'Private Maternity Center': 'Private Maternity Center',
};

// --- High-risk case status ---------------------------------------------

export const HIGH_RISK_STATUS_LABELS: Record<HighRiskCaseStatus, string> = {
  FLAGGED: 'Flagged',
  UNDER_REVIEW: 'Under Review',
  MONITORING: 'Monitoring',
  RESOLVED: 'Resolved',
};

export const getHighRiskStatusBadgeVariant = (status: HighRiskCaseStatus): BadgeVariant => {
  switch (status) {
    case 'FLAGGED':
      return 'danger';
    case 'UNDER_REVIEW':
      return 'sandal';
    case 'MONITORING':
      return 'peach';
    case 'RESOLVED':
      return 'sage';
    default:
      return 'outline';
  }
};

const HIGH_RISK_TRANSITIONS: Record<HighRiskCaseStatus, HighRiskCaseStatus[]> = {
  FLAGGED: ['UNDER_REVIEW', 'MONITORING'],
  UNDER_REVIEW: ['MONITORING', 'RESOLVED'],
  MONITORING: ['UNDER_REVIEW', 'RESOLVED'],
  RESOLVED: [],
};

export const getAvailableHighRiskTransitions = (status: HighRiskCaseStatus): HighRiskCaseStatus[] =>
  HIGH_RISK_TRANSITIONS[status];

// --- Alerts --------------------------------------------------------------

export const ADMIN_ALERT_TYPE_LABELS: Record<AdminAlertType, string> = {
  FACILITY_CAPACITY: 'Facility Capacity',
  IMMUNIZATION_COVERAGE: 'Immunization Coverage',
  HIGH_RISK_CASE: 'High-Risk Case',
  FACILITY_REPORTING_OVERDUE: 'Reporting Overdue',
  REFERRAL_ESCALATION: 'Referral Escalation',
};

export const getAdminAlertTypeIcon = (type: AdminAlertType): LucideIcon => {
  switch (type) {
    case 'FACILITY_CAPACITY':
      return BedDouble;
    case 'IMMUNIZATION_COVERAGE':
      return Syringe;
    case 'HIGH_RISK_CASE':
      return AlertTriangle;
    case 'FACILITY_REPORTING_OVERDUE':
      return ClipboardCheck;
    case 'REFERRAL_ESCALATION':
      return ArrowRightLeft;
    default:
      return AlertTriangle;
  }
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

export const ALERT_STATUS_LABELS: Record<HospitalAlertStatus, string> = {
  ACTIVE: 'Active',
  ACKNOWLEDGED: 'Acknowledged',
  RESOLVED: 'Resolved',
};

export const getAlertStatusBadgeVariant = (status: HospitalAlertStatus): BadgeVariant => {
  switch (status) {
    case 'ACTIVE':
      return 'danger';
    case 'ACKNOWLEDGED':
      return 'sandal';
    case 'RESOLVED':
      return 'sage';
    default:
      return 'outline';
  }
};
