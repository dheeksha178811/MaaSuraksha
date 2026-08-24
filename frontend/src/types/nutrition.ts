// ---------------------------------------------------------------------------
// Module 9: Nutrition & Exercise (surfaced as a tab within the My Care
// workspace at /mother/timeline, alongside the Health Timeline).
// Carries explicit motherId / doctorId / hospitalId linkage, and stable
// per-item IDs, so this mock shape can be swapped for backend/MongoDB data
// later without any UI changes.
// ---------------------------------------------------------------------------

export interface NutritionPlanSummary {
  planId: string;
  motherId: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  stageLabel: string; // e.g. "Postpartum & Breastfeeding"
  dailyCalorieTarget: string; // e.g. "~2300-2500 kcal/day"
  proteinTarget: string; // e.g. "75-100 g/day"
  hydrationTargetLiters: number;
  focusSummary: string;
  lastReviewedDate: string;
  notes?: string;
}

export type FoodGuidanceType = 'RECOMMENDED' | 'LIMIT';
export type FoodCategory = 'PROTEIN' | 'IRON_RICH' | 'CALCIUM' | 'FIBER' | 'HYDRATING' | 'GENERAL';

export interface FoodGuidanceItem {
  foodId: string;
  motherId: string;
  type: FoodGuidanceType;
  category: FoodCategory;
  name: string;
  description: string;
  examples?: string[];
}

export type ExerciseCategory = 'WALKING' | 'PELVIC_FLOOR' | 'STRETCHING' | 'STRENGTH' | 'REST';
export type ExerciseClearance = 'CLEARED' | 'PENDING_CLEARANCE';

export interface ExerciseGuidanceItem {
  exerciseId: string;
  motherId: string;
  doctorId: string;
  doctorName: string;
  name: string;
  category: ExerciseCategory;
  recommendedFrequency: string; // e.g. "Daily"
  recommendedDuration: string; // e.g. "10-15 minutes"
  clearance: ExerciseClearance;
  description: string;
  safetyNote?: string;
}

export type DailyGoalCategory = 'HYDRATION' | 'NUTRITION' | 'ACTIVITY' | 'REST';

export interface DailyGoalItem {
  goalId: string;
  motherId: string;
  category: DailyGoalCategory;
  title: string;
  targetLabel: string; // e.g. "8 glasses"
  targetCount: number;
  completedCount: number;
}

export interface NutritionReminder {
  reminderId: string;
  motherId: string;
  title: string;
  description: string;
  timing: string;
  enabled: boolean;
}
