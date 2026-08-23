import { mockChild, mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { mockReports } from '@/data/reportsMockData';
import { childReports } from '@/data/childReportsMockData';
import { getAppointmentsForMother } from '@/data/motherAppointmentsMockData';
import { getMedicationsForMother } from '@/data/motherMedicationsMockData';
import { getVaccinationsForMother } from '@/data/motherVaccinationsMockData';
import { getMeasurementsForMother, getMilestonesForMother } from '@/data/motherGrowthMockData';
import { doctorPatients, getConsultationNotesForPatient } from '@/data/doctorPatientsMockData';
import { getMotherAppointmentStatusBadgeVariant, getMotherAppointmentStatusLabel } from '@/pages/appointments/motherAppointmentUi';
import { getVaccineStatusBadgeVariant, getVaccineStatusLabel } from '@/pages/vaccinations/motherVaccinationUi';
import { Report, ReportCategory, TimelineEvent, TimelineEventCategory } from '@/types';

const REPORT_CATEGORY_TO_TIMELINE: Record<ReportCategory, TimelineEventCategory> = {
  ULTRASOUND: 'SCAN',
  BLOOD_TEST: 'LAB_REPORT',
  PRESCRIPTION: 'DOCUMENT',
  OTHER: 'DOCUMENT',
};

const reportStatusBadge = (
  status: Report['status']
): { statusLabel: string; statusVariant: TimelineEvent['statusVariant'] } => {
  switch (status) {
    case 'COMPLETED':
      return { statusLabel: 'Completed', statusVariant: 'sage' };
    case 'PENDING':
      return { statusLabel: 'Pending', statusVariant: 'danger' };
    case 'UPCOMING':
      return { statusLabel: 'Upcoming', statusVariant: 'sandal' };
    default:
      return { statusLabel: status, statusVariant: 'outline' };
  }
};

const buildReportEvents = (
  reports: Report[],
  recipient: 'MOTHER' | 'CHILD',
  recipientName: string,
  linkTo: string
): TimelineEvent[] =>
  reports.map((r) => ({
    eventId: `report_${r.id}`,
    motherId: mockMother.id,
    childId: recipient === 'CHILD' ? mockChild.id : undefined,
    category: REPORT_CATEGORY_TO_TIMELINE[r.category],
    recipient,
    recipientName,
    date: r.date,
    title: r.name,
    summary: r.description || '',
    doctorName: r.doctor,
    hospitalName: r.hospital,
    ...reportStatusBadge(r.status),
    linkTo,
    linkLabel: recipient === 'CHILD' ? "View in My Child" : 'View in Reports',
    sourceType: 'REPORT',
    sourceId: r.id,
  }));

const buildAppointmentEvents = (motherId: string): TimelineEvent[] =>
  getAppointmentsForMother(motherId).map((a) => ({
    eventId: `appointment_${a.appointmentId}`,
    motherId,
    childId: a.childId,
    category: 'APPOINTMENT',
    recipient: a.childId ? 'CHILD' : 'MOTHER',
    recipientName: a.childName || mockMother.name,
    date: a.date,
    title: a.title,
    summary: a.reason,
    doctorName: a.doctorName,
    hospitalName: a.hospitalName,
    statusLabel: getMotherAppointmentStatusLabel(a.status),
    statusVariant: getMotherAppointmentStatusBadgeVariant(a.status),
    linkTo: '/mother/appointments',
    linkLabel: 'View in Appointments',
    sourceType: 'APPOINTMENT',
    sourceId: a.appointmentId,
  }));

const buildMedicationEvents = (motherId: string): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  getMedicationsForMother(motherId).forEach((m) => {
    events.push({
      eventId: `medication_${m.medicationId}_start`,
      motherId,
      childId: m.childId,
      category: 'MEDICATION',
      recipient: m.childId ? 'CHILD' : 'MOTHER',
      recipientName: m.childName || mockMother.name,
      date: m.startDate,
      title: `Started ${m.name}`,
      summary: `${m.dosage} • ${m.frequency}${m.instructions ? ` — ${m.instructions}` : ''}`,
      doctorName: m.doctorName,
      hospitalName: m.hospitalName,
      statusLabel: 'Started',
      statusVariant: 'peach',
      linkTo: '/mother/medications',
      linkLabel: 'View in Medications',
      sourceType: 'MEDICATION',
      sourceId: m.medicationId,
    });
    if (m.endDate) {
      events.push({
        eventId: `medication_${m.medicationId}_end`,
        motherId,
        childId: m.childId,
        category: 'MEDICATION',
        recipient: m.childId ? 'CHILD' : 'MOTHER',
        recipientName: m.childName || mockMother.name,
        date: m.endDate,
        title: `Completed ${m.name}`,
        summary: `Course completed.${m.instructions ? ` ${m.instructions}` : ''}`,
        doctorName: m.doctorName,
        hospitalName: m.hospitalName,
        statusLabel: 'Completed',
        statusVariant: 'sage',
        linkTo: '/mother/medications',
        linkLabel: 'View in Medications',
        sourceType: 'MEDICATION',
        sourceId: m.medicationId,
      });
    }
  });
  return events;
};

