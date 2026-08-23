import {
  Apple,
  Droplets,
  Footprints,
  LucideIcon,
  Moon,
  PersonStanding,
  Salad,
  ShieldCheck,
  Utensils,
  Wind,
} from 'lucide-react';
import { DailyGoalCategory, ExerciseCategory, ExerciseClearance, FoodCategory } from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

export const getFoodCategoryIcon = (category: FoodCategory): LucideIcon => {
  switch (category) {
    case 'PROTEIN':
      return Utensils;
    case 'IRON_RICH':
      return Apple;
    case 'CALCIUM':
      return ShieldCheck;
    case 'FIBER':
      return Salad;
    case 'HYDRATING':
      return Droplets;
    default:
      return Utensils;
  }
};

export const getFoodCategoryLabel = (category: FoodCategory): string => {
  switch (category) {
    case 'PROTEIN':
      return 'Protein';
    case 'IRON_RICH':
      return 'Iron';
    case 'CALCIUM':
      return 'Calcium';
    case 'FIBER':
      return 'Fiber';
    case 'HYDRATING':
      return 'Hydration';
    case 'GENERAL':
      return 'General';
    default:
      return category;
  }
};

export const getExerciseCategoryIcon = (category: ExerciseCategory): LucideIcon => {
  switch (category) {
    case 'WALKING':
      return Footprints;
    case 'PELVIC_FLOOR':
      return PersonStanding;
    case 'STRETCHING':
      return Wind;
    case 'STRENGTH':
      return PersonStanding;
    case 'REST':
      return Moon;
    default:
      return PersonStanding;
  }
};

export const getExerciseClearanceBadgeVariant = (clearance: ExerciseClearance): BadgeVariant =>
  clearance === 'CLEARED' ? 'sage' : 'sandal';

export const getExerciseClearanceLabel = (clearance: ExerciseClearance): string =>
  clearance === 'CLEARED' ? 'Cleared' : 'Pending Clearance';

export const getDailyGoalCategoryIcon = (category: DailyGoalCategory): LucideIcon => {
  switch (category) {
    case 'HYDRATION':
      return Droplets;
    case 'NUTRITION':
      return Salad;
    case 'ACTIVITY':
      return Footprints;
    case 'REST':
      return Moon;
    default:
      return Salad;
  }
};
