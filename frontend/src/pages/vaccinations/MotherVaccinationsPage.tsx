import React, { useMemo, useState } from 'react';
import { AlertTriangle, Filter, ShieldCheck, Syringe } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { mockDoctor, mockHospital } from '@/data/mockData';
import * as motherService from '@/services/motherService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { MotherVaccinationRecord, VaccineRecipientType } from '@/types';
import { VaccinationCard } from './components/VaccinationCard';
import { VaccinationDetailsModal } from './components/VaccinationDetailsModal';

type TabId = 'due' | 'completed';

const RECIPIENT_FILTER_OPTIONS: { value: 'ALL' | VaccineRecipientType; label: string }[] = [
  { value: 'ALL', label: 'Everyone' },
  { value: 'MOTHER', label: 'Maternal (Me)' },
  { value: 'CHILD', label: "Child (Vihaan)" },
];

export const MotherVaccinationsPage: React.FC = () => {
  const [vaccinationsState, reloadVaccinations] = useAsyncData(() => motherService.getVaccinations(), []);
  const vaccinations: MotherVaccinationRecord[] = vaccinationsState.status === 'success' ? vaccinationsState.data : [];
  const [activeTab, setActiveTab] = useState<TabId>('due');
  const [recipientFilter, setRecipientFilter] = useState<'ALL' | VaccineRecipientType>('ALL');
  const [viewingVaccination, setViewingVaccination] = useState<MotherVaccinationRecord | null>(null);

  const dueOrUpcoming = useMemo(
    () => vaccinations.filter((v) => v.status === 'upcoming' || v.status === 'due_soon' || v.status === 'overdue'),
    [vaccinations]
  );
  const completed = useMemo(
    () => vaccinations.filter((v) => v.status === 'completed').slice().reverse(),
    [vaccinations]
  );
  const overdueCount = useMemo(() => vaccinations.filter((v) => v.status === 'overdue').length, [vaccinations]);

  const source = activeTab === 'due' ? dueOrUpcoming : completed;
  const visibleVaccinations = useMemo(
    () => (recipientFilter === 'ALL' ? source : source.filter((v) => v.recipientType === recipientFilter)),
    [source, recipientFilter]
  );

  const handleToggleReminder = async (vaccination: MotherVaccinationRecord) => {
    await motherService.toggleVaccinationReminder(vaccination.vaccinationId);
    setViewingVaccination(null);
    reloadVaccinations();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vaccinations"
        subtitle="Track maternal and child immunizations — doses given, upcoming schedules, and reminders — in one place."
        badge={
          overdueCount > 0 ? (
            <Badge variant="danger">{overdueCount} Overdue</Badge>
          ) : (
            <Badge variant="sandal">{dueOrUpcoming.length} Due & Upcoming</Badge>
          )
        }
      />

      {/* Care Team Summary */}
      <Card padding="md" className="bg-white flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-sage-soft text-sage-text flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-warm-brown">Immunization Care Team</h3>
          <p className="text-sm text-warm-muted mt-0.5">
            {mockDoctor.name} • {mockHospital.name}
          </p>
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{overdueCount} dose{overdueCount > 1 ? 's' : ''} need attention</span>
          </div>
        )}
      </Card>

      {/* Tabs + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 border-b border-sandal-100 sm:border-0 pb-3 sm:pb-0">
          {(
            [
              { id: 'due', label: `Due & Upcoming (${dueOrUpcoming.length})` },
              { id: 'completed', label: `Completed (${completed.length})` },
            ] as { id: TabId; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                activeTab === tab.id
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
            onChange={(e) => setRecipientFilter(e.target.value as 'ALL' | VaccineRecipientType)}
            options={RECIPIENT_FILTER_OPTIONS}
          />
        </div>
      </div>

      {/* Vaccination List */}
      {vaccinationsState.status !== 'success' ? (
        <AsyncStateView
          status={vaccinationsState.status}
          loadingLabel="Loading vaccinations…"
          errorMessage={vaccinationsState.status === 'error' ? vaccinationsState.message : undefined}
          onRetry={reloadVaccinations}
        />
      ) : visibleVaccinations.length === 0 ? (
        <EmptyState
          icon={activeTab === 'due' ? Syringe : ShieldCheck}
          title={activeTab === 'due' ? 'No due or upcoming vaccinations' : 'No completed vaccinations'}
          description={
            activeTab === 'due'
              ? recipientFilter === 'ALL'
                ? 'You are all caught up. New doses will appear here as they become due.'
                : 'No due or upcoming vaccinations match this filter.'
              : 'Doses that have been administered will appear here for your records.'
          }
        />
      ) : (
        <div className="space-y-3">
          {visibleVaccinations.map((vaccination) => (
            <VaccinationCard
              key={vaccination.vaccinationId}
              vaccination={vaccination}
              onView={setViewingVaccination}
              onToggleReminder={handleToggleReminder}
            />
          ))}
        </div>
      )}

      {viewingVaccination && (
        <VaccinationDetailsModal
          vaccination={viewingVaccination}
          onClose={() => setViewingVaccination(null)}
          onToggleReminder={handleToggleReminder}
        />
      )}
    </div>
  );
};
