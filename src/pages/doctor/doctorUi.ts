import { AssignedPatient, DoctorAppointmentStatus, PatientRiskLevel, PatientStatus, ReportStatus } from '@/types';
import { formatDate } from '@/utils/formatters';

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

const formatClockTime = (date: Date): string =>
  new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);

/**
 * Formats an ISO datetime as "Today, 8:10 AM" / "Yesterday, 7:05 PM" /
 * "23 Aug 2026, 7:05 PM" relative to a fixed "now" reference — shared by the
 * Doctor Messages and Doctor Notifications modules so their timestamps read
 * consistently.
 */
export const formatClinicalTimestamp = (iso: string, nowIso: string): string => {
  const date = new Date(iso);
  const dateDay = iso.slice(0, 10);
  const nowDay = nowIso.slice(0, 10);

  if (dateDay === nowDay) return `Today, ${formatClockTime(date)}`;

  const yesterday = new Date(nowIso);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateDay === yesterday.toISOString().slice(0, 10)) return `Yesterday, ${formatClockTime(date)}`;

  return `${formatDate(iso)}, ${formatClockTime(date)}`;
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
