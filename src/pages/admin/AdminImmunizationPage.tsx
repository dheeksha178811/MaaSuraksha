import React, { useCallback, useMemo } from 'react';
import { Syringe } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getImmunizationCoverage } from '@/services/adminService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';

const COVERAGE_TARGET_PERCENT = 85;

export const AdminImmunizationPage: React.FC = () => {
  const fetcher = useCallback(() => getImmunizationCoverage(), []);
  const [state, reload] = useAsyncData(fetcher);

  const summary = useMemo(() => {
    if (state.status !== 'success') return null;
    const items = state.data;
    const avgCoverage = Math.round(
      (items.reduce((sum, v) => sum + v.covered / v.targetPopulation, 0) / items.length) * 100
    );
    return {
      totalVaccines: items.length,
      avgCoverage,
      belowTarget: items.filter((v) => (v.covered / v.targetPopulation) * 100 < COVERAGE_TARGET_PERCENT).length,
      totalCovered: items.reduce((sum, v) => sum + v.covered, 0),
    };
  }, [state]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Immunization"
        subtitle="District immunization coverage analytics across the program."
        badge={<Badge variant="sandal">{summary ? `${summary.avgCoverage}% Avg. Coverage` : '—'}</Badge>}
      />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Vaccines Tracked', value: summary.totalVaccines },
            { label: 'Average Coverage', value: `${summary.avgCoverage}%` },
            { label: 'Below 85% Target', value: summary.belowTarget },
            { label: 'Total Doses Administered', value: summary.totalCovered.toLocaleString() },
          ].map((s) => (
            <Card key={s.label} className="bg-white text-center">
              <p className="text-2xl font-bold text-warm-brown">{s.value}</p>
              <p className="text-xs text-warm-muted mt-1">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading immunization coverage…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <Card className="text-center py-12">
          <Syringe className="w-10 h-10 text-sandal-300 mx-auto mb-4" />
          <p className="text-warm-muted">No immunization coverage data available.</p>
        </Card>
      ) : (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
            <Syringe className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Coverage by Vaccine</h3>
          </div>
          <div className="space-y-4">
            {state.data.map((item) => {
              const percent = Math.round((item.covered / item.targetPopulation) * 100);
              const belowTarget = percent < COVERAGE_TARGET_PERCENT;
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between text-sm mb-1 flex-wrap gap-1">
                    <span className="text-warm-brown font-medium">{item.vaccineName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-warm-muted">{item.covered.toLocaleString()} / {item.targetPopulation.toLocaleString()}</span>
                      <Badge variant={belowTarget ? 'danger' : 'sage'} size="sm">{percent}%</Badge>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-warm-cream overflow-hidden">
                    <div
                      className={`h-full rounded-full ${belowTarget ? 'bg-rose-400' : 'bg-sage'}`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
