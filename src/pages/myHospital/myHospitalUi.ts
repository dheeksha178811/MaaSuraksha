import { Baby, FlaskConical, HeartPulse, LucideIcon, ShieldAlert, ShieldPlus, Stethoscope } from 'lucide-react';
import { HospitalServiceCategory } from '@/types';

export const HOSPITAL_SERVICE_CATEGORY_LABELS: Record<HospitalServiceCategory, string> = {
  ANTENATAL: 'Antenatal Care',
  DELIVERY: 'Labor & Delivery',
  POSTNATAL: 'Postnatal Care',
  PEDIATRIC: 'Pediatric Care',
  DIAGNOSTIC: 'Diagnostics',
  EMERGENCY: 'Emergency',
};

export const getHospitalServiceCategoryIcon = (category: HospitalServiceCategory): LucideIcon => {
  switch (category) {
    case 'ANTENATAL':
      return HeartPulse;
    case 'DELIVERY':
      return ShieldPlus;
    case 'POSTNATAL':
      return Stethoscope;
    case 'PEDIATRIC':
      return Baby;
    case 'DIAGNOSTIC':
      return FlaskConical;
    case 'EMERGENCY':
      return ShieldAlert;
    default:
      return Stethoscope;
  }
};
