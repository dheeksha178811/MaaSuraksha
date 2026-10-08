import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowRightLeft, Plus, Filter, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import {
  CreateReferralInput,
  Referral,
  ReferralActionKey,
  acceptReferral,
  cancelReferral,
  completeReferral,
  createReferral,
  getAvailableReferralActions,
  listReferrals,
  markReferralInTransit,
  rejectReferral,
} from '@/services/referralService';
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

const errorText = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Something went wrong. Please try again.');

export const HospitalReferralsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | ReferralStatus>('ALL');
  const [priority, setPriority] = useState<'ALL' | ReferralPriority>('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Referral | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTouched, setRejectTouched] = useState(false);

  // The API returns every referral visible to this account; the existing
  // search / status / priority filters narrow that list on the client.
  const [state, reload] = useAsyncData(listReferrals, []);

  const filtered = useMemo(() => {
    if (state.status !== 'success') return [];
    const q = search.trim().toLowerCase();
    return state.data.filter(
      (r) =>
        (status === 'ALL' || r.status === status) &&
        (priority === 'ALL' || r.priority === priority) &&
        (!q || r.patient.name.toLowerCase().includes(q) || (r.reason ?? '').toLowerCase().includes(q))
    );
  }, [state, search, status, priority]);

  const handleCreate = async (input: CreateReferralInput) => {
    await createReferral(input);
    reload();
  };

  const runAction = async (referral: Referral, key: ReferralActionKey, reason?: string) => {
    setBusyId(referral.id);
    setActionError(null);
    try {
      switch (key) {
        case 'accept':
          await acceptReferral(referral.id);
          break;
        case 'reject':
          await rejectReferral(referral.id, reason ?? '');
          break;
        case 'in-transit':
          await markReferralInTransit(referral.id);
          break;
        case 'complete':
          await completeReferral(referral.id);
          break;
        case 'cancel':
          await cancelReferral(referral.id);
          break;
      }
      setRejecting(null);
    } catch (e) {
      setActionError(errorText(e));
    } finally {
      setBusyId(null);
      reload(); // always re-read: the backend is the source of truth for status
    }
  };

  const handleAction = (referral: Referral, key: ReferralActionKey) => {
    if (key === 'reject') {
      setRejectReason('');
      setRejectTouched(false);
      setRejecting(referral);
      return;
    }
    void runAction(referral, key);
  };

  const submitRejection = () => {
    setRejectTouched(true);
    if (!rejecting || !rejectReason.trim()) return;
    void runAction(rejecting, 'reject', rejectReason.trim());
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

      {actionError && (
        <Card padding="md" className="flex items-start gap-3 border-red-200 bg-red-50/60">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-warm-muted">{actionError}</p>
        </Card>
      )}

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading referrals…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="No referrals found"
          description={state.data.length === 0 ? 'There are no referrals to or from this facility yet.' : 'No referrals match this search or filter.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((referral) => {
            const actions = getAvailableReferralActions(referral);
            const incoming = referral.viewerRole === 'receiver';
            return (
              <Card key={referral.id} className="hover:shadow-warm-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-warm-brown">{referral.patient.name}</h4>
                      <Badge variant={getReferralStatusBadgeVariant(referral.status)} size="sm">{REFERRAL_STATUS_LABELS[referral.status]}</Badge>
                      <Badge variant={getReferralPriorityBadgeVariant(referral.priority)} size="sm">{REFERRAL_PRIORITY_LABELS[referral.priority]}</Badge>
                      <Badge variant="outline" size="sm">{incoming ? 'Incoming' : 'Outgoing'}</Badge>
                    </div>
                    {(referral.patient.maaSurakshaId || referral.patient.bloodGroup) && (
                      <p className="text-xs text-warm-muted mt-1">
                        {[referral.patient.maaSurakshaId, referral.patient.bloodGroup && `Blood group ${referral.patient.bloodGroup}`].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="text-sm text-warm-muted mt-1.5">{referral.reason}</p>
                    <p className="text-sm text-warm-muted mt-1.5">
                      <span className="font-medium text-warm-brown">Clinical summary:</span> {referral.clinicalSummary}
                    </p>
                    <p className="text-sm text-warm-muted mt-2">
                      {incoming ? 'From' : 'To'}{' '}
                      <span className="font-medium text-warm-brown">{incoming ? referral.fromHospital : referral.toHospital}</span>
                      <span className="text-xs"> · Dr. {referral.referringDoctor.replace(/^Dr\.?\s*/i, '')}</span>
                    </p>
                    <p className="text-xs text-warm-muted mt-1">Created {formatDate(referral.createdAt)}</p>
                    {referral.rejectionReason && (
                      <p className="text-xs text-rose-700 italic mt-1">Rejected: {referral.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {actions.length === 0 ? (
                      <span className="text-xs text-warm-muted">No further action</span>
                    ) : (
                      actions.map((action) => (
                        <Button
                          key={action.key}
                          size="sm"
                          variant={action.tone === 'danger' ? 'danger' : 'outline'}
                          disabled={busyId === referral.id}
                          onClick={() => handleAction(referral, action.key)}
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

      <Modal
        isOpen={rejecting !== null}
        onClose={() => setRejecting(null)}
        title="Reject Referral"
        description={rejecting ? `Referral for ${rejecting.patient.name} from ${rejecting.fromHospital}.` : undefined}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Tell the referring facility why this cannot be accepted..."
              className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
            />
            {rejectTouched && !rejectReason.trim() && <p className="text-xs text-rose-600 font-medium mt-1">A rejection reason is required.</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setRejecting(null)} disabled={busyId !== null}>Cancel</Button>
            <Button variant="danger" onClick={submitRejection} disabled={busyId !== null}>Reject Referral</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
