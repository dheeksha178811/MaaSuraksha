import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockDoctor } from '@/data/mockData';
import { getPatientsForDoctor, getRecommendationsForDoctor } from '@/data/doctorPatientsMockData';
import { RecommendationType } from '@/types';

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  { value: 'NUTRITION', label: 'Nutrition' },
  { value: 'MEDICATION', label: 'Medication' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
  { value: 'FOLLOW_UP', label: 'Follow-up Care' },
  { value: 'GENERAL', label: 'General' },
];

export const DoctorCarePlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<'ALL' | RecommendationType>('ALL');

  const patients = useMemo(() => getPatientsForDoctor(mockDoctor.id), []);
  const allRecommendations = useMemo(() => getRecommendationsForDoctor(mockDoctor.id), []);

  const patientNameById = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((p) => map.set(p.patientId, p.name));
    return map;
  }, [patients]);

  const filtered = useMemo(() => {
    const results = typeFilter === 'ALL' ? allRecommendations : allRecommendations.filter((r) => r.type === typeFilter);
    return results.slice().sort((a, b) => b.date.localeCompare(a.date));
  }, [allRecommendations, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Care Plans"
        subtitle="Nutrition, medication, and lifestyle recommendations across your patients."
        badge={<Badge variant="sandal">{allRecommendations.length} Recommendations</Badge>}
      />

      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Filter by Type
          </h3>
          <div className="max-w-xs">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | RecommendationType)}
              options={TYPE_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="bg-warm-ivory border-sandal-100">
          <div className="text-center py-12">
            <ClipboardList className="w-10 h-10 text-sandal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-warm-brown mb-2">No Recommendations Found</h3>
            <p className="text-warm-muted">Add a recommendation from a patient's care workspace to see it here.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => (
            <Card key={rec.recommendationId} variant="interactive" className="hover:shadow-warm-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-warm-brown">{rec.title}</h4>
                    <Badge variant="peach" size="sm">{rec.type.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-warm-muted mt-1">
                    For {patientNameById.get(rec.patientId) || 'Unknown patient'} • {rec.date}
                  </p>
                  <p className="text-sm text-warm-brown mt-2 leading-relaxed">{rec.description}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/patients/${rec.patientId}`)}>
                  Open Patient
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
