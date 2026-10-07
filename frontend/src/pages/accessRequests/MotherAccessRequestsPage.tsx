import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, Check, Clock, ShieldCheck, Stethoscope, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import {
  ConsentRequest,
  approveAccessRequest,
  denyAccessRequest,
  listMyAccessRequests,
  sectionLabel,
} from '@/services/consentService';
import { formatDateTime } from '@/utils/dateTime';
import { APPROVE_CONFIRMATION, ConsentStatusBadge } from './accessRequestUi';

// Mother's inbox of QR access requests. Approving starts a short, server-timed
// window for that one requester and only the sections they asked for; denying
// releases nothing. Decisions are made server-side and can't be changed later.

const POLL_MS = 15000;

export const MotherAccessRequestsPage: React.FC = () => {
  const [state, reload] = useAsyncData(() => listMyAccessRequests(), []);
  const [confirming, setConfirming] = useState<ConsentRequest | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Quiet background refresh so new requests show up without a manual reload.
  const [quiet, setQuiet] = useState<ConsentRequest[] | null>(null);
  useEffect(() => {
    const timer = setInterval(() => {
      listMyAccessRequests().then(setQuiet).catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => setQuiet(null), [state]);

  const requests = quiet ?? (state.status === 'success' ? state.data : []);

  const decide = async (request: ConsentRequest, approve: boolean) => {
    setBusyId(request.id);
    setActionError(null);
    try {
      await (approve ? approveAccessRequest(request.id) : denyAccessRequest(request.id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setConfirming(null);
      setBusyId(null);
      reload();
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const past = requests.filter((r) => r.status !== 'pending');

  const renderCard = (r: ConsentRequest) => (
    <Card key={r.id} padding="md" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {r.requesterType === 'hospital' ? (
            <Building2 className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
          ) : (
            <Stethoscope className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-warm-brown break-words">{r.requesterName ?? 'Healthcare provider'}</p>
            <p className="text-xs text-warm-muted">{r.requesterType === 'hospital' ? 'Hospital' : 'Doctor'}</p>
          </div>
        </div>
        <ConsentStatusBadge status={r.status} />
      </div>

      <div className="text-sm space-y-1">
        <p className="text-xs text-warm-muted">Requested information</p>
        <p className="font-medium text-warm-brown">{r.sections.map(sectionLabel).join(' · ')}</p>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-warm-muted">
        <span>Requested {formatDateTime(r.requestedAt)}</span>
        {r.respondedAt && <span>Answered {formatDateTime(r.respondedAt)}</span>}
        {r.accessExpiresAt && (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {r.status === 'expired' ? 'Access ended' : 'Access until'} {formatDateTime(r.accessExpiresAt)}
          </span>
        )}
      </div>

      {r.status === 'pending' && (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button leftIcon={<Check className="w-4 h-4" />} onClick={() => setConfirming(r)} disabled={busyId === r.id}>
            Approve
          </Button>
          <Button variant="outline" leftIcon={<X className="w-4 h-4" />} onClick={() => void decide(r, false)} disabled={busyId === r.id}>
            Deny
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Requests"
        subtitle="Doctors and hospitals that scan your MaaSuraksha QR see only basic care details. If they need more, they ask here — nothing is shared unless you approve."
      />

      {actionError && (
        <Card padding="md" className="flex items-start gap-3 border-red-200 bg-red-50/60">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-warm-muted">{actionError}</p>
        </Card>
      )}

      {state.status !== 'success' && quiet === null ? (
        <AsyncStateView
          status={state.status === 'loading' ? 'loading' : 'error'}
          loadingLabel="Loading access requests…"
          errorMessage={state.status === 'error' ? state.message : undefined}
          onRetry={reload}
        />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No access requests"
          description="When a doctor or hospital asks for additional details after scanning your QR, the request will appear here."
        />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-warm-brown">Pending ({pending.length})</h2>
            {pending.length === 0 ? <p className="text-sm text-warm-muted">Nothing waiting for your decision.</p> : pending.map(renderCard)}
          </section>
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-warm-brown">History</h2>
              {past.map(renderCard)}
            </section>
          )}
        </>
      )}

      <Modal
        isOpen={confirming !== null}
        onClose={() => setConfirming(null)}
        title="Approve access?"
        description={confirming ? `${confirming.requesterName ?? 'This provider'} is asking to view:` : undefined}
      >
        {confirming && (
          <div className="space-y-4">
            <ul className="list-disc pl-5 text-sm text-warm-brown space-y-0.5">
              {confirming.sections.map((s) => (
                <li key={s}>{sectionLabel(s)}</li>
              ))}
            </ul>
            <p className="text-sm text-warm-muted">{APPROVE_CONFIRMATION} Access ends automatically after 30 minutes.</p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirming(null)} disabled={busyId === confirming.id}>
                Cancel
              </Button>
              <Button onClick={() => void decide(confirming, true)} disabled={busyId === confirming.id}>
                {busyId === confirming.id ? 'Approving…' : 'Approve Access'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
