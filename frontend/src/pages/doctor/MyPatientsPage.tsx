import React, { useMemo, useState } from 'react';
import { Search, Users, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { mockDoctor, mockHospital } from '@/data/mockData';
import { getPatientsForDoctor } from '@/data/doctorPatientsMockData';
import { PatientCard } from '@/pages/doctor/components/PatientCard';
import { PatientStage } from '@/types';

const STAGE_OPTIONS = [
  { value: 'ALL', label: 'All Stages' },
  { value: 'ANTENATAL', label: 'Antenatal' },
  { value: 'POSTNATAL', label: 'Postnatal' },
];

export const MyPatientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'ALL' | PatientStage>('ALL');

  const allPatients = useMemo(() => getPatientsForDoctor(mockDoctor.id), []);

  const filteredPatients = useMemo(() => {
    let results = allPatients;
    if (stageFilter !== 'ALL') {
      results = results.filter((p) => p.stage === stageFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      );
    }
    return results;
  }, [allPatients, stageFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Patients"
        subtitle={`Mothers currently assigned to your care at ${mockHospital.name}.`}
        badge={<Badge variant="sandal">{allPatients.length} Patients</Badge>}
      />

      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Search & Filter
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-warm-muted" />
              <Input
                type="text"
                placeholder="Search patients by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as 'ALL' | PatientStage)}
              options={STAGE_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {filteredPatients.length === 0 ? (
        <Card className="bg-warm-ivory border-sandal-100">
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-sandal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-warm-brown mb-2">No Patients Found</h3>
            <p className="text-warm-muted">
              {searchQuery || stageFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'No patients are currently assigned to you.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.patientId} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
};
