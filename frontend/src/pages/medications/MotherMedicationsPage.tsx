import React, { useMemo, useState } from 'react';
import { Pill, PillBottle, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { getMedicationsForMother } from '@/data/motherMedicationsMockData';
import { MotherMedication } from '@/types';
import { MedicationCard } from './components/MedicationCard';
import { MedicationDetailsModal } from './components/MedicationDetailsModal';

type TabId = 'active' | 'completed';

export const MotherMedicationsPage: React.FC = () => {
  const medications = useMemo(() => getMedicationsForMother(mockMother.id), []);
  const [activeTab, setActiveTab] = useState<TabId>('active');
  const [viewingMedication, setViewingMedication] = useState<MotherMedication | null>(null);

  const activeMedications = useMemo(() => medications.filter((m) => m.status === 'active'), [medications]);
  const completedMedications = useMemo(() => medications.filter((m) => m.status === 'completed'), [medications]);

  const visibleMedications = activeTab === 'active' ? activeMedications : completedMedications;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medications"
        subtitle="Your current and past medications, supplements, and prescribed doses across your care journey."
        badge={<Badge variant="sage">{activeMedications.length} Active</Badge>}
      />

      {/* Assigned Doctor & Hospital */}
      <Card padding="md" className="bg-white flex flex-col sm:flex-row sm:items-center gap-4">
        <Avatar name={mockDoctor.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-lg font-bold text-warm-brown">{mockDoctor.name}</h3>
            <Badge variant="sage" size="sm">Prescribing Doctor</Badge>
          </div>
          <p className="text-sm text-warm-muted mt-0.5">
            {mockDoctor.specialization} • {mockHospital.name}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-muted shrink-0">
          <Stethoscope className="w-4 h-4 text-sandal-600" />
          <span>Always confirm dosage changes with your doctor.</span>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sandal-100 pb-3">
        {(
          [
            { id: 'active', label: `Active (${activeMedications.length})` },
            { id: 'completed', label: `Completed (${completedMedications.length})` },
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

      {/* Medication List */}
      {visibleMedications.length === 0 ? (
        <EmptyState
          icon={activeTab === 'active' ? Pill : PillBottle}
          title={activeTab === 'active' ? 'No active medications' : 'No completed medications'}
          description={
            activeTab === 'active'
              ? 'You have no medications currently in progress. Anything your doctor prescribes will appear here.'
              : 'Medications you have finished taking will appear here for your records.'
          }
        />
      ) : (
        <div className="space-y-3">
          {visibleMedications.map((medication) => (
            <MedicationCard
              key={medication.medicationId}
              medication={medication}
              onView={setViewingMedication}
            />
          ))}
        </div>
      )}

      {viewingMedication && (
        <MedicationDetailsModal
          medication={viewingMedication}
          onClose={() => setViewingMedication(null)}
        />
      )}
    </div>
  );
};
