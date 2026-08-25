import React, { useMemo, useState } from 'react';
import { Activity, Apple, Droplets, Filter, PersonStanding, Salad, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { mockMother } from '@/data/mockData';
import {
  getExerciseGuidanceForMother,
  getFoodGuidanceForMother,
  getNutritionPlanForMother,
} from '@/data/motherNutritionMockData';
import { getHealthTimelineForMother } from '@/data/healthTimelineMockData';
import * as motherService from '@/services/motherService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { DailyGoalItem, FoodGuidanceType, NutritionReminder, TimelineEventCategory } from '@/types';
import { FoodGuidanceCard } from './components/FoodGuidanceCard';
import { ExerciseGuidanceCard } from './components/ExerciseGuidanceCard';
import { DailyGoalCard } from './components/DailyGoalCard';
import { ReminderRow } from './components/ReminderRow';
import { HealthTimeline } from './components/HealthTimeline';
import { TIMELINE_CATEGORY_LABELS } from './timelineUi';

type MainTabId = 'timeline' | 'nutrition';
type NutritionSubTabId = 'guidance' | 'exercise';

const FOOD_FILTER_OPTIONS: { value: 'ALL' | FoodGuidanceType; label: string }[] = [
  { value: 'ALL', label: 'All Foods' },
  { value: 'RECOMMENDED', label: 'Recommended' },
  { value: 'LIMIT', label: 'Limit' },
];

const TIMELINE_FILTER_OPTIONS: { value: 'ALL' | TimelineEventCategory; label: string }[] = [
  { value: 'ALL', label: 'All Events' },
  ...(Object.keys(TIMELINE_CATEGORY_LABELS) as TimelineEventCategory[]).map((value) => ({
    value,
    label: TIMELINE_CATEGORY_LABELS[value],
  })),
];

export const MyCarePage: React.FC = () => {
  const [mainTab, setMainTab] = useState<MainTabId>('nutrition');
  const [nutritionSubTab, setNutritionSubTab] = useState<NutritionSubTabId>('guidance');
  const [foodFilter, setFoodFilter] = useState<'ALL' | FoodGuidanceType>('ALL');
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | TimelineEventCategory>('ALL');

  const timelineEvents = useMemo(() => getHealthTimelineForMother(mockMother.id), []);
  const filteredTimelineEvents = useMemo(
    () => (timelineFilter === 'ALL' ? timelineEvents : timelineEvents.filter((e) => e.category === timelineFilter)),
    [timelineEvents, timelineFilter]
  );

  const [goalsState, reloadGoals] = useAsyncData(() => motherService.getDailyGoals(), []);
  const [remindersState, reloadReminders] = useAsyncData(() => motherService.getNutritionReminders(), []);
  const dailyGoals: DailyGoalItem[] = goalsState.status === 'success' ? goalsState.data : [];
  const reminders: NutritionReminder[] = remindersState.status === 'success' ? remindersState.data : [];

  const plan = useMemo(() => getNutritionPlanForMother(mockMother.id), []);
  const foods = useMemo(() => getFoodGuidanceForMother(mockMother.id), []);
  const exercises = useMemo(() => getExerciseGuidanceForMother(mockMother.id), []);

  const filteredFoods = useMemo(
    () => (foodFilter === 'ALL' ? foods : foods.filter((f) => f.type === foodFilter)),
    [foods, foodFilter]
  );

  const goalsCompletedCount = dailyGoals.filter((g) => g.completedCount >= g.targetCount).length;

  const handleIncrementGoal = async (goal: DailyGoalItem) => {
    await motherService.incrementDailyGoal(goal.goalId);
    reloadGoals();
  };

  const handleDecrementGoal = async (goal: DailyGoalItem) => {
    await motherService.decrementDailyGoal(goal.goalId);
    reloadGoals();
  };

  const handleToggleReminder = async (reminder: NutritionReminder) => {
    await motherService.toggleNutritionReminder(reminder.reminderId);
    reloadReminders();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Care"
        subtitle="Your health timeline, plus personalized nutrition and exercise guidance for your postpartum recovery."
        badge={<Badge variant="sandal">{plan?.stageLabel}</Badge>}
      />

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-sandal-100 pb-3">
        {(
          [
            { id: 'nutrition', label: 'Nutrition & Exercise' },
            { id: 'timeline', label: 'Health Timeline' },
          ] as { id: MainTabId; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              mainTab === tab.id
                ? 'bg-sandal-500 text-white shadow-sm'
                : 'text-warm-muted hover:bg-warm-cream hover:text-sandal-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Health Timeline Tab */}
      {mainTab === 'timeline' && (
        <Card padding="lg" className="bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sandal-100">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-xl font-bold text-warm-brown">Health Timeline</h3>
              <Badge variant="sandal" size="sm">{filteredTimelineEvents.length} Events</Badge>
            </div>
            <div className="w-full sm:w-60 flex items-center gap-2">
              <Filter className="w-4 h-4 text-sandal-600 shrink-0" />
              <Select
                aria-label="Filter timeline"
                value={timelineFilter}
                onChange={(e) => setTimelineFilter(e.target.value as 'ALL' | TimelineEventCategory)}
                options={TIMELINE_FILTER_OPTIONS}
              />
            </div>
          </div>

          {filteredTimelineEvents.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No events found"
              description="No timeline events match this filter yet."
            />
          ) : (
            <HealthTimeline events={filteredTimelineEvents} />
          )}
        </Card>
      )}

      {/* Nutrition & Exercise Tab */}
      {mainTab === 'nutrition' && plan && (
        <div className="space-y-6">
          {/* Plan Summary */}
          <Card padding="lg" className="bg-white">
            <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100">
              <Stethoscope className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-xl font-bold text-warm-brown">Your Care Plan</h3>
            </div>
            <div className="pt-4 space-y-4">
              <p className="text-sm text-warm-brown leading-relaxed">{plan.focusSummary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-warm-muted">Daily Calories</p>
                  <p className="font-semibold text-warm-brown mt-0.5">{plan.dailyCalorieTarget}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-muted">Protein Target</p>
                  <p className="font-semibold text-warm-brown mt-0.5">{plan.proteinTarget}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-muted flex items-center gap-1"><Droplets className="w-3.5 h-3.5" />Hydration Goal</p>
                  <p className="font-semibold text-warm-brown mt-0.5">{plan.hydrationTargetLiters} L/day</p>
                </div>
                <div>
                  <p className="text-xs text-warm-muted">Last Reviewed</p>
                  <p className="font-semibold text-warm-brown mt-0.5">{plan.lastReviewedDate}</p>
                </div>
              </div>
              <p className="text-xs text-warm-muted pt-2 border-t border-sandal-100">
                Reviewed by {plan.doctorName} • {plan.hospitalName}
                {plan.notes && <span className="block italic text-sandal-700 mt-1">{plan.notes}</span>}
              </p>
            </div>
          </Card>

          {/* Today's Goals */}
          <Card padding="lg" className="bg-white space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-sandal-100">
              <div className="flex items-center gap-2.5">
                <Salad className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-xl font-bold text-warm-brown">Today's Goals</h3>
              </div>
              <Badge variant={goalsCompletedCount === dailyGoals.length ? 'sage' : 'sandal'} size="sm">
                {goalsCompletedCount} of {dailyGoals.length} Met
              </Badge>
            </div>
            {goalsState.status !== 'success' ? (
              <AsyncStateView
                status={goalsState.status}
                loadingLabel="Loading today's goals…"
                errorMessage={goalsState.status === 'error' ? goalsState.message : undefined}
                onRetry={reloadGoals}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dailyGoals.map((goal) => (
                  <DailyGoalCard
                    key={goal.goalId}
                    goal={goal}
                    onIncrement={handleIncrementGoal}
                    onDecrement={handleDecrementGoal}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Reminders */}
          <Card padding="lg" className="bg-white space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100">
              <Droplets className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-xl font-bold text-warm-brown">Reminders</h3>
            </div>
            {remindersState.status !== 'success' ? (
              <AsyncStateView
                status={remindersState.status}
                loadingLabel="Loading reminders…"
                errorMessage={remindersState.status === 'error' ? remindersState.message : undefined}
                onRetry={reloadReminders}
              />
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <ReminderRow key={reminder.reminderId} reminder={reminder} onToggle={handleToggleReminder} />
                ))}
              </div>
            )}
          </Card>

          {/* Nutrition Guidance / Exercise Guidance Sub-Tabs */}
          <Card padding="lg" className="bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sandal-100">
              <div className="flex gap-2">
                {(
                  [
                    { id: 'guidance', label: 'Food Guidance', icon: Apple },
                    { id: 'exercise', label: 'Exercise & Activity', icon: PersonStanding },
                  ] as { id: NutritionSubTabId; label: string; icon: typeof Apple }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setNutritionSubTab(tab.id)}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5',
                      nutritionSubTab === tab.id
                        ? 'bg-sandal-500 text-white shadow-sm'
                        : 'text-warm-muted hover:bg-warm-cream hover:text-sandal-900'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {nutritionSubTab === 'guidance' && (
                <div className="w-full sm:w-52 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-sandal-600 shrink-0" />
                  <Select
                    aria-label="Filter foods"
                    value={foodFilter}
                    onChange={(e) => setFoodFilter(e.target.value as 'ALL' | FoodGuidanceType)}
                    options={FOOD_FILTER_OPTIONS}
                  />
                </div>
              )}
            </div>

            {nutritionSubTab === 'guidance' &&
              (filteredFoods.length === 0 ? (
                <EmptyState icon={Apple} title="No foods found" description="No foods match this filter." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredFoods.map((food) => (
                    <FoodGuidanceCard key={food.foodId} food={food} />
                  ))}
                </div>
              ))}

            {nutritionSubTab === 'exercise' && (
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <ExerciseGuidanceCard key={exercise.exerciseId} exercise={exercise} />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
