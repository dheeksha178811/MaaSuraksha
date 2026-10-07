import { Apple, HeartHandshake, IndianRupee, LucideIcon, Syringe } from 'lucide-react';
import { SchemeCategory } from '@/types';

export const getSchemeCategoryIcon = (category: SchemeCategory): LucideIcon => {
  switch (category) {
    case 'FINANCIAL_SUPPORT':
      return IndianRupee;
    case 'MATERNITY_CARE':
      return HeartHandshake;
    case 'NUTRITION':
      return Apple;
    case 'IMMUNIZATION':
      return Syringe;
  }
};
