import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Baby, Building2, HeartPulse, ShieldAlert, Stethoscope, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getFacilities, getProgramOverview } from '@/services/adminService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { getFacilityStatusBadgeVariant } from '@/pages/admin/adminUi';

export const AdminProgramOverviewPage: React.FC = () => {
  const fetcher = useCallback(() => Promise.all([getProgramOverview(), getFacilities()]), []);
  const [state, reload] = useAsyncData(fetcher);

  const stats =
    state.status === 'success'
      ? (() => {
          const [overview] = state.data;
          return [
            { label: 'Facilities', value: overview.totalFacilities, icon: Building2 },
            { label: 'Registered Mothers', value: overview.totalRegisteredMothers, icon: Users },
            { label: 'Doctors', value: overview.totalDoctors, icon: Stethoscope },
            { label: 'Active Pregnancies', value: overview.activePregnancies, icon: HeartPulse },
            { label: 'Deliveries This Month', value: overview.deliveriesThisMonth, icon: Baby },
            { label: 'High-Risk Cases', value: overview.highRiskCasesCount, icon: ShieldAlert },
          ];
        })()
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program Overview"
        subtitle="A district-wide summary of maternal and child health program activity."
        badge={<Badge variant="sandal">{state.status === 'success' ? `${state.data[1].length} Facilities` : '—'}</Badge>}
      />

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading program overview…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-warm-muted mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-warm-brown">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-peach-verySoft text-sandal-700 flex items-center justify-center">
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card padding="lg" className="space-y-1">
            <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100 mb-1">
              <Building2 className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-xl font-bold text-warm-brown">Facility Breakdown</h3>
            </div>
            {state.data[1].map((facility) => (
              <Link
                key={facility.id}
                to={`/admin/facilities/${facility.id}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 first:pt-0 border-b border-sandal-100/70 last:border-0 hover:bg-warm-cream/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-warm-brown">{facility.name}</p>
                    <Badge variant={getFacilityStatusBadgeVariant(facility.status)} size="sm">{facility.status}</Badge>
                  </div>
                  <p className="text-xs text-warm-muted mt-0.5">{facility.city}, {facility.state} • {facility.facilityType}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-warm-muted shrink-0">
                  <span>{facility.registeredMothers} mothers</span>
                  <span>{facility.deliveriesThisMonth} deliveries</span>
                  <span>{facility.availableBeds}/{facility.totalBeds} beds</span>
                </div>
              </Link>
            ))}
          </Card>
        </>
      )}
    </div>
  );
};
