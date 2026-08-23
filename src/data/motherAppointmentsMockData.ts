import { mockChild, mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { AppointmentCategory, MotherAppointment, MotherAppointmentStatus } from '@/types';

/**
 * Fixed "today" reference for this mock dataset, matching DOCTOR_TODAY_ISO in
 * doctorPatientsMockData.ts so mother-side and doctor-side appointment views
 * agree on what counts as upcoming vs. past.
 */
export const MOTHER_TODAY_ISO = '2026-08-23';

export const APPOINTMENT_CATEGORY_LABELS: Record<AppointmentCategory, string> = {
  ANTENATAL_CHECKUP: 'Antenatal Check-up',
  ULTRASOUND_SCAN: 'Ultrasound / Scan',
  LAB_TEST: 'Lab / Test',
  POSTNATAL_CHECKUP: 'Postnatal Check-up',
  PEDIATRIC_CHECKUP: 'Child / Pediatric Check-up',
  VACCINATION: 'Vaccination',
};

/**
 * Realistic mock appointment history spanning Ananya Kapoor's antenatal
 * pregnancy stage through her current postnatal stage, mirroring the same
 * mother/doctor/hospital/child records used across Modules 1A-1C.
 */
export const motherAppointments: MotherAppointment[] = [
  // --- Upcoming ---
  {
    appointmentId: 'mapt_01',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'POSTNATAL_CHECKUP',
    title: '6-Week Postpartum & Pediatric Checkup',
    date: '2026-08-29',
    time: '10:30 AM',
    location: 'OPD Block A, Room 204',
    reason: 'Routine checkup for maternal recovery and baby Vihaan\'s 6-week growth screening.',
    status: 'upcoming',
    notes: 'Bring vaccination card and recent feeding log.',
    childId: mockChild.id,
    childName: mockChild.name,
  },
  {
    appointmentId: 'mapt_02',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'VACCINATION',
    title: 'Pentavalent-1, OPV-1, Rotavirus-1, PCV-1',
    date: '2026-08-29',
    time: '11:15 AM',
    location: 'Pediatric Wing',
    reason: '6-week routine immunization for Vihaan.',
    status: 'upcoming',
    childId: mockChild.id,
    childName: mockChild.name,
  },
  {
    appointmentId: 'mapt_03',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'LAB_TEST',
    title: 'Postpartum CBC & Iron Panel',
    date: '2026-09-05',
    time: '09:00 AM',
    location: 'Diagnostics Lab, Ground Floor',
    reason: 'Follow-up blood work to confirm iron levels are recovering after delivery.',
    status: 'upcoming',
  },

  // --- Requested (mother-initiated, awaiting hospital confirmation) ---
  {
    appointmentId: 'mapt_04',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'PEDIATRIC_CHECKUP',
    title: '10-Week Pediatric Growth Review',
    date: '2026-09-26',
    time: '10:00 AM',
    location: 'Pediatric Wing',
    reason: 'Requested growth and feeding check-in ahead of the 10-week vaccination visit.',
    status: 'requested',
    childId: mockChild.id,
    childName: mockChild.name,
  },

  // --- Past: Postnatal stage ---
  {
    appointmentId: 'mapt_05',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'PEDIATRIC_CHECKUP',
    title: 'Newborn 2-Week Neonatal Check',
    date: '2026-08-01',
    time: '11:00 AM',
    location: 'Pediatric Wing',
    reason: 'Newborn weight, jaundice, and feeding assessment.',
    status: 'completed',
    childId: mockChild.id,
    childName: mockChild.name,
  },
  {
    appointmentId: 'mapt_06',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'VACCINATION',
    title: 'BCG, OPV-0, Hepatitis B-1',
    date: '2026-07-19',
    time: '09:30 AM',
    location: 'Pediatric Wing',
    reason: 'Birth-dose immunization for Vihaan.',
    status: 'completed',
    childId: mockChild.id,
    childName: mockChild.name,
  },

  // --- Past: Antenatal / delivery stage ---
  {
    appointmentId: 'mapt_07',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'ANTENATAL_CHECKUP',
    title: '38-Week Antenatal Review',
    date: '2026-07-14',
    time: '04:00 PM',
    location: 'OPD Block A, Room 204',
    reason: 'Final antenatal review ahead of expected delivery.',
    status: 'completed',
  },
  {
    appointmentId: 'mapt_08',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'ULTRASOUND_SCAN',
    title: 'Growth Scan - 35 Weeks',
    date: '2026-06-28',
    time: '09:00 AM',
    location: 'Radiology Suite',
    reason: 'Estimated fetal weight and amniotic fluid check.',
    status: 'completed',
  },
  {
    appointmentId: 'mapt_09',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'LAB_TEST',
    title: 'Glucose Tolerance Test (GTT)',
    date: '2026-06-10',
    time: '08:30 AM',
    location: 'Diagnostics Lab, Ground Floor',
    reason: 'Gestational diabetes screening.',
    status: 'completed',
  },
  {
    appointmentId: 'mapt_10',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'ULTRASOUND_SCAN',
    title: 'Anomaly Scan - 20 Weeks',
    date: '2026-04-20',
    time: '10:00 AM',
    location: 'Radiology Suite',
    reason: 'Detailed fetal anomaly screening.',
    status: 'completed',
  },
  {
    appointmentId: 'mapt_11',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'ANTENATAL_CHECKUP',
    title: 'First Trimester Registration Visit',
    date: '2026-02-05',
    time: '11:30 AM',
    location: 'OPD Block A, Room 204',
    reason: 'Pregnancy registration and baseline health assessment.',
    status: 'completed',
  },

  // --- Cancelled / rescheduled examples ---
  {
    appointmentId: 'mapt_12',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'LAB_TEST',
    title: 'Routine Urine Protein Test',
    date: '2026-07-05',
    time: '09:00 AM',
    location: 'Diagnostics Lab, Ground Floor',
    reason: 'Routine antenatal screening test.',
    status: 'cancelled',
    notes: 'Cancelled — combined with the 38-week antenatal review instead.',
  },
  {
    appointmentId: 'mapt_13',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    category: 'ANTENATAL_CHECKUP',
    title: '32-Week Antenatal Review',
    date: '2026-06-01',
    time: '10:00 AM',
    location: 'OPD Block A, Room 204',
    reason: 'Routine antenatal review.',
    status: 'rescheduled',
    notes: 'Moved to align with the 35-week growth scan visit.',
  },
];

export const getAppointmentsForMother = (motherId: string): MotherAppointment[] =>
  motherAppointments
    .filter((a) => a.motherId === motherId)
    .slice()
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

export const getUpcomingAppointmentsForMother = (
  motherId: string,
  todayISO: string = MOTHER_TODAY_ISO
): MotherAppointment[] =>
  getAppointmentsForMother(motherId).filter(
    (a) => (a.status === 'upcoming' || a.status === 'requested') && a.date >= todayISO
  );

export const getPastAppointmentsForMother = (
  motherId: string,
  todayISO: string = MOTHER_TODAY_ISO
): MotherAppointment[] =>
  getAppointmentsForMother(motherId)
    .filter(
      (a) =>
        a.status === 'completed' ||
        a.status === 'cancelled' ||
        a.status === 'rescheduled' ||
        ((a.status === 'upcoming' || a.status === 'requested') && a.date < todayISO)
    )
    .reverse();

const nextMockAppointmentId = (existing: MotherAppointment[]): string => {
  const max = existing.reduce((highest, a) => {
    const match = /^mapt_(\d+)$/.exec(a.appointmentId);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(highest, num);
  }, 0);
  return `mapt_${String(max + 1).padStart(2, '0')}`;
};

export interface RequestAppointmentInput {
  category: AppointmentCategory;
  reason: string;
  preferredDate: string;
  preferredTime: string;
}

/**
 * Builds a new mother-initiated appointment request. Frontend-only: the
 * caller is responsible for holding the returned record in local state
 * since there is no backend to persist it yet.
 */
export const createRequestedAppointment = (
  input: RequestAppointmentInput,
  existing: MotherAppointment[] = motherAppointments
): MotherAppointment => ({
  appointmentId: nextMockAppointmentId(existing),
  motherId: mockMother.id,
  doctorId: mockDoctor.id,
  doctorName: mockDoctor.name,
  hospitalId: mockHospital.id,
  hospitalName: mockHospital.name,
  category: input.category,
  title: APPOINTMENT_CATEGORY_LABELS[input.category],
  date: input.preferredDate,
  time: input.preferredTime,
  location: mockHospital.name,
  reason: input.reason,
  status: 'requested',
});

export const isCancellable = (status: MotherAppointmentStatus): boolean =>
  status === 'upcoming' || status === 'requested' || status === 'rescheduled';

export const isReschedulable = (status: MotherAppointmentStatus): boolean =>
  status === 'upcoming' || status === 'requested' || status === 'rescheduled';
