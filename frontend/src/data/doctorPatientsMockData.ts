import { mockChild, mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { mockReports } from '@/data/reportsMockData';
import {
  AssignedPatient,
  CareRecommendation,
  ChildProfile,
  ConsultationNote,
  DoctorAlert,
  DoctorAppointment,
  DoctorDashboardSummary,
  PatientMedication,
  Report,
} from '@/types';

/**
 * Fixed "today" reference for this mock dataset, matching the date the rest of the
 * MaaSuraksha mock data (e.g. mockAppointments, careJourneyMockData) is authored around.
 */
export const DOCTOR_TODAY_ISO = '2026-08-23';

// ---------------------------------------------------------------------------
// Assigned Patients
// ---------------------------------------------------------------------------
// pat_09 / doc_02 intentionally represents a mother assigned to a DIFFERENT doctor.
// It must never surface in Dr. Priya Menon's (doc_01) views — this is what proves the
// "a doctor only sees their own patients" boundary rather than it being vacuously true.

export const doctorPatients: AssignedPatient[] = [
  {
    patientId: 'pat_01',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    childId: mockChild.id,
    name: mockMother.name,
    age: mockMother.age,
    phone: mockMother.phone || '',
    bloodGroup: mockMother.bloodGroup,
    location: mockMother.location,
    stage: 'POSTNATAL',
    status: 'STABLE',
    riskLevel: 'LOW',
    postnatal: {
      deliveryDate: '2026-07-18',
      deliveryType: 'Normal',
      postpartumWeeks: 5,
      recoveryStatus: 'Recovering well. Routine 6-week postpartum checkup scheduled.',
      breastfeedingStatus: 'Exclusive breastfeeding, well established.',
    },
    lastVisitDate: '2026-08-01',
    registeredOn: mockMother.createdAt,
  },
  {
    patientId: 'pat_02',
    motherId: 'usr_mother_02',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    name: 'Meera Iyer',
    age: 29,
    phone: '+91 98450 11223',
    bloodGroup: 'B+',
    location: 'Koramangala, Bengaluru',
    stage: 'ANTENATAL',
    status: 'FOLLOW_UP_DUE',
    riskLevel: 'MODERATE',
    antenatal: {
      pregnancyWeek: 28,
      expectedDeliveryDate: '2026-11-02',
      gravida: 'G1P0',
      ancVisitsCompleted: 5,
      ancVisitsPlanned: 8,
      highRiskFactors: ['Gestational diabetes under monitoring'],
    },
    lastVisitDate: '2026-08-10',
    registeredOn: '2026-04-12',
  },
  {
    patientId: 'pat_03',
    motherId: 'usr_mother_03',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    name: 'Fatima Sheikh',
    age: 26,
    phone: '+91 90080 33445',
    bloodGroup: 'A+',
    location: 'Frazer Town, Bengaluru',
    stage: 'ANTENATAL',
    status: 'STABLE',
    riskLevel: 'LOW',
    antenatal: {
      pregnancyWeek: 12,
      expectedDeliveryDate: '2027-02-15',
      gravida: 'G2P1',
      ancVisitsCompleted: 1,
      ancVisitsPlanned: 8,
      highRiskFactors: [],
    },
    lastVisitDate: '2026-08-05',
    registeredOn: '2026-07-20',
  },
  {
    patientId: 'pat_04',
    motherId: 'usr_mother_04',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    name: 'Kavya Reddy',
    age: 31,
    phone: '+91 97400 55667',
    bloodGroup: 'O-',
    location: 'HSR Layout, Bengaluru',
    stage: 'ANTENATAL',
    status: 'REPORT_PENDING',
    riskLevel: 'HIGH',
    antenatal: {
      pregnancyWeek: 36,
      expectedDeliveryDate: '2026-09-10',
      gravida: 'G1P0',
      ancVisitsCompleted: 7,
      ancVisitsPlanned: 8,
      highRiskFactors: ['Pre-eclampsia watch', 'Elevated blood pressure at last visit'],
    },
    lastVisitDate: '2026-08-18',
    registeredOn: '2026-02-02',
  },
  {
    patientId: 'pat_05',
    motherId: 'usr_mother_05',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    childId: 'child_05',
    name: 'Sneha Joshi',
    age: 33,
    phone: '+91 99001 22884',
    bloodGroup: 'AB+',
    location: 'Jayanagar, Bengaluru',
    stage: 'POSTNATAL',
    status: 'STABLE',
    riskLevel: 'LOW',
    postnatal: {
      deliveryDate: '2026-06-02',
      deliveryType: 'C-Section',
      postpartumWeeks: 11,
      recoveryStatus: 'Surgical wound healing well, no signs of infection.',
      breastfeedingStatus: 'Mixed feeding, latch improving.',
    },
    lastVisitDate: '2026-08-15',
    registeredOn: '2025-11-20',
  },
  {
    patientId: 'pat_06',
    motherId: 'usr_mother_06',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    name: 'Divya Nair',
    age: 27,
    phone: '+91 96110 77889',
    bloodGroup: 'B-',
    location: 'Whitefield, Bengaluru',
    stage: 'ANTENATAL',
    status: 'STABLE',
    riskLevel: 'LOW',
    antenatal: {
      pregnancyWeek: 20,
      expectedDeliveryDate: '2027-01-05',
      gravida: 'G3P2',
      ancVisitsCompleted: 3,
      ancVisitsPlanned: 8,
      highRiskFactors: [],
    },
    lastVisitDate: '2026-08-12',
    registeredOn: '2026-05-01',
  },
  {
    patientId: 'pat_07',
    motherId: 'usr_mother_07',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    childId: 'child_07',
    name: 'Ritika Verma',
    age: 30,
    phone: '+91 98220 66112',
    bloodGroup: 'O+',
    location: 'Malleswaram, Bengaluru',
    stage: 'POSTNATAL',
    status: 'FOLLOW_UP_DUE',
    riskLevel: 'MODERATE',
    postnatal: {
      deliveryDate: '2026-07-30',
      deliveryType: 'Normal',
      postpartumWeeks: 3,
      recoveryStatus: 'Mild fatigue and low iron levels, supplementation started.',
      breastfeedingStatus: 'Exclusive breastfeeding.',
    },
    lastVisitDate: '2026-08-13',
    registeredOn: '2026-01-15',
  },
  {
    patientId: 'pat_08',
    motherId: 'usr_mother_08',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    name: 'Pooja Nayar',
    age: 24,
    phone: '+91 90350 44119',
    bloodGroup: 'A-',
    location: 'Basavanagudi, Bengaluru',
    stage: 'ANTENATAL',
    status: 'NEW',
    riskLevel: 'LOW',
    antenatal: {
      pregnancyWeek: 8,
      expectedDeliveryDate: '2027-03-20',
      gravida: 'G1P0',
      ancVisitsCompleted: 1,
      ancVisitsPlanned: 8,
      highRiskFactors: [],
    },
    lastVisitDate: '2026-08-19',
    registeredOn: '2026-08-19',
  },
  // Not assigned to Dr. Priya Menon (doc_01) — must never appear in her patient views.
  {
    patientId: 'pat_09',
    motherId: 'usr_mother_09',
    doctorId: 'doc_02',
    hospitalId: 'hosp_02',
    name: 'Ishita Rao',
    age: 28,
    phone: '+91 91234 00998',
    bloodGroup: 'B+',
    location: 'Andheri, Mumbai',
    stage: 'ANTENATAL',
    status: 'STABLE',
    riskLevel: 'LOW',
    antenatal: {
      pregnancyWeek: 22,
      expectedDeliveryDate: '2026-12-30',
      gravida: 'G1P0',
      ancVisitsCompleted: 3,
      ancVisitsPlanned: 8,
      highRiskFactors: [],
    },
    lastVisitDate: '2026-08-14',
    registeredOn: '2026-04-01',
  },
];

// ---------------------------------------------------------------------------
// Children (for postnatal patients not already represented by mockChild)
// ---------------------------------------------------------------------------

export const doctorPatientChildren: ChildProfile[] = [
  mockChild,
  {
    id: 'child_05',
    motherId: 'usr_mother_05',
    name: 'Aarav Joshi',
    gender: 'boy',
    dateOfBirth: '2026-06-02',
    ageDisplay: '11 weeks',
    birthWeightKg: 2.9,
    currentWeightKg: 4.6,
    bloodGroup: 'AB+',
    birthHospital: mockHospital.name,
  },
  {
    id: 'child_07',
    motherId: 'usr_mother_07',
    name: 'Anaya Verma',
    gender: 'girl',
    dateOfBirth: '2026-07-30',
    ageDisplay: '3 weeks',
    birthWeightKg: 3.0,
    currentWeightKg: 3.4,
    bloodGroup: 'O+',
    birthHospital: mockHospital.name,
  },
];

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export const doctorAppointments: DoctorAppointment[] = [
  {
    appointmentId: 'apt_01',
    patientId: 'pat_01',
    patientName: 'Ananya Kapoor',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Postnatal Checkup',
    date: '2026-08-29',
    time: '10:30 AM',
    status: 'upcoming',
    location: 'OPD Block A, Room 204',
    notes: 'Routine 6-week postpartum & pediatric growth screening.',
  },
  {
    appointmentId: 'apt_11',
    patientId: 'pat_02',
    patientName: 'Meera Iyer',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Antenatal Checkup',
    date: '2026-08-23',
    time: '10:00 AM',
    status: 'upcoming',
    location: 'OPD Block A, Room 204',
    notes: 'Gestational diabetes monitoring review.',
  },
  {
    appointmentId: 'apt_12',
    patientId: 'pat_04',
    patientName: 'Kavya Reddy',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Antenatal Checkup',
    date: '2026-08-23',
    time: '12:30 PM',
    status: 'upcoming',
    location: 'OPD Block A, Room 206',
    notes: 'Blood pressure & pre-eclampsia review.',
  },
  {
    appointmentId: 'apt_13',
    patientId: 'pat_07',
    patientName: 'Ritika Verma',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Follow-up',
    date: '2026-08-20',
    time: '11:30 AM',
    status: 'upcoming',
    location: 'OPD Block A, Room 204',
    notes: 'Iron supplementation & fatigue follow-up (overdue).',
  },
  {
    appointmentId: 'apt_14',
    patientId: 'pat_06',
    patientName: 'Divya Nair',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Antenatal Checkup',
    date: '2026-08-25',
    time: '09:30 AM',
    status: 'upcoming',
    location: 'OPD Block A, Room 204',
  },
  {
    appointmentId: 'apt_15',
    patientId: 'pat_03',
    patientName: 'Fatima Sheikh',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Antenatal Checkup',
    date: '2026-08-27',
    time: '04:00 PM',
    status: 'upcoming',
    location: 'OPD Block A, Room 204',
  },
  {
    appointmentId: 'apt_16',
    patientId: 'pat_08',
    patientName: 'Pooja Nayar',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Registration Visit',
    date: '2026-08-24',
    time: '11:00 AM',
    status: 'upcoming',
    location: 'OPD Block A, Room 204',
    notes: 'First antenatal registration visit.',
  },
  {
    appointmentId: 'apt_17',
    patientId: 'pat_05',
    patientName: 'Sneha Joshi',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Postnatal Checkup',
    date: '2026-08-15',
    time: '10:00 AM',
    status: 'completed',
    location: 'OPD Block A, Room 204',
  },
  {
    appointmentId: 'apt_18',
    patientId: 'pat_02',
    patientName: 'Meera Iyer',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Lab Review',
    date: '2026-08-10',
    time: '10:30 AM',
    status: 'completed',
    location: 'OPD Block A, Room 204',
    notes: 'Glucose tolerance test results reviewed.',
  },
  {
    appointmentId: 'apt_19',
    patientId: 'pat_04',
    patientName: 'Kavya Reddy',
    doctorId: mockDoctor.id,
    hospitalId: mockHospital.id,
    type: 'Ultrasound',
    date: '2026-08-18',
    time: '09:00 AM',
    status: 'completed',
    location: 'Radiology Suite',
    notes: 'Growth scan at 35 weeks.',
  },
];

// ---------------------------------------------------------------------------
// Reports — reuses the Module 1B `Report` type/shape (no duplication of that model).
// Ananya's entries below reference the SAME mockReports records from Module 1B,
// just tagged with a patientId for the doctor-side view.
// ---------------------------------------------------------------------------

const ananyaReportsForDoctor: Report[] = mockReports.map((report) => ({
  ...report,
  patientId: 'pat_01',
}));

export const doctorReports: Report[] = [
  ...ananyaReportsForDoctor,
  {
    id: 'R101',
    name: 'Glucose Tolerance Test (GTT) - 28 Weeks',
    category: 'BLOOD_TEST',
    date: '2026-08-10',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'COMPLETED',
    description: 'Gestational diabetes screening - mildly elevated fasting glucose, diet control advised.',
    fileSize: '1.4 MB',
    fileType: 'PDF',
    patientId: 'pat_02',
  },
  {
    id: 'R102',
    name: 'Antenatal Ultrasound - 24 Weeks',
    category: 'ULTRASOUND',
    date: '2026-07-15',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'COMPLETED',
    description: 'Fetal growth within expected range for gestational age.',
    fileSize: '7.8 MB',
    fileType: 'PDF',
    patientId: 'pat_02',
  },
  {
    id: 'R103',
    name: 'Registration Blood Panel',
    category: 'BLOOD_TEST',
    date: '2026-08-05',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'COMPLETED',
    description: 'First-trimester baseline blood work - all values normal.',
    fileSize: '1.1 MB',
    fileType: 'PDF',
    patientId: 'pat_03',
  },
  {
    id: 'R104',
    name: 'BP & Urine Protein Test - 36 Weeks',
    category: 'BLOOD_TEST',
    date: '2026-08-20',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'PENDING',
    description: 'Uploaded ahead of pre-eclampsia review, awaiting doctor sign-off.',
    patientId: 'pat_04',
  },
  {
    id: 'R105',
    name: 'Growth Scan Ultrasound - 35 Weeks',
    category: 'ULTRASOUND',
    date: '2026-08-18',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'COMPLETED',
    description: 'Estimated fetal weight within range, amniotic fluid normal.',
    fileSize: '8.1 MB',
    fileType: 'PDF',
    patientId: 'pat_04',
  },
  {
    id: 'R106',
    name: 'C-Section Discharge Summary',
    category: 'OTHER',
    date: '2026-06-05',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'COMPLETED',
    description: 'Post-operative discharge summary following C-section delivery.',
    fileSize: '1.6 MB',
    fileType: 'PDF',
    patientId: 'pat_05',
  },
  {
    id: 'R107',
    name: 'Anomaly Scan - 20 Weeks',
    category: 'ULTRASOUND',
    date: '2026-09-02',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'UPCOMING',
    description: 'Scheduled detailed anomaly scan.',
    patientId: 'pat_06',
  },
  {
    id: 'R108',
    name: 'Postpartum CBC',
    category: 'BLOOD_TEST',
    date: '2026-08-13',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'PENDING',
    description: 'Uploaded to confirm iron levels after fatigue complaint, awaiting review.',
    patientId: 'pat_07',
  },
  {
    id: 'R109',
    name: 'Registration Ultrasound',
    category: 'ULTRASOUND',
    date: '2026-09-01',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'UPCOMING',
    description: 'First dating scan scheduled.',
    patientId: 'pat_08',
  },
];

// ---------------------------------------------------------------------------
// Medications
// ---------------------------------------------------------------------------

export const doctorMedications: PatientMedication[] = [
  {
    medicationId: 'med_01',
    patientId: 'pat_01',
    name: 'Iron & Folic Acid + Calcium',
    dosage: '1 tablet each',
    frequency: 'Once daily',
    prescribedBy: mockDoctor.name,
    startDate: '2026-07-19',
    status: 'active',
    notes: 'Continue through the postpartum recovery period.',
  },
  {
    medicationId: 'med_02',
    patientId: 'pat_02',
    name: 'Metformin',
    dosage: '500 mg',
    frequency: 'Twice daily, with meals',
    prescribedBy: mockDoctor.name,
    startDate: '2026-08-10',
    status: 'active',
    notes: 'For gestational diabetes management; reassess at next visit.',
  },
  {
    medicationId: 'med_03',
    patientId: 'pat_04',
    name: 'Labetalol',
    dosage: '100 mg',
    frequency: 'Twice daily',
    prescribedBy: mockDoctor.name,
    startDate: '2026-08-18',
    status: 'active',
    notes: 'Blood pressure management, monitor closely for pre-eclampsia signs.',
  },
  {
    medicationId: 'med_04',
    patientId: 'pat_07',
    name: 'Elemental Iron Supplement',
    dosage: '60 mg',
    frequency: 'Once daily',
    prescribedBy: mockDoctor.name,
    startDate: '2026-08-13',
    status: 'active',
    notes: 'For postpartum fatigue and low iron levels.',
  },
];

// ---------------------------------------------------------------------------
// Care Recommendations (Care Plans)
// ---------------------------------------------------------------------------

export const doctorRecommendations: CareRecommendation[] = [
  {
    recommendationId: 'rec_01',
    patientId: 'pat_01',
    doctorId: mockDoctor.id,
    type: 'NUTRITION',
    title: 'Postpartum nutrition & hydration plan',
    description: 'Increase protein and fluid intake to support recovery and breastfeeding. Continue iron and calcium supplementation.',
    date: '2026-08-01',
    active: true,
  },
  {
    recommendationId: 'rec_02',
    patientId: 'pat_02',
    doctorId: mockDoctor.id,
    type: 'NUTRITION',
    title: 'Gestational diabetes diet control',
    description: 'Low glycemic-index meals, portion control, and a 20-minute post-meal walk to support blood sugar management.',
    date: '2026-08-10',
    active: true,
  },
  {
    recommendationId: 'rec_03',
    patientId: 'pat_04',
    doctorId: mockDoctor.id,
    type: 'LIFESTYLE',
    title: 'Low-sodium diet & relative bed rest',
    description: 'Reduce salt intake, monitor for headaches or visual disturbances, and rest with legs elevated given elevated BP readings.',
    date: '2026-08-18',
    active: true,
  },
  {
    recommendationId: 'rec_04',
    patientId: 'pat_07',
    doctorId: mockDoctor.id,
    type: 'MEDICATION',
    title: 'Iron supplementation & rest',
    description: 'Continue iron tablets with vitamin C source, prioritize rest between feeds, recheck haemoglobin in 2 weeks.',
    date: '2026-08-13',
    active: true,
  },
  {
    recommendationId: 'rec_05',
    patientId: 'pat_03',
    doctorId: mockDoctor.id,
    type: 'GENERAL',
    title: 'First-trimester care guidance',
    description: 'Folic acid supplementation, avoid raw/undercooked foods, and schedule the next antenatal visit at 16 weeks.',
    date: '2026-08-05',
    active: true,
  },
];

// ---------------------------------------------------------------------------
// Consultation Notes
// ---------------------------------------------------------------------------

export const doctorConsultationNotes: ConsultationNote[] = [
  {
    noteId: 'note_01',
    patientId: 'pat_01',
    doctorId: mockDoctor.id,
    date: '2026-08-01',
    title: '2-week postpartum review',
    note: 'Mother recovering well, no signs of infection. Baby feeding and gaining weight appropriately.',
  },
  {
    noteId: 'note_02',
    patientId: 'pat_02',
    doctorId: mockDoctor.id,
    date: '2026-08-10',
    title: 'GTT results discussion',
    note: 'Discussed mildly elevated fasting glucose. Started on diet control and metformin, review in 2 weeks.',
  },
  {
    noteId: 'note_03',
    patientId: 'pat_04',
    doctorId: mockDoctor.id,
    date: '2026-08-18',
    title: 'BP review at 36 weeks',
    note: 'BP 142/92, mild ankle oedema noted. Started labetalol, urine protein test ordered, close monitoring advised.',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const getPatientsForDoctor = (doctorId: string): AssignedPatient[] =>
  doctorPatients.filter((p) => p.doctorId === doctorId);

export const getPatientById = (patientId: string): AssignedPatient | undefined =>
  doctorPatients.find((p) => p.patientId === patientId);

export const getChildForPatient = (patient: AssignedPatient): ChildProfile | undefined =>
  patient.childId ? doctorPatientChildren.find((c) => c.id === patient.childId) : undefined;

export const getAppointmentsForDoctor = (doctorId: string): DoctorAppointment[] =>
  doctorAppointments
    .filter((a) => a.doctorId === doctorId)
    .slice()
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

export const getAppointmentsForPatient = (patientId: string): DoctorAppointment[] =>
  doctorAppointments.filter((a) => a.patientId === patientId);

export const getTodaysAppointments = (doctorId: string, todayISO: string = DOCTOR_TODAY_ISO): DoctorAppointment[] =>
  getAppointmentsForDoctor(doctorId).filter((a) => a.date === todayISO && a.status === 'upcoming');

export const getUpcomingAppointments = (doctorId: string, todayISO: string = DOCTOR_TODAY_ISO): DoctorAppointment[] =>
  getAppointmentsForDoctor(doctorId).filter((a) => a.status === 'upcoming' && a.date >= todayISO);

export const getFollowUpsDue = (doctorId: string, todayISO: string = DOCTOR_TODAY_ISO): DoctorAppointment[] =>
  getAppointmentsForDoctor(doctorId).filter(
    (a) => a.status === 'upcoming' && a.date < todayISO
  );

export const getReportsForPatient = (patientId: string): Report[] =>
  doctorReports.filter((r) => r.patientId === patientId);

export const getReportsForDoctorPatients = (doctorId: string): Report[] => {
  const patientIds = new Set(getPatientsForDoctor(doctorId).map((p) => p.patientId));
  return doctorReports.filter((r) => r.patientId && patientIds.has(r.patientId));
};

export const getReportsAwaitingReview = (doctorId: string): Report[] =>
  getReportsForDoctorPatients(doctorId).filter((r) => r.status === 'PENDING');

export const getMedicationsForPatient = (patientId: string): PatientMedication[] =>
  doctorMedications.filter((m) => m.patientId === patientId);

export const getRecommendationsForPatient = (patientId: string): CareRecommendation[] =>
  doctorRecommendations.filter((r) => r.patientId === patientId);

export const getRecommendationsForDoctor = (doctorId: string): CareRecommendation[] =>
  doctorRecommendations.filter((r) => r.doctorId === doctorId);

export const getConsultationNotesForPatient = (patientId: string): ConsultationNote[] =>
  doctorConsultationNotes.filter((n) => n.patientId === patientId);

export const getDoctorAlerts = (doctorId: string, todayISO: string = DOCTOR_TODAY_ISO): DoctorAlert[] => {
  const patients = getPatientsForDoctor(doctorId);
  const alerts: DoctorAlert[] = [];

  patients
    .filter((p) => p.riskLevel === 'HIGH')
    .forEach((p) =>
      alerts.push({
        id: `alert_risk_${p.patientId}`,
        patientId: p.patientId,
        patientName: p.name,
        severity: 'high',
        message: `${p.name} is flagged high-risk${p.antenatal?.highRiskFactors?.length ? `: ${p.antenatal.highRiskFactors[0]}` : '.'}`,
      })
    );

  getFollowUpsDue(doctorId, todayISO).forEach((a) =>
    alerts.push({
      id: `alert_followup_${a.appointmentId}`,
      patientId: a.patientId,
      patientName: a.patientName,
      severity: 'moderate',
      message: `Follow-up overdue for ${a.patientName} (${a.type.toLowerCase()} was due ${a.date}).`,
    })
  );

  getReportsAwaitingReview(doctorId).forEach((r) => {
    const patient = patients.find((p) => p.patientId === r.patientId);
    alerts.push({
      id: `alert_report_${r.id}`,
      patientId: r.patientId || '',
      patientName: patient?.name || 'Unknown patient',
      severity: 'info',
      message: `${r.name} for ${patient?.name || 'a patient'} is awaiting your review.`,
    });
  });

  return alerts;
};

export const getDoctorDashboardSummary = (
  doctorId: string,
  todayISO: string = DOCTOR_TODAY_ISO
): DoctorDashboardSummary => ({
  totalPatients: getPatientsForDoctor(doctorId).length,
  todaysAppointmentsCount: getTodaysAppointments(doctorId, todayISO).length,
  followUpsDueCount: getFollowUpsDue(doctorId, todayISO).length,
  reportsAwaitingReviewCount: getReportsAwaitingReview(doctorId).length,
});
