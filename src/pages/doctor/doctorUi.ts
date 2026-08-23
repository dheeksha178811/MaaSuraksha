import { AssignedPatient, DoctorAppointmentStatus, PatientRiskLevel, PatientStatus, ReportStatus } from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

export const getStatusBadgeVariant = (status: PatientStatus): BadgeVariant => {
  switch (status) {
    case 'STABLE':
      return 'sage';
    case 'FOLLOW_UP_DUE':
      return 'danger';
    case 'REPORT_PENDING':
      return 'sandal';
    case 'NEW':
      return 'peach';
    default:
      return 'outline';
  }
};

export const getStatusLabel = (status: PatientStatus): string => {
  switch (status) {
    case 'STABLE':
      return 'Stable';
    case 'FOLLOW_UP_DUE':
      return 'Follow-up Due';
    case 'REPORT_PENDING':
      return 'Report Pending';
    case 'NEW':
      return 'New Patient';
    default:
      return status;
  }
};

export const getRiskBadgeVariant = (risk: PatientRiskLevel): BadgeVariant => {
  switch (risk) {
    case 'HIGH':
      return 'danger';
    case 'MODERATE':
      return 'sandal';
    case 'LOW':
      return 'sage';
    default:
      return 'outline';
  }
};

export const getAppointmentStatusBadgeVariant = (status: DoctorAppointmentStatus): BadgeVariant => {
  switch (status) {
    case 'upcoming':
      return 'sandal';
    case 'completed':
      return 'sage';
    case 'cancelled':
      return 'danger';
    case 'rescheduled':
      return 'peach';
    default:
      return 'outline';
  }
};

export const getReportStatusBadgeVariant = (status: ReportStatus): BadgeVariant => {
  switch (status) {
    case 'COMPLETED':
      return 'sage';
    case 'PENDING':
      return 'danger';
    case 'UPCOMING':
      return 'sandal';
    default:
      return 'outline';
  }
};

export const getPatientStageSummary = (patient: AssignedPatient): string => {
  if (patient.stage === 'ANTENATAL' && patient.antenatal) {
    return `Week ${patient.antenatal.pregnancyWeek} • EDD ${patient.antenatal.expectedDeliveryDate}`;
  }
  if (patient.stage === 'POSTNATAL' && patient.postnatal) {
    return `${patient.postnatal.postpartumWeeks} weeks postpartum • ${patient.postnatal.deliveryType} delivery`;
  }
  return patient.stage === 'ANTENATAL' ? 'Antenatal' : 'Postnatal';
};
