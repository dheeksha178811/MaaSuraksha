import React, { useCallback, useState } from 'react';
import { ArrowRightLeft, Plus, Filter, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { getMotherName } from '@/data/hospitalMockData';
import {
  CreateReferralInput,
  createReferral,
  getAvailableReferralActions,
  getReferrals,
  updateReferralStatus,
} from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { ReferralFormModal } from '@/pages/hospital/components/ReferralFormModal';
import {
  REFERRAL_PRIORITY_LABELS,
  REFERRAL_STATUS_LABELS,
  getReferralPriorityBadgeVariant,
  getReferralStatusBadgeVariant,
} from '@/pages/hospital/hospitalUi';
import { ReferralPriority, ReferralStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...(Object.keys(REFERRAL_STATUS_LABELS) as ReferralStatus[]).map((value) => ({ value, label: REFERRAL_STATUS_LABELS[value] })),
];

const PRIORITY_OPTIONS = [
  { value: 'ALL', label: 'All Priorities' },
  ...(Object.keys(REFERRAL_PRIORITY_LABELS) as ReferralPriority[]).map((value) => ({ value, label: REFERRAL_PRIORITY_LABELS[value] })),
];

export const HospitalReferralsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | ReferralStatus>('ALL');
  const [priority, setPriority] = useState<'ALL' | ReferralPriority>('ALL');
  const [formOpen, setFormOpen] = useState(false);

  const fetcher = useCallback(
    () =>
      getReferrals({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        priority: priority === 'ALL' ? undefined : priority,
      }),
    [search, status, priority]
  );
  const [state, reload] = useAsyncData(fetcher, [search, status, priority]);

  const handleCreate = async (input: CreateReferralInput) => {
    await createReferral(input);
    setFormOpen(false);
    reload();
  };

  const handleTransition = async (id: string, nextStatus: ReferralStatus) => {
    await updateReferralStatus(id, nextStatus);
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maternal Referrals"
        subtitle="Referral coordination console for this facility."
        badge={<Badge variant="sandal">{state.status === 'success' ? state.data.length : '—'} Referrals</Badge>}
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setFormOpen(true)}>
            Create Referral
          </Button>
        }
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
              <Input placeholder="Search by mother or reason..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value as 'ALL' | ReferralStatus)} options={STATUS_OPTIONS} />
            <Select value={priority} onChange={(e) => setPriority(e.target.value as 'ALL' | ReferralPriority)} options={PRIORITY_OPTIONS} />
          </div>
        </div>
      </Card>

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading referrals…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={ArrowRightLeft} title="No referrals found" description="No referrals match this search or filter." />
      ) : (
        <div className="space-y-3">
          {state.data.map((referral) => {
            const actions = getAvailableReferralActions(referral.status);
            return (
              <Card key={referral.id} className="hover:shadow-warm-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-warm-brown">{getMotherName(referral.motherId)}</h4>
                      <Badge variant={getReferralStatusBadgeVariant(referral.status)} size="sm">{REFERRAL_STATUS_LABELS[referral.status]}</Badge>
                      <Badge variant={getReferralPriorityBadgeVariant(referral.priority)} size="sm">{REFERRAL_PRIORITY_LABELS[referral.priority]}</Badge>
                    </div>
                    <p className="text-sm text-warm-muted mt-1.5">{referral.reason}</p>
                    <p className="text-sm text-warm-muted mt-2">
                      To <span className="font-medium text-warm-brown">{referral.toHospitalName}</span>
                    </p>
                    <p className="text-xs text-warm-muted mt-1">Created {formatDate(referral.createdAt.slice(0, 10))}</p>
                    {referral.notes && <p className="text-xs text-sandal-700 italic mt-1">{referral.notes}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {actions.length === 0 ? (
                      <span className="text-xs text-warm-muted">No further action</span>
                    ) : (
                      actions.map((action) => (
                        <Button
                          key={action.nextStatus}
                          size="sm"
                          variant={action.tone === 'danger' ? 'danger' : 'outline'}
                          onClick={() => handleTransition(referral.id, action.nextStatus)}
                        >
                          {action.label}
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

      <ReferralFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
    </div>
  );
};
