import { mockChild, mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { MOTHER_TODAY_ISO } from '@/data/motherAppointmentsMockData';
import { MotherVaccinationRecord, VaccineRecipientType } from '@/types';

export { MOTHER_TODAY_ISO };

/**
 * Realistic mock immunization history covering Ananya Kapoor's antenatal
 * tetanus/flu doses and Vihaan's National Immunization Schedule doses,
 * mirroring the same mother/child/doctor/hospital records used across
 * Modules 1A-1C and the Appointments/Medications modules.
 */
export const motherVaccinations: MotherVaccinationRecord[] = [
  // --- Maternal doses (antenatal) ---
  {
    vaccinationId: 'mvac_01',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    vaccineName: 'Tetanus Toxoid (TT)',
    doseLabel: 'Dose 1 of 2',
    recommendedDate: '2026-02-05',
    givenDate: '2026-02-05',
    status: 'completed',
    location: 'OPD Block A, Room 204',
    notes: 'Given at first-trimester registration visit.',
    administeredBy: mockDoctor.name,
  },
  {
    vaccinationId: 'mvac_02',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    vaccineName: 'Tetanus Toxoid (TT)',
    doseLabel: 'Dose 2 of 2',
    recommendedDate: '2026-03-05',
    givenDate: '2026-03-05',
    status: 'completed',
    location: 'OPD Block A, Room 204',
    notes: 'Second dose given four weeks after TT-1, as per antenatal schedule.',
  },
  {
    vaccinationId: 'mvac_03',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    vaccineName: 'Influenza (Flu) Vaccine',
    doseLabel: 'Antenatal Dose',
    recommendedDate: '2026-05-15',
    status: 'overdue',
    location: 'OPD Block A, Room 204',
    notes: 'Recommended anytime during pregnancy for maternal and newborn protection. Catch-up dose still advised postpartum — please discuss with your doctor.',
    reminderEnabled: true,
  },

  // --- Child doses (National Immunization Schedule, Vihaan) ---
  {
    vaccinationId: 'mvac_04',
    motherId: mockMother.id,
    childId: mockChild.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    vaccineName: 'BCG, OPV-0, Hepatitis B-1',
    doseLabel: 'Birth Dose',
    recommendedDate: '2026-07-18',
    givenDate: '2026-07-19',
    status: 'completed',
    location: 'Pediatric Wing',
    notes: 'Administered a day after birth, as per newborn protocol.',
    administeredBy: 'Sunrise Hospital Care Team',
  },
  {
    vaccinationId: 'mvac_05',
    motherId: mockMother.id,
    childId: mockChild.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    vaccineName: 'Pentavalent-1, OPV-1, Rotavirus-1, PCV-1',
    doseLabel: '6 Weeks',
    recommendedDate: '2026-08-29',
    status: 'due_soon',
    location: 'Pediatric Wing',
    notes: 'Scheduled alongside the 6-week postpartum & pediatric checkup.',
    reminderEnabled: true,
  },
  {
    vaccinationId: 'mvac_06',
    motherId: mockMother.id,
    childId: mockChild.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    vaccineName: 'Pentavalent-2, OPV-2, Rotavirus-2',
    doseLabel: '10 Weeks',
    recommendedDate: '2026-09-26',
    status: 'upcoming',
    location: 'Pediatric Wing',
  },
  {
    vaccinationId: 'mvac_07',
    motherId: mockMother.id,
    childId: mockChild.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    vaccineName: 'Pentavalent-3, OPV-3, PCV-2',
    doseLabel: '14 Weeks',
    recommendedDate: '2026-10-24',
    status: 'upcoming',
    location: 'Pediatric Wing',
  },
  {
    vaccinationId: 'mvac_08',
    motherId: mockMother.id,
    childId: mockChild.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    vaccineName: 'Measles-Rubella (MR-1)',
    doseLabel: '9 Months',
    recommendedDate: '2027-04-18',
    status: 'upcoming',
    location: 'Pediatric Wing',
  },
];

export const getVaccinationsForMother = (motherId: string): MotherVaccinationRecord[] =>
  motherVaccinations
    .filter((v) => v.motherId === motherId)
    .slice()
    .sort((a, b) => a.recommendedDate.localeCompare(b.recommendedDate));

export const getDueOrUpcomingVaccinations = (motherId: string): MotherVaccinationRecord[] =>
  getVaccinationsForMother(motherId).filter(
    (v) => v.status === 'upcoming' || v.status === 'due_soon' || v.status === 'overdue'
  );

export const getCompletedVaccinations = (motherId: string): MotherVaccinationRecord[] =>
  getVaccinationsForMother(motherId)
    .filter((v) => v.status === 'completed')
    .slice()
    .reverse();

export const getVaccinationsByRecipient = (
  motherId: string,
  recipientType: VaccineRecipientType
): MotherVaccinationRecord[] =>
  getVaccinationsForMother(motherId).filter((v) => v.recipientType === recipientType);
