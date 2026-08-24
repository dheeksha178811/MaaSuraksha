import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRightLeft,
  Baby,
  BedDouble,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  LogOut as DischargeIcon,
  UserPlus,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockHospital } from '@/data/mockData';
import { getHospitalDashboard } from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import {
  ACTIVITY_TYPE_LABELS,
  ALERT_TYPE_LABELS,
  formatClinicalTimestamp,
  getActivityTypeIcon,
  getAlertSeverityBadgeVariant,
  getAlertTypeIcon,
} from '@/pages/hospital/hospitalUi';
import { HOSPITAL_NOW_ISO } from '@/data/hospitalMockData';

export const HospitalDashboardPage: React.FC = () => {
  const fetcher = useCallback(() => getHospitalDashboard(), []);
  const [state, reload] = useAsyncData(fetcher);

  const statCards =
    state.status === 'success'
      ? [
          { label: 'Registered Mothers', value: state.data.summary.registeredMothersCount, icon: Users },
          { label: "Today's Admissions", value: state.data.summary.todaysAdmissionsCount, icon: UserPlus },
          { label: "Today's Deliveries", value: state.data.summary.todaysDeliveriesCount, icon: Baby },
          { label: 'Neonatal Care', value: state.data.summary.neonatalCareCount, icon: HeartPulse },
          { label: 'Available Beds', value: state.data.summary.availableBedsCount, icon: BedDouble },
          { label: 'Pending Referrals', value: state.data.summary.pendingReferralsCount, icon: ArrowRightLeft },
        ]
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hospital Facility: ${mockHospital.facilityName}`}
        subtitle={`${mockHospital.facilityType} • License: ${mockHospital.licenseNumber}`}
        badge={<Badge variant="sage">Hospital Role</Badge>}
      />

      {state.status !== 'success' ? (
        <AsyncStateView
          status={state.status}
          loadingLabel="Loading hospital dashboard…"
          errorMessage={state.status === 'error' ? state.message : undefined}
          onRetry={reload}
        />
      ) : (
        <>
          {/* Summary Cards */}
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
            {/* Left: Today's Operations */}
            <div className="lg:col-span-2 space-y-5">
              <Card padding="lg" className="bg-white space-y-4">
                <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100">
                  <ClipboardList className="w-5 h-5 text-sandal-600" />
                  <h3 className="font-display text-xl font-bold text-warm-brown">Today's Hospital Operations</h3>
                </div>

                <div className="p-4 rounded-2xl bg-warm-cream/60 border border-sandal-100">
                  <p className="text-sm font-semibold text-warm-brown mb-2">Today's Deliveries</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span className="text-warm-muted">Scheduled: <strong className="text-warm-brown">{state.data.operations.scheduledDeliveries}</strong></span>
                    <span className="text-warm-muted">Completed: <strong className="text-warm-brown">{state.data.operations.completedDeliveries}</strong></span>
                    <span className="text-warm-muted">Pending: <strong className="text-warm-brown">{Math.max(0, state.data.operations.scheduledDeliveries - state.data.operations.completedDeliveries)}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Admissions', value: state.data.operations.admissions, icon: UserPlus },
                    { label: 'Neonatal Admissions', value: state.data.operations.neonatalAdmissions, icon: HeartPulse },
                    { label: 'Discharges', value: state.data.operations.discharges, icon: DischargeIcon },
                    { label: 'Completed Deliveries', value: state.data.operations.completedDeliveries, icon: CheckCircle2 },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-warm-ivory border border-sandal-100 text-center">
                      <item.icon className="w-4 h-4 text-sandal-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-warm-brown">{item.value}</p>
                      <p className="text-[11px] text-warm-muted">{item.label}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card padding="lg" className="bg-white space-y-1">
                <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100 mb-1">
                  <ClipboardList className="w-5 h-5 text-sandal-600" />
                  <h3 className="font-display text-xl font-bold text-warm-brown">Recent Hospital Activity</h3>
                </div>
                {state.data.activity.length === 0 ? (
                  <p className="text-sm text-warm-muted py-4 text-center">No recent activity.</p>
                ) : (
                  state.data.activity.map((item) => {
                    const Icon = getActivityTypeIcon(item.type);
                    return (
                      <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 border-b border-sandal-100/70 last:border-0">
                        <div className="w-8 h-8 rounded-lg bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" size="sm">{ACTIVITY_TYPE_LABELS[item.type]}</Badge>
                          </div>
                          <p className="text-sm text-warm-brown mt-1">{item.description}</p>
                          <p className="text-[11px] text-warm-muted mt-0.5">{formatClinicalTimestamp(item.timestamp, HOSPITAL_NOW_ISO)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </Card>
            </div>

            {/* Right: Alerts */}
            <div className="space-y-5">
              <Card padding="md" className="bg-white space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="font-display text-lg font-bold text-warm-brown">Hospital Alerts</h3>
                </div>
                {state.data.alerts.length === 0 ? (
                  <p className="text-xs text-warm-muted">No active alerts. Facility operations are on track.</p>
                ) : (
                  <div className="space-y-2.5">
                    {state.data.alerts.map((alert) => {
                      const Icon = getAlertTypeIcon(alert.type);
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
                              <p className="text-[10px] text-sandal-600/80 font-medium mt-1">{ALERT_TYPE_LABELS[alert.type]} • {formatClinicalTimestamp(alert.createdAt, HOSPITAL_NOW_ISO)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card padding="md" className="bg-white space-y-3">
                <h3 className="font-display text-lg font-bold text-warm-brown">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <Link to="/hospital/beds" className="block p-2.5 rounded-xl hover:bg-warm-cream transition-colors text-warm-brown font-medium">Manage Beds</Link>
                  <Link to="/hospital/referrals" className="block p-2.5 rounded-xl hover:bg-warm-cream transition-colors text-warm-brown font-medium">Review Referrals</Link>
                  <Link to="/hospital/vaccines" className="block p-2.5 rounded-xl hover:bg-warm-cream transition-colors text-warm-brown font-medium">Vaccine Inventory</Link>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