const buildVaccinationEvents = (motherId: string): TimelineEvent[] =>
  getVaccinationsForMother(motherId).map((v) => {
    const isDone = v.status === 'completed';
    return {
      eventId: `vaccination_${v.vaccinationId}`,
      motherId,
      childId: v.childId,
      category: 'VACCINATION',
      recipient: v.recipientType,
      recipientName: v.recipientName,
      date: isDone && v.givenDate ? v.givenDate : v.recommendedDate,
      title: isDone ? `${v.vaccineName} — Given` : `${v.vaccineName} — Due`,
      summary: `${v.doseLabel}${v.notes ? ` — ${v.notes}` : ''}`,
      doctorName: v.doctorName,
      hospitalName: v.hospitalName,
      statusLabel: getVaccineStatusLabel(v.status),
      statusVariant: getVaccineStatusBadgeVariant(v.status),
      linkTo: '/mother/vaccinations',
      linkLabel: 'View in Vaccinations',
      sourceType: 'VACCINATION',
      sourceId: v.vaccinationId,
    };
  });

const buildMeasurementEvents = (motherId: string): TimelineEvent[] =>
  getMeasurementsForMother(motherId).map((m) => {
    const parts: string[] = [];
    if (m.weightKg !== undefined) parts.push(`${m.weightKg} kg`);
    if (m.heightCm !== undefined) parts.push(`${m.heightCm} cm`);
    if (m.headCircumferenceCm !== undefined) parts.push(`Head: ${m.headCircumferenceCm} cm`);
    return {
      eventId: `measurement_${m.measurementId}`,
      motherId,
      childId: m.childId,
      category: 'VITALS',
      recipient: m.recipientType,
      recipientName: m.recipientName,
      date: m.date,
      title: m.context,
      summary: `${parts.join(' • ')}${m.notes ? ` — ${m.notes}` : ''}`,
      doctorName: m.loggedByMother ? undefined : m.doctorName,
      hospitalName: m.loggedByMother ? undefined : m.hospitalName,
      statusLabel: m.loggedByMother ? 'Logged at Home' : undefined,
      statusVariant: m.loggedByMother ? 'peach' : undefined,
      linkTo: '/mother/growth-milestones',
      linkLabel: 'View in Growth Chart',
      sourceType: 'MEASUREMENT',
      sourceId: m.measurementId,
    };
  });

const buildMilestoneEvents = (motherId: string): TimelineEvent[] =>
  getMilestonesForMother(motherId)
    .filter((m) => m.status === 'achieved' && m.achievedDate)
    .map((m) => ({
      eventId: `milestone_${m.milestoneId}`,
      motherId,
      childId: m.childId,
      category: 'MILESTONE',
      recipient: m.recipientType,
      recipientName: m.recipientName,
      date: m.achievedDate as string,
      title: m.title,
      summary: m.description,
      statusLabel: 'Achieved',
      statusVariant: 'sage',
      linkTo: '/mother/growth-milestones',
      linkLabel: 'View in Milestones',
      sourceType: 'MILESTONE',
      sourceId: m.milestoneId,
    }));

const buildDoctorNoteEvents = (motherId: string): TimelineEvent[] => {
  const patient = doctorPatients.find((p) => p.motherId === motherId);
  if (!patient) return [];
  return getConsultationNotesForPatient(patient.patientId).map((n) => ({
    eventId: `note_${n.noteId}`,
    motherId,
    category: 'DOCTOR_NOTE',
    recipient: 'MOTHER',
    recipientName: mockMother.name,
    date: n.date,
    title: n.title,
    summary: n.note,
    doctorName: mockDoctor.name,
    hospitalName: mockHospital.name,
    statusLabel: 'Doctor Note',
    statusVariant: 'outline',
    sourceType: 'CONSULTATION_NOTE',
    sourceId: n.noteId,
  }));
};

/**
 * Builds the mother's full health timeline by aggregating already-recorded
 * events from every other completed module (reports, appointments,
 * medications, vaccinations, growth measurements, milestones, and doctor
 * notes), sorted chronologically. Nothing is stored redundantly here — this
 * is a pure, derived, read-only projection.
 */
export const getHealthTimelineForMother = (motherId: string): TimelineEvent[] => {
  const events: TimelineEvent[] = [
    ...buildReportEvents(mockReports, 'MOTHER', mockMother.name, '/mother/documents'),
    ...buildReportEvents(childReports, 'CHILD', mockChild.name, '/mother/child'),
    ...buildAppointmentEvents(motherId),
    ...buildMedicationEvents(motherId),
    ...buildVaccinationEvents(motherId),
    ...buildMeasurementEvents(motherId),
    ...buildMilestoneEvents(motherId),
    ...buildDoctorNoteEvents(motherId),
  ];

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.eventId.localeCompare(b.eventId));
};
