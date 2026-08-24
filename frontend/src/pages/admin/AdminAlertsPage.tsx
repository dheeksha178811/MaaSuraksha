import React, { useCallback, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { ADMIN_NOW_ISO } from '@/data/adminMockData';
import { acknowledgeAlert, getAdminAlerts, resolveAlert } from '@/services/adminService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import {
  ADMIN_ALERT_TYPE_LABELS,
  ALERT_STATUS_LABELS,
  formatClinicalTimestamp,
  getAdminAlertTypeIcon,
  getAlertSeverityBadgeVariant,
  getAlertStatusBadgeVariant,
} from '@/pages/admin/adminUi';
import { HospitalAlertStatus } from '@/types';

type AlertFilter = 'ALL' | HospitalAlertStatus;

const FILTER_OPTIONS: { value: AlertFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'RESOLVED', label: 'Resolved' },
];

export const AdminAlertsPage: React.FC = () => {
  const [filter, setFilter] = useState<AlertFilter>('ALL');

  const fetcher = useCallback(() => getAdminAlerts(filter === 'ALL' ? {} : { status: filter }), [filter]);
  const [state, reload] = useAsyncData(fetcher, [filter]);

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id);
    reload();
  };

  const handleResolve = async (id: string) => {
    await resolveAlert(id);
    reload();
  };

  const activeCount = state.status === 'success' ? state.data.filter((a) => a.status === 'ACTIVE').length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        subtitle="Program-level alerts and escalations across the district."
        badge={<Badge variant={activeCount > 0 ? 'danger' : 'outline'}>{activeCount} Active</Badge>}
      />

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === option.value
                ? 'bg-sandal-500 text-white shadow-sm'
                : 'bg-white text-warm-muted border border-sandal-200 hover:border-sandal-300 hover:text-warm-brown'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading alerts…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={Bell} title="No alerts found" description="No alerts match this filter." />
      ) : (
        <div className="space-y-3">
          {state.data.map((alert) => {
            const Icon = getAdminAlertTypeIcon(alert.type);
            return (
              <Card key={alert.id} className={cn('hover:shadow-warm-md', alert.status === 'ACTIVE' && alert.severity === 'CRITICAL' && 'border-rose-200')}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-warm-brown">{alert.title}</h4>
                      <Badge variant={getAlertSeverityBadgeVariant(alert.severity)} size="sm">{alert.severity}</Badge>
                      <Badge variant={getAlertStatusBadgeVariant(alert.status)} size="sm">{ALERT_STATUS_LABELS[alert.status]}</Badge>
                    </div>
                    <p className="text-sm text-warm-muted mt-1.5">{alert.description}</p>
                    <p className="text-xs text-sandal-600/80 font-medium mt-1">
                      {ADMIN_ALERT_TYPE_LABELS[alert.type]} • {formatClinicalTimestamp(alert.createdAt, ADMIN_NOW_ISO)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {alert.status === 'ACTIVE' && (
                      <>
                        <Button size="sm" variant="outline" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => handleAcknowledge(alert.id)}>
                          Acknowledge
                        </Button>
                        <Button size="sm" variant="sage" leftIcon={<CheckCheck className="w-3.5 h-3.5" />} onClick={() => handleResolve(alert.id)}>
                          Resolve
                        </Button>
                      </>
                    )}
                    {alert.status === 'ACKNOWLEDGED' && (
                      <Button size="sm" variant="sage" leftIcon={<CheckCheck className="w-3.5 h-3.5" />} onClick={() => handleResolve(alert.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
