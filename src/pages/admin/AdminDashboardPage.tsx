import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Baby, BedDouble, Building2, HeartPulse, ShieldAlert, Stethoscope, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getAdminDashboard } from '@/services/adminService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import {
  ADMIN_ALERT_TYPE_LABELS,
  HIGH_RISK_STATUS_LABELS,
  formatClinicalTimestamp,
  getAdminAlertTypeIcon,
  getAlertSeverityBadgeVariant,
  getFacilityStatusBadgeVariant,
  getHighRiskStatusBadgeVariant,
  getRiskBadgeVariant,
} from '@/pages/admin/adminUi';
import { ADMIN_NOW_ISO } from '@/data/adminMockData';

export const AdminDashboardPage: React.FC = () => {
  const fetcher = useCallback(() => getAdminDashboard(), []);
  const [state, reload] = useAsyncData(fetcher);

  const statCards =
    state.status === 'success'
      ? [
          { label: 'Registered Mothers', value: state.data.overview.totalRegisteredMothers, icon: Users },
          { label: 'Active Facilities', value: `${state.data.overview.activeFacilities}/${state.data.overview.totalFacilities}`, icon: Building2 },
          { label: 'Active Pregnancies', value: state.data.overview.activePregnancies, icon: HeartPulse },
          { label: 'Deliveries This Month', value: state.data.overview.deliveriesThisMonth, icon: Baby },
          { label: 'High-Risk Cases', value: state.data.overview.highRiskCasesCount, icon: ShieldAlert },
          { label: 'Doctors', value: state.data.overview.totalDoctors, icon: Stethoscope },
        ]
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maternal Health Program Administration"
        subtitle="District Health Society & National Health Mission Oversight"
        badge={<Badge variant="sandal">Admin Role</Badge>}
      />

      {state.status !== 'success' ? (
        <AsyncStateView
          status={state.status}
          loadingLabel="Loading program dashboard…"
          errorMessage={state.status === 'error' ? state.message : undefined}
          onRetry={reload}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <Card padding="lg" className="bg-white space-y-1">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-sandal-100 mb-1 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <BedDouble className="w-5 h-5 text-sandal-600" />
                    <h3 className="font-display text-xl font-bold text-warm-brown">Facilities Needing Attention</h3>
                  </div>
                  <Link to="/admin/facilities"><Button variant="ghost" size="sm">View All</Button></Link>
                </div>
                {state.data.topFacilities.map((facility) => (
                  <Link
                    key={facility.id}
                    to={`/admin/facilities/${facility.id}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 border-b border-sandal-100/70 last:border-0 hover:bg-warm-cream/50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-warm-brown truncate">{facility.name}</p>
                      <p className="text-xs text-warm-muted">{facility.city}, {facility.state}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-warm-brown">{facility.availableBeds}/{facility.totalBeds}</p>
                      <Badge variant={getFacilityStatusBadgeVariant(facility.status)} size="sm">{facility.status}</Badge>
                    </div>
                  </Link>
                ))}
              </Card>

              <Card padding="lg" className="bg-white space-y-1">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-sandal-100 mb-1 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-sandal-600" />
                    <h3 className="font-display text-xl font-bold text-warm-brown">Active High-Risk Cases</h3>
                  </div>
                  <Link to="/admin/high-risk-monitoring"><Button variant="ghost" size="sm">View All</Button></Link>
                </div>
                {state.data.activeHighRiskCases.length === 0 ? (
                  <p className="text-sm text-warm-muted py-4 text-center">No active high-risk cases.</p>
                ) : (
                  state.data.activeHighRiskCases.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 border-b border-sandal-100/70 last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-warm-brown truncate">{c.motherName}</p>
                        <p className="text-xs text-warm-muted">{c.riskFactors.join(', ')}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant={getRiskBadgeVariant(c.riskLevel)} size="sm">{c.riskLevel}</Badge>
                        <Badge variant={getHighRiskStatusBadgeVariant(c.status)} size="sm">{HIGH_RISK_STATUS_LABELS[c.status]}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </div>

            <div className="space-y-5">
              <Card padding="md" className="bg-white space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="font-display text-lg font-bold text-warm-brown">Program Alerts</h3>
                </div>
                {state.data.alerts.length === 0 ? (
                  <p className="text-xs text-warm-muted">No active alerts. Program operations are on track.</p>
                ) : (
                  <div className="space-y-2.5">
                    {state.data.alerts.slice(0, 5).map((alert) => {
                      const Icon = getAdminAlertTypeIcon(alert.type);
                      return (
                        <div key={alert.id} className="p-3 rounded-xl bg-warm-ivory border border-sandal-100">
                          <div className="flex items-start gap-2">
                            <Icon className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-semibold text-warm-brown">{alert.title}</p>
                                <Badge variant={getAlertSeverityBadgeVariant(alert.severity)} size="sm">{alert.severity}</Badge>
                              </div>
                              <p className="text-[11px] text-warm-muted mt-1 leading-relaxed">{alert.description}</p>
                              <p className="text-[10px] text-sandal-600/80 font-medium mt-1">
                                {ADMIN_ALERT_TYPE_LABELS[alert.type]} • {formatClinicalTimestamp(alert.createdAt, ADMIN_NOW_ISO)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Link to="/admin/alerts"><Button variant="outline" size="sm" fullWidth>View All Alerts</Button></Link>
              </Card>

              <Card padding="md" className="bg-white space-y-3">
                <h3 className="font-display text-lg font-bold text-warm-brown">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <Link to="/admin/program-overview" className="block p-2.5 rounded-xl hover:bg-warm-cream transition-colors text-warm-brown font-medium">Program Overview</Link>
                  <Link to="/admin/immunization" className="block p-2.5 rounded-xl hover:bg-warm-cream transition-colors text-warm-brown font-medium">Immunization Coverage</Link>
                  <Link to="/admin/reports" className="block p-2.5 rounded-xl hover:bg-warm-cream transition-colors text-warm-brown font-medium">Generate a Report</Link>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
