import React, { useMemo, useState } from 'react';
import { Filter, PlusCircle, Ruler, Scale, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { mockChild, mockMother } from '@/data/mockData';
import { LogMeasurementInput, getLatestMeasurement, getPreviousMeasurement } from '@/data/motherGrowthMockData';
import * as motherService from '@/services/motherService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { GrowthMeasurement, GrowthRecipientType, MilestoneRecord } from '@/types';
import { MeasurementCard } from './components/MeasurementCard';
import { MeasurementDetailsModal } from './components/MeasurementDetailsModal';
import { LogMeasurementModal } from './components/LogMeasurementModal';
import { MilestoneCard } from './components/MilestoneCard';
import { MilestoneDetailsModal } from './components/MilestoneDetailsModal';

type MainTabId = 'growth' | 'milestones';

const RECIPIENT_FILTER_OPTIONS: { value: 'ALL' | GrowthRecipientType; label: string }[] = [
  { value: 'ALL', label: 'Everyone' },
  { value: 'MOTHER', label: 'Maternal (Me)' },
  { value: 'CHILD', label: `Child (${mockChild.name})` },
];

const STATUS_PRIORITY: Record<MilestoneRecord['status'], number> = {
  due_soon: 0,
  upcoming: 1,
  achieved: 2,
};

export const MotherGrowthMilestonesPage: React.FC = () => {
  const [measurementsState, reloadMeasurements] = useAsyncData(() => motherService.getGrowthMeasurements(), []);
  const [milestonesState, reloadMilestones] = useAsyncData(() => motherService.getMilestones(), []);
  const measurements: GrowthMeasurement[] = measurementsState.status === 'success' ? measurementsState.data : [];
  const milestones: MilestoneRecord[] = milestonesState.status === 'success' ? milestonesState.data : [];

  const [mainTab, setMainTab] = useState<MainTabId>('growth');
  const [recipientFilter, setRecipientFilter] = useState<'ALL' | GrowthRecipientType>('ALL');

  const [viewingMeasurement, setViewingMeasurement] = useState<GrowthMeasurement | null>(null);
  const [viewingMilestone, setViewingMilestone] = useState<MilestoneRecord | null>(null);
  const [isLogModalOpen, setLogModalOpen] = useState(false);

  const latestMotherMeasurement = useMemo(
    () => getLatestMeasurement(mockMother.id, 'MOTHER', measurements),
    [measurements]
  );
  const latestChildMeasurement = useMemo(
    () => getLatestMeasurement(mockMother.id, 'CHILD', measurements),
    [measurements]
  );

  const dueSoonMilestoneCount = useMemo(
    () => milestones.filter((m) => m.status === 'due_soon').length,
    [milestones]
  );

  const measurementsDesc = useMemo(
    () =>
      measurements
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .filter((m) => recipientFilter === 'ALL' || m.recipientType === recipientFilter),
    [measurements, recipientFilter]
  );

  const sortedMilestones = useMemo(
    () =>
      milestones
        .slice()
        .filter((m) => recipientFilter === 'ALL' || m.recipientType === recipientFilter)
        .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]),
    [milestones, recipientFilter]
  );

  const handleLogMeasurement = async (input: LogMeasurementInput) => {
    await motherService.logGrowthMeasurement(input);
    reloadMeasurements();
  };

  const handleMarkAchieved = async (milestone: MilestoneRecord) => {
    await motherService.markMilestoneAchieved(milestone.milestoneId);
    setViewingMilestone(null);
    reloadMilestones();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Growth & Milestones"
        subtitle="Track weight, height, and developmental milestones for you and Vihaan across your care journey."
        badge={
          dueSoonMilestoneCount > 0 ? (
            <Badge variant="sandal">{dueSoonMilestoneCount} Milestone{dueSoonMilestoneCount > 1 ? 's' : ''} Due Soon</Badge>
          ) : (
            <Badge variant="sage">On Track</Badge>
          )
        }
        actions={
          <Button leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => setLogModalOpen(true)}>
            Log a Measurement
          </Button>
        }
      />

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <Badge variant="sage" size="sm">Maternal</Badge>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-warm-brown">
              {latestMotherMeasurement?.weightKg !== undefined ? `${latestMotherMeasurement.weightKg} kg` : 'No data yet'}
            </h4>
            <p className="text-xs text-warm-muted mt-0.5">
              {latestMotherMeasurement
                ? `${latestMotherMeasurement.context} — ${latestMotherMeasurement.date}`
                : 'Log your first weight reading to start tracking.'}
            </p>
          </div>
        </Card>

        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sage-soft text-sage-text flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <Badge variant="peach" size="sm">{mockChild.name}</Badge>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-warm-brown">
              {latestChildMeasurement?.weightKg !== undefined ? `${latestChildMeasurement.weightKg} kg` : 'No data yet'}
              {latestChildMeasurement?.heightCm !== undefined ? ` • ${latestChildMeasurement.heightCm} cm` : ''}
            </h4>
            <p className="text-xs text-warm-muted mt-0.5">
              {latestChildMeasurement
                ? `${latestChildMeasurement.context} — ${latestChildMeasurement.date}`
                : 'No growth measurements logged yet.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 border-b border-sandal-100 sm:border-0 pb-3 sm:pb-0">
          {(
            [
              { id: 'growth', label: `Growth Tracking (${measurements.length})` },
              { id: 'milestones', label: `Milestones (${milestones.length})` },
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

        <div className="w-full sm:w-56 flex items-center gap-2">
          <Filter className="w-4 h-4 text-sandal-600 shrink-0" />
          <Select
            aria-label="Filter by recipient"
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value as 'ALL' | GrowthRecipientType)}
            options={RECIPIENT_FILTER_OPTIONS}
          />
        </div>
      </div>

      {/* Growth Tracking Tab */}
      {mainTab === 'growth' && measurementsState.status !== 'success' && (
        <AsyncStateView
          status={measurementsState.status}
          loadingLabel="Loading growth measurements…"
          errorMessage={measurementsState.status === 'error' ? measurementsState.message : undefined}
          onRetry={reloadMeasurements}
        />
      )}
      {mainTab === 'growth' &&
        measurementsState.status === 'success' &&
        (measurementsDesc.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No measurements found"
            description={
              recipientFilter === 'ALL'
                ? 'Weight, height, and head circumference readings from checkups and home logs will appear here.'
                : 'No measurements match this filter yet.'
            }
            action={
              <Button leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => setLogModalOpen(true)}>
                Log a Measurement
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {measurementsDesc.map((measurement) => (
              <MeasurementCard
                key={measurement.measurementId}
                measurement={measurement}
                previous={getPreviousMeasurement(mockMother.id, measurement, measurements)}
                onView={setViewingMeasurement}
              />
            ))}
          </div>
        ))}

      {/* Milestones Tab */}
      {mainTab === 'milestones' && milestonesState.status !== 'success' && (
        <AsyncStateView
          status={milestonesState.status}
          loadingLabel="Loading milestones…"
          errorMessage={milestonesState.status === 'error' ? milestonesState.message : undefined}
          onRetry={reloadMilestones}
        />
      )}
      {mainTab === 'milestones' &&
        milestonesState.status === 'success' &&
        (sortedMilestones.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No milestones found"
            description="Developmental and recovery milestones will appear here as they become due."
          />
        ) : (
          <div className="space-y-3">
            {sortedMilestones.map((milestone) => (
              <MilestoneCard
                key={milestone.milestoneId}
                milestone={milestone}
                onView={setViewingMilestone}
                onMarkAchieved={handleMarkAchieved}
              />
            ))}
          </div>
        ))}

      {/* Modals */}
      {viewingMeasurement && (
        <MeasurementDetailsModal
          measurement={viewingMeasurement}
          previous={getPreviousMeasurement(mockMother.id, viewingMeasurement, measurements)}
          onClose={() => setViewingMeasurement(null)}
        />
      )}

      {viewingMilestone && (
        <MilestoneDetailsModal
          milestone={viewingMilestone}
          onClose={() => setViewingMilestone(null)}
          onMarkAchieved={handleMarkAchieved}
        />
      )}

      <LogMeasurementModal
        isOpen={isLogModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSubmit={handleLogMeasurement}
      />
    </div>
  );
};
