import React, { useCallback, useState } from 'react';
import { Filter, Search, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { getFacilityName } from '@/data/adminMockData';
import { getHighRiskCases, updateHighRiskCaseStatus } from '@/services/adminService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import {
  HIGH_RISK_STATUS_LABELS,
  getAvailableHighRiskTransitions,
  getHighRiskStatusBadgeVariant,
  getRiskBadgeVariant,
} from '@/pages/admin/adminUi';
import { HighRiskCaseStatus, PatientRiskLevel } from '@/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...(Object.keys(HIGH_RISK_STATUS_LABELS) as HighRiskCaseStatus[]).map((value) => ({ value, label: HIGH_RISK_STATUS_LABELS[value] })),
];

const RISK_OPTIONS = [
  { value: 'ALL', label: 'All Risk Levels' },
  { value: 'LOW', label: 'Low' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'HIGH', label: 'High' },
];

export const AdminHighRiskMonitoringPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | HighRiskCaseStatus>('ALL');
  const [riskLevel, setRiskLevel] = useState<'ALL' | PatientRiskLevel>('ALL');

  const fetcher = useCallback(
    () =>
      getHighRiskCases({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        riskLevel: riskLevel === 'ALL' ? undefined : riskLevel,
      }),
    [search, status, riskLevel]
  );
  const [state, reload] = useAsyncData(fetcher, [search, status, riskLevel]);

  const handleTransition = async (id: string, nextStatus: HighRiskCaseStatus) => {
    await updateHighRiskCaseStatus(id, nextStatus);
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="High-Risk Monitoring"
        subtitle="Program-level tracking of high-risk pregnancies and postnatal cases."
        badge={<Badge variant="sandal">{state.status === 'success' ? state.data.length : '—'} Cases</Badge>}
      />

      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Search & Filter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
              <Input placeholder="Search by mother name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value as 'ALL' | HighRiskCaseStatus)} options={STATUS_OPTIONS} />
            <Select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as 'ALL' | PatientRiskLevel)} options={RISK_OPTIONS} />
          </div>
        </div>
      </Card>

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading high-risk cases…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No high-risk cases found" description="No cases match this search or filter." />
      ) : (
        <div className="space-y-3">
          {state.data.map((c) => {
            const transitions = getAvailableHighRiskTransitions(c.status);
            return (
              <Card key={c.id} className="hover:shadow-warm-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-warm-brown">{c.motherName}</h4>
                      <Badge variant={getRiskBadgeVariant(c.riskLevel)} size="sm">{c.riskLevel} Risk</Badge>
                      <Badge variant={getHighRiskStatusBadgeVariant(c.status)} size="sm">{HIGH_RISK_STATUS_LABELS[c.status]}</Badge>
                    </div>
                    <p className="text-sm text-warm-muted mt-1.5">{c.riskFactors.join(', ')}</p>
                    <p className="text-xs text-warm-muted mt-1">
                      {getFacilityName(c.hospitalId)} • Flagged {formatDate(c.flaggedAt)}
                    </p>
                    {c.notes && <p className="text-xs text-sandal-700 italic mt-1">{c.notes}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {transitions.length === 0 ? (
                      <span className="text-xs text-warm-muted">No further action</span>
                    ) : (
                      transitions.map((next) => (
                        <Button
                          key={next}
                          size="sm"
                          variant={next === 'RESOLVED' ? 'sage' : 'outline'}
                          onClick={() => handleTransition(c.id, next)}
                        >
                          Mark {HIGH_RISK_STATUS_LABELS[next]}
                        </Button>
                      ))
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
