import { mockChild, mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { MOTHER_TODAY_ISO } from '@/data/motherAppointmentsMockData';
import { GrowthMeasurement, GrowthRecipientType, MilestoneRecord } from '@/types';

export { MOTHER_TODAY_ISO };

/**
 * Realistic mock growth measurement history covering Ananya Kapoor's
 * antenatal weight trend through postpartum recovery, and Vihaan's
 * weight/height/head-circumference measurements since birth. Dates align
 * with the clinical visits already recorded in the Appointments module
 * (e.g. the 20-week anomaly scan, 35-week growth scan, 38-week review, and
 * 2-week postpartum check) so the story stays consistent across modules.
 */
export const motherGrowthMeasurements: GrowthMeasurement[] = [
  // --- Maternal weight trend ---
  {
    measurementId: 'mgrw_01',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    date: '2026-02-05',
    weightKg: 58.0,
    context: 'First-trimester registration baseline',
  },
  {
    measurementId: 'mgrw_02',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    date: '2026-04-20',
    weightKg: 61.5,
    context: '20-week anomaly scan visit',
  },
  {
    measurementId: 'mgrw_03',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    date: '2026-06-28',
    weightKg: 65.4,
    context: '35-week growth scan visit',
  },
  {
    measurementId: 'mgrw_04',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    date: '2026-07-14',
    weightKg: 68.2,
    context: '38-week final antenatal review',
    notes: 'Healthy total gestational weight gain, within expected range.',
  },
  {
    measurementId: 'mgrw_05',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    date: '2026-08-01',
    weightKg: 63.5,
    context: '2-week postpartum check',
    notes: 'Normal early postpartum weight loss, recovery on track.',
  },

  // --- Child growth (weight, height, head circumference) ---
  {
    measurementId: 'mgrw_06',
    motherId: mockMother.id,
    childId: mockChild.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    date: '2026-07-18',
    weightKg: mockChild.birthWeightKg,
    heightCm: 49,
    headCircumferenceCm: 34,
    context: 'Birth measurements',
  },
  {
    measurementId: 'mgrw_07',
    motherId: mockMother.id,
    childId: mockChild.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    date: '2026-08-01',
    weightKg: 3.6,
    heightCm: 50.5,
    headCircumferenceCm: 35,
    context: 'Newborn 2-week neonatal check',
  },
  {
    measurementId: 'mgrw_08',
    motherId: mockMother.id,
    childId: mockChild.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    hospitalId: mockHospital.id,
    hospitalName: mockHospital.name,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    date: '2026-08-20',
    weightKg: mockChild.currentWeightKg,
    heightCm: 53,
    headCircumferenceCm: 36.5,
    context: 'Routine growth check-in',
    notes: 'Feeding well, weight gain tracking steadily along the expected curve.',
  },
];

/**
 * Milestone tracking covering Vihaan's early developmental milestones (0-3
 * months) across motor, cognitive, social, and language domains, plus
 * Ananya's postpartum recovery milestones.
 */
export const motherMilestones: MilestoneRecord[] = [
  // --- Maternal recovery milestones ---
  {
    milestoneId: 'mms_01',
    motherId: mockMother.id,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    category: 'MATERNAL_RECOVERY',
    title: 'Perineal/postpartum healing review',
    description: 'Initial recovery check confirming healing is progressing normally after a normal delivery.',
    targetAgeRange: '2 Weeks Postpartum',
    status: 'achieved',
    achievedDate: '2026-08-01',
    notes: 'Reviewed and confirmed by Dr. Priya Menon at the 2-week postpartum check.',
  },
  {
    milestoneId: 'mms_02',
    motherId: mockMother.id,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    category: 'MATERNAL_RECOVERY',
    title: '6-week postpartum recovery review',
    description: 'Full recovery check-up including physical exam and family planning discussion.',
    targetAgeRange: '6 Weeks Postpartum',
    status: 'due_soon',
    notes: 'Scheduled alongside the 6-week postpartum & pediatric checkup on 2026-08-29.',
  },
  {
    milestoneId: 'mms_03',
    motherId: mockMother.id,
    recipientType: 'MOTHER',
    recipientName: mockMother.name,
    category: 'MATERNAL_RECOVERY',
    title: 'Cleared for light exercise',
    description: 'Doctor clearance to gradually resume light physical activity and walking routines.',
    targetAgeRange: '6-8 Weeks Postpartum',
    status: 'upcoming',
  },

  // --- Child developmental milestones ---
  {
    milestoneId: 'mms_04',
    motherId: mockMother.id,
    childId: mockChild.id,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    category: 'MOTOR',
    title: 'Lifts head briefly during tummy time',
    description: 'Vihaan can briefly lift and hold his head up while lying on his tummy.',
    targetAgeRange: 'By 4-6 Weeks',
    status: 'achieved',
    achievedDate: '2026-08-15',
  },
  {
    milestoneId: 'mms_05',
    motherId: mockMother.id,
    childId: mockChild.id,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    category: 'SOCIAL',
    title: 'Begins to smile responsively',
    description: 'Starting to smile in response to your voice or face, not just reflexively.',
    targetAgeRange: '6-8 Weeks',
    status: 'due_soon',
  },
  {
    milestoneId: 'mms_06',
    motherId: mockMother.id,
    childId: mockChild.id,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    category: 'COGNITIVE',
    title: 'Follows objects with eyes',
    description: 'Tracks a moving object or face with his eyes across his field of view.',
    targetAgeRange: 'By 8 Weeks',
    status: 'due_soon',
  },
  {
    milestoneId: 'mms_07',
    motherId: mockMother.id,
    childId: mockChild.id,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    category: 'LANGUAGE',
    title: 'Coos and makes vowel sounds',
    description: 'Begins making soft cooing sounds in response to interaction.',
    targetAgeRange: '2-3 Months',
    status: 'upcoming',
  },
  {
    milestoneId: 'mms_08',
    motherId: mockMother.id,
    childId: mockChild.id,
    recipientType: 'CHILD',
    recipientName: mockChild.name,
    category: 'MOTOR',
    title: 'Holds head steady when upright',
    description: 'Can hold his head steady and upright without support for short periods.',
    targetAgeRange: '3-4 Months',
    status: 'upcoming',
  },
];

export const getMeasurementsForMother = (
  motherId: string,
  source: GrowthMeasurement[] = motherGrowthMeasurements
): GrowthMeasurement[] =>
  source
    .filter((m) => m.motherId === motherId)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

export const getMeasurementsByRecipient = (
  motherId: string,
  recipientType: GrowthRecipientType,
  source: GrowthMeasurement[] = motherGrowthMeasurements
): GrowthMeasurement[] => getMeasurementsForMother(motherId, source).filter((m) => m.recipientType === recipientType);

export const getLatestMeasurement = (
  motherId: string,
  recipientType: GrowthRecipientType,
  source: GrowthMeasurement[] = motherGrowthMeasurements
): GrowthMeasurement | undefined => {
  const records = getMeasurementsByRecipient(motherId, recipientType, source);
  return records[records.length - 1];
};

/**
 * Returns the measurement immediately before the given one for the same
 * recipient, used to compute a trend delta (e.g. weight gained/lost since
 * the last visit). Pass the caller's current (possibly locally-mutated)
 * measurement list as `source` so newly logged entries are accounted for.
 */
export const getPreviousMeasurement = (
  motherId: string,
  measurement: GrowthMeasurement,
  source: GrowthMeasurement[] = motherGrowthMeasurements
): GrowthMeasurement | undefined => {
  const records = getMeasurementsByRecipient(motherId, measurement.recipientType, source);
  const index = records.findIndex((m) => m.measurementId === measurement.measurementId);
  return index > 0 ? records[index - 1] : undefined;
};

export const getMilestonesForMother = (motherId: string): MilestoneRecord[] =>
  motherMilestones.filter((m) => m.motherId === motherId);

export const getMilestonesByRecipient = (
  motherId: string,
  recipientType: GrowthRecipientType
): MilestoneRecord[] => getMilestonesForMother(motherId).filter((m) => m.recipientType === recipientType);

const nextMockMeasurementId = (existing: GrowthMeasurement[]): string => {
  const max = existing.reduce((highest, m) => {
    const match = /^mgrw_(\d+)$/.exec(m.measurementId);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(highest, num);
  }, 0);
  return `mgrw_${String(max + 1).padStart(2, '0')}`;
};

export interface LogMeasurementInput {
  recipientType: GrowthRecipientType;
  date: string;
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  notes?: string;
}

/**
 * Builds a new mother-logged (home) growth measurement. Frontend-only: the
 * caller is responsible for holding the returned record in local state since
 * there is no backend to persist it yet.
 */
export const createLoggedMeasurement = (
  input: LogMeasurementInput,
  existing: GrowthMeasurement[] = motherGrowthMeasurements
): GrowthMeasurement => ({
  measurementId: nextMockMeasurementId(existing),
  motherId: mockMother.id,
  childId: input.recipientType === 'CHILD' ? mockChild.id : undefined,
  doctorId: mockDoctor.id,
  doctorName: mockDoctor.name,
  hospitalId: mockHospital.id,
  hospitalName: mockHospital.name,
  recipientType: input.recipientType,
  recipientName: input.recipientType === 'MOTHER' ? mockMother.name : mockChild.name,
  date: input.date,
  weightKg: input.weightKg,
  heightCm: input.heightCm,
  headCircumferenceCm: input.headCircumferenceCm,
  context: 'Logged at home by mother',
  notes: input.notes,
  loggedByMother: true,
});
