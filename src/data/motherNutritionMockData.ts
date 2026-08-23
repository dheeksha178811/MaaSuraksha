import { mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import {
  DailyGoalItem,
  ExerciseGuidanceItem,
  FoodGuidanceItem,
  FoodGuidanceType,
  NutritionPlanSummary,
  NutritionReminder,
} from '@/types';

/**
 * Realistic postpartum & breastfeeding nutrition/exercise guidance for
 * Ananya Kapoor, reviewed by her assigned doctor. Ties to the same
 * mother/doctor/hospital records used across the other completed modules,
 * and cross-references the Iron & Folic Acid + Calcium and Postnatal
 * Multivitamin already tracked in the Medications module.
 */
export const motherNutritionPlan: NutritionPlanSummary = {
  planId: 'nut_plan_01',
  motherId: mockMother.id,
  doctorId: mockDoctor.id,
  doctorName: mockDoctor.name,
  hospitalId: mockHospital.id,
  hospitalName: mockHospital.name,
  stageLabel: 'Postpartum & Breastfeeding',
  dailyCalorieTarget: '~2,300-2,500 kcal/day',
  proteinTarget: '75-100 g/day',
  hydrationTargetLiters: 3.0,
  focusSummary: 'Support healing, replenish iron stores, and sustain a healthy breast milk supply.',
  lastReviewedDate: '2026-08-01',
  notes: 'Reviewed at the 2-week postpartum check. Will be reassessed at the 6-week postpartum review on 2026-08-29.',
};

export const motherFoodGuidance: FoodGuidanceItem[] = [
  // --- Recommended ---
  {
    foodId: 'food_01',
    motherId: mockMother.id,
    type: 'RECOMMENDED',
    category: 'IRON_RICH',
    name: 'Iron-Rich Foods',
    description: 'Replenishes iron stores lost during delivery and supports energy levels.',
    examples: ['Ragi', 'Spinach', 'Lentils (dal)', 'Jaggery', 'Pomegranate'],
  },
  {
    foodId: 'food_02',
    motherId: mockMother.id,
    type: 'RECOMMENDED',
    category: 'PROTEIN',
    name: 'Protein-Rich Foods',
    description: "Supports tissue repair and healthy milk production.",
    examples: ['Eggs', 'Paneer', 'Moong dal', 'Chicken', 'Fish'],
  },
  {
    foodId: 'food_03',
    motherId: mockMother.id,
    type: 'RECOMMENDED',
    category: 'CALCIUM',
    name: 'Calcium & Dairy',
    description: 'Maintains bone health for you while breastfeeding.',
    examples: ['Milk', 'Curd', 'Sesame seeds (til)', 'Ragi'],
  },
  {
    foodId: 'food_04',
    motherId: mockMother.id,
    type: 'RECOMMENDED',
    category: 'FIBER',
    name: 'Fiber-Rich Foods',
    description: 'Eases postpartum digestion and helps prevent constipation.',
    examples: ['Oats', 'Whole grains', 'Fresh fruit', 'Vegetables'],
  },
  {
    foodId: 'food_05',
    motherId: mockMother.id,
    type: 'RECOMMENDED',
    category: 'GENERAL',
    name: 'Lactation-Supportive Foods',
    description: 'Traditionally used to support a healthy, steady milk supply.',
    examples: ['Fenugreek (methi)', 'Garlic', 'Fennel seeds (saunf)', 'Oats'],
  },
  {
    foodId: 'food_06',
    motherId: mockMother.id,
    type: 'RECOMMENDED',
    category: 'HYDRATING',
    name: 'Hydrating Foods & Drinks',
    description: 'Complements your fluid intake and replenishes electrolytes, especially before and after feeds.',
    examples: ['Coconut water', 'Warm soups', 'Buttermilk (chaas)', 'Fresh fruit'],
  },

  // --- Limit ---
  {
    foodId: 'food_07',
    motherId: mockMother.id,
    type: 'LIMIT',
    category: 'GENERAL',
    name: 'Caffeine',
    description: "Limit tea/coffee to 1-2 cups a day — excess caffeine passes into breast milk and can affect the baby's sleep.",
    examples: ['Tea', 'Coffee', 'Cola drinks'],
  },
  {
    foodId: 'food_08',
    motherId: mockMother.id,
    type: 'LIMIT',
    category: 'GENERAL',
    name: 'High-Mercury Fish',
    description: 'Avoid king mackerel, shark, and swordfish; choose low-mercury options like rohu or salmon instead.',
    examples: ['King mackerel', 'Shark', 'Swordfish'],
  },
  {
    foodId: 'food_09',
    motherId: mockMother.id,
    type: 'LIMIT',
    category: 'GENERAL',
    name: 'Alcohol',
    description: 'Best avoided while breastfeeding. If consumed occasionally, wait at least 2-3 hours before nursing.',
  },
  {
    foodId: 'food_10',
    motherId: mockMother.id,
    type: 'LIMIT',
    category: 'GENERAL',
    name: 'Sugary & Processed Foods',
    description: 'Limit packaged snacks and sugary drinks — they add empty calories without supporting recovery.',
    examples: ['Packaged snacks', 'Sugary drinks', 'Sweets'],
  },
  {
    foodId: 'food_11',
    motherId: mockMother.id,
    type: 'LIMIT',
    category: 'GENERAL',
    name: 'Very Spicy or Gas-Forming Foods',
    description: 'Large amounts of very spicy food or excess raw cabbage/beans may cause discomfort for some breastfeeding babies — moderate rather than eliminate.',
    examples: ['Very spicy curries', 'Raw cabbage', 'Excess beans'],
  },
];

export const motherExerciseGuidance: ExerciseGuidanceItem[] = [
  {
    exerciseId: 'ex_01',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    name: 'Gentle Walking',
    category: 'WALKING',
    recommendedFrequency: 'Daily',
    recommendedDuration: '10-15 minutes, gradually increasing',
    clearance: 'CLEARED',
    description: 'Gentle daily walks support circulation and mood without straining healing tissue.',
    safetyNote: 'Stop and rest if you feel pain, dizziness, or notice heavier bleeding.',
  },
  {
    exerciseId: 'ex_02',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    name: 'Pelvic Floor (Kegel) Exercises',
    category: 'PELVIC_FLOOR',
    recommendedFrequency: '3 sets a day',
    recommendedDuration: '5 minutes per set',
    clearance: 'CLEARED',
    description: 'Rebuilds pelvic floor strength after delivery; safe to start early after a normal delivery.',
  },
  {
    exerciseId: 'ex_03',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    name: 'Deep Breathing & Gentle Stretching',
    category: 'STRETCHING',
    recommendedFrequency: 'Daily',
    recommendedDuration: '10 minutes',
    clearance: 'CLEARED',
    description: 'Supports relaxation and gentle mobility without straining your core.',
  },
  {
    exerciseId: 'ex_04',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    name: 'Core & Abdominal Strengthening',
    category: 'STRENGTH',
    recommendedFrequency: 'Not yet started',
    recommendedDuration: '—',
    clearance: 'PENDING_CLEARANCE',
    description: 'Structured core work should begin only once healing is confirmed.',
    safetyNote: 'Wait for your 6-week postpartum review on 2026-08-29 before starting core or abdominal exercises.',
  },
  {
    exerciseId: 'ex_05',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    doctorName: mockDoctor.name,
    name: 'Rest & Recovery',
    category: 'REST',
    recommendedFrequency: 'As needed',
    recommendedDuration: 'Whenever the baby sleeps',
    clearance: 'CLEARED',
    description: 'Prioritizing rest supports healing and milk supply just as much as movement does.',
  },
];

export const motherDailyGoals: DailyGoalItem[] = [
  {
    goalId: 'goal_01',
    motherId: mockMother.id,
    category: 'HYDRATION',
    title: 'Water Intake',
    targetLabel: '8 glasses',
    targetCount: 8,
    completedCount: 3,
  },
  {
    goalId: 'goal_02',
    motherId: mockMother.id,
    category: 'NUTRITION',
    title: 'Protein-Rich Meals',
    targetLabel: '3 servings',
    targetCount: 3,
    completedCount: 1,
  },
  {
    goalId: 'goal_03',
    motherId: mockMother.id,
    category: 'ACTIVITY',
    title: 'Gentle Walk',
    targetLabel: '15 minutes',
    targetCount: 1,
    completedCount: 0,
  },
  {
    goalId: 'goal_04',
    motherId: mockMother.id,
    category: 'REST',
    title: 'Rest Breaks',
    targetLabel: '2 breaks',
    targetCount: 2,
    completedCount: 1,
  },
];

export const motherNutritionReminders: NutritionReminder[] = [
  {
    reminderId: 'rem_01',
    motherId: mockMother.id,
    title: 'Take Iron & Folic Acid + Calcium',
    description: 'Take with food, ideally with a source of Vitamin C to aid absorption.',
    timing: 'After breakfast',
    enabled: true,
  },
  {
    reminderId: 'rem_02',
    motherId: mockMother.id,
    title: 'Drink Water Before Every Feed',
    description: 'Keeping a water bottle within reach makes it easier to stay hydrated while nursing.',
    timing: 'Every feed',
    enabled: true,
  },
  {
    reminderId: 'rem_03',
    motherId: mockMother.id,
    title: 'Take Postnatal Multivitamin',
    description: 'Supports nutrient recovery during breastfeeding.',
    timing: 'Morning',
    enabled: true,
  },
  {
    reminderId: 'rem_04',
    motherId: mockMother.id,
    title: 'Stretch or Take a Short Walk',
    description: 'A short gentle walk or stretch break to support circulation and mood.',
    timing: 'Afternoon',
    enabled: false,
  },
];

export const getNutritionPlanForMother = (motherId: string): NutritionPlanSummary | undefined =>
  motherNutritionPlan.motherId === motherId ? motherNutritionPlan : undefined;

export const getFoodGuidanceForMother = (motherId: string, type?: FoodGuidanceType): FoodGuidanceItem[] =>
  motherFoodGuidance.filter((f) => f.motherId === motherId && (!type || f.type === type));

export const getExerciseGuidanceForMother = (motherId: string): ExerciseGuidanceItem[] =>
  motherExerciseGuidance.filter((e) => e.motherId === motherId);

export const getDailyGoalsForMother = (motherId: string): DailyGoalItem[] =>
  motherDailyGoals.filter((g) => g.motherId === motherId);

export const getRemindersForMother = (motherId: string): NutritionReminder[] =>
  motherNutritionReminders.filter((r) => r.motherId === motherId);
