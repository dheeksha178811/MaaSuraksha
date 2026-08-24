import React, { useCallback } from 'react';
import { HeartPulse, ShieldAlert, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getMaternalAnalytics } from '@/services/adminService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';

const BAR_COLORS = ['bg-sandal-500', 'bg-sage', 'bg-peach-soft', 'bg-sandal-300'];

export const AdminMaternalAnalyticsPage: React.FC = () => {
  const fetcher = useCallback(() => getMaternalAnalytics(), []);
  const [state, reload] = useAsyncData(fetcher);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maternal Analytics"
        subtitle="Maternal mortality reduction metrics and outcome analytics."
        badge={<Badge variant="sandal">District-Wide</Badge>}
      />

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading maternal analytics…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Pregnancies Tracked', value: state.data.totalPregnanciesTracked, icon: Users },
              { label: 'Antenatal Coverage', value: `${state.data.antenatalCoveragePercent}%`, icon: HeartPulse },
              { label: 'Institutional Delivery Rate', value: `${state.data.institutionalDeliveryPercent}%`, icon: TrendingUp },
              { label: 'High-Risk Share', value: `${state.data.highRiskPercent}%`, icon: ShieldAlert },
            ].map((stat) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card padding="lg" className="space-y-4">
              <h3 className="font-display text-lg font-bold text-warm-brown pb-3 border-b border-sandal-100">Delivery Type Breakdown</h3>
              <div className="space-y-3">
                {state.data.deliveryTypeBreakdown.map((item, idx) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-warm-brown font-medium">{item.label}</span>
                      <span className="text-warm-muted">{item.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-warm-cream overflow-hidden">
                      <div className={`h-full rounded-full ${BAR_COLORS[idx % BAR_COLORS.length]}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="lg" className="space-y-4">
              <h3 className="font-display text-lg font-bold text-warm-brown pb-3 border-b border-sandal-100">Maternal Outcome Breakdown</h3>
              <div className="space-y-3">
                {state.data.maternalOutcomeBreakdown.map((item, idx) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-warm-brown font-medium">{item.label}</span>
                      <span className="text-warm-muted">{item.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-warm-cream overflow-hidden">
                      <div className={`h-full rounded-full ${BAR_COLORS[idx % BAR_COLORS.length]}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
