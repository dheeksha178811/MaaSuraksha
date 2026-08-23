import { mockChild, mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { MOTHER_TODAY_ISO } from '@/data/motherAppointmentsMockData';
import { MotherMedication } from '@/types';

export { MOTHER_TODAY_ISO };

/**
 * Realistic mock medication history spanning Ananya Kapoor's antenatal
 * pregnancy stage through her current postnatal stage, mirroring the same
 * mother/doctor/hospital/child records used across Modules 1A-1C and the
 * Appointments module.
 */
export const motherMedications: MotherMedication[] = [
  // --- Active (current postnatal stage) ---
  {
    medicationId: 'med_m01',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    name: 'Iron & Folic Acid + Calcium',
    dosage: '1 tablet each',
    frequency: 'Once daily',
    timing: 'After breakfast',
    startDate: '2026-07-19',
    status: 'active',
    instructions: 'Continue through the postpartum recovery period to support healing and breastfeeding.',
    caution: 'Take with food to reduce stomach upset. Avoid taking calcium and iron tablets at the exact same time — space by a few hours if possible.',
  },
  {
    medicationId: 'med_m02',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    name: 'Postnatal Multivitamin',
    dosage: '1 capsule',
    frequency: 'Once daily',
    timing: 'Morning',
    startDate: '2026-07-19',
    status: 'active',
    instructions: 'Supports nutrient recovery during breastfeeding.',
  },
  {
    medicationId: 'med_m03',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    name: 'Vitamin D3 Drops',
    dosage: '400 IU',
    frequency: 'Once daily',
    timing: 'Morning, with a feed',
    startDate: '2026-07-25',
    status: 'active',
    instructions: 'Routine newborn vitamin D supplementation for Vihaan.',
    childId: mockChild.id,
    childName: mockChild.name,
  },

  // --- Completed (earlier antenatal + delivery stage) ---
  {
    medicationId: 'med_m04',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    name: 'Folic Acid',
    dosage: '5 mg',
    frequency: 'Once daily',
    timing: 'Morning, before food',
    startDate: '2026-02-05',
    endDate: '2026-07-18',
    status: 'completed',
    instructions: 'First-trimester neural tube defect prevention supplementation, continued through pregnancy.',
  },
  {
    medicationId: 'med_m05',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    name: 'Elemental Iron Supplement',
    dosage: '60 mg',
    frequency: 'Once daily',
    timing: 'Afternoon, with a source of Vitamin C',
    startDate: '2026-04-01',
    endDate: '2026-07-18',
    status: 'completed',
    instructions: 'Antenatal anaemia prevention, reviewed at every trimester visit.',
    caution: 'Was taken with citrus juice to improve absorption; avoid tea/coffee within an hour of dosing.',
  },
  {
    medicationId: 'med_m06',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    name: 'Calcium + Vitamin D3',
    dosage: '500 mg / 250 IU',
    frequency: 'Twice daily',
    timing: 'Morning & Night, with meals',
    startDate: '2026-03-10',
    endDate: '2026-07-18',
    status: 'completed',
    instructions: 'Antenatal bone health and fetal skeletal development support.',
  },
  {
    medicationId: 'med_m07',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    name: 'Paracetamol',
    dosage: '500 mg',
    frequency: 'As needed, up to 3 times daily',
    timing: 'As needed for pain',
    startDate: '2026-07-18',
    endDate: '2026-07-25',
    status: 'completed',
    instructions: 'Short course for post-delivery discomfort. Stopped once pain resolved.',
    caution: 'Do not exceed 3 doses in 24 hours. Discontinue if fever persists beyond 2 days.',
  },
];

export const getMedicationsForMother = (motherId: string): MotherMedication[] =>
  motherMedications
    .filter((m) => m.motherId === motherId)
    .slice()
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

export const getActiveMedicationsForMother = (motherId: string): MotherMedication[] =>
  getMedicationsForMother(motherId).filter((m) => m.status === 'active');

export const getCompletedMedicationsForMother = (motherId: string): MotherMedication[] =>
  getMedicationsForMother(motherId).filter((m) => m.status === 'completed');
