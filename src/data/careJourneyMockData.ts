import { mockAppointments, mockChild, mockDoctor, mockHospital, mockMother, mockVaccinations } from '@/data/mockData';

export type CareStage =
  | 'EARLY_PREGNANCY'
  | 'ANTENATAL_CARE'
  | 'LATE_PREGNANCY'
  | 'POSTPARTUM'
  | 'NEWBORN'
  | 'INFANT'
  | 'EARLY_CHILDHOOD';

export interface CareStageDetails {
  label: string;
  dashboardSubtitle: string;
  progress: number;
  focus: string;
  nextEvent: string;
  reminder: string;
}

export const DEFAULT_CARE_STAGE: CareStage = 'POSTPARTUM';

export const CARE_STAGE_DETAILS: Record<CareStage, CareStageDetails> = {
  EARLY_PREGNANCY: {
    label: 'Early Pregnancy',
    dashboardSubtitle: 'Your first steps toward a healthy pregnancy.',
    progress: 16,
    focus: 'Pregnancy confirmation and first consultation',
    nextEvent: 'First consultation on January 24',
    reminder: 'Bring your pregnancy confirmation and current medicines to your first visit.',
  },
  ANTENATAL_CARE: {
    label: 'Antenatal Care',
    dashboardSubtitle: 'Your pregnancy care plan, visits, and tests in one place.',
    progress: 48,
    focus: 'Regular antenatal visits and screening tests',
    nextEvent: 'Anomaly scan on March 18',
    reminder: 'Keep your antenatal visit schedule and hydration routine up to date.',
  },
  LATE_PREGNANCY: {
    label: 'Late Pregnancy',
    dashboardSubtitle: 'Preparing calmly and confidently for delivery.',
    progress: 82,
    focus: 'Birth planning and final trimester checks',
    nextEvent: 'Growth scan on June 28',
    reminder: 'Review your hospital bag and delivery preferences with your doctor.',
  },
  POSTPARTUM: {
    label: 'Postpartum Recovery',
    dashboardSubtitle: 'Support for your recovery and your growing family.',
    progress: 100,
    focus: 'Mother and baby six-week wellness review',
    nextEvent: '6-week checkup on August 29',
    reminder: 'Rest when possible, stay hydrated, and keep your postpartum checkup.',
  },
  NEWBORN: {
    label: 'Newborn Care',
    dashboardSubtitle: 'Gentle guidance for the first weeks with your baby.',
    progress: 100,
    focus: 'Newborn screening and feeding support',
    nextEvent: 'Newborn wellness visit on August 29',
    reminder: 'Keep your baby warm and note feeding, sleep, and wet-diaper patterns.',
  },
  INFANT: {
    label: 'Infant Care',
    dashboardSubtitle: 'Growing together through your baby\'s first year.',
    progress: 100,
    focus: 'Immunization and developmental milestones',
    nextEvent: 'Next vaccination on August 29',
    reminder: 'Bring the child health record to every vaccination visit.',
  },
  EARLY_CHILDHOOD: {
    label: 'Early Childhood',
    dashboardSubtitle: 'Steady support for your child\'s early years.',
    progress: 100,
    focus: 'Growth, nutrition, and early milestones',
    nextEvent: 'Developmental review on September 18',
    reminder: 'Celebrate new skills and share any concerns at the next review.',
  },
};

export const pregnancyJourney = {
  currentWeek: 32,
  expectedDeliveryDate: '2026-07-25',
  deliveryDate: mockMother.deliveryDate,
  previousPregnancy: 'First pregnancy recorded in MaaSuraksha',
  doctor: mockDoctor,
  hospital: mockHospital,
  appointments: mockAppointments,
  recentReport: '28-week growth scan - within expected range',
  upcomingTest: 'Final trimester growth scan',
  vaccinations: mockVaccinations,
};

export { mockChild, mockDoctor, mockHospital, mockMother };
