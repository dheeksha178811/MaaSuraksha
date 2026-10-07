import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Clock, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ApprovedData,
  CONSENT_SECTION_OPTIONS,
  ConsentError,
  ConsentRequest,
  ConsentSection,
  createConsentRequest,
  getConsentRequestStatus,
  getConsentedData,
  getCurrentConsentRequest,
  sectionLabel,
} from '@/services/consentService';
import { ConsentStatusBadge } from '@/pages/accessRequests/accessRequestUi';
import { formatCountdown, formatDateTime } from '@/utils/dateTime';
import { ApprovedDataView } from './ApprovedDataView';

// "Request Additional Details", shown under the unchanged basic QR summary.
// The mother must approve; the backend then releases only the approved
// sections, only to this clinician, until the expiry it stores. This panel
// holds nothing sensitive across a refresh: approved data lives in component
// state only, is dropped the moment the window closes, and is re-fetched
// (and re-authorized server-side) whenever the panel mounts.

const POLL_MS = 4000;

const errorText = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Something went wrong. Please try again.');

export const AdditionalDetailsPanel: React.FC<{ qrToken: string }> = ({ qrToken }) => {
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<ConsentRequest | null>(null);
  const [skewMs, setSkewMs] = useState(0); // server clock minus local clock
  const [selected, setSelected] = useState<ConsentSection[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApprovedData | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const fetchedFor = useRef<string | null>(null);

  const adopt = useCallback((r: ConsentRequest | null) => {
    setRequest(r);
    if (r) setSkewMs(new Date(r.serverNow).getTime() - Date.now());
    if (!r || r.status !== 'approved') {
      setData(null);
      fetchedFor.current = null;
    }
  }, []);

  // Latest request for this patient (survives a re-scan / refresh).
  useEffect(() => {
    let active = true;
    setLoading(true);
    setSelected([]);
    getCurrentConsentRequest(qrToken)
      .then((r) => {
        if (!active) return;
        adopt(r);
        setError(null);
      })
      .catch((e) => active && setError(errorText(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [qrToken, adopt]);

  const refreshStatus = useCallback(async () => {
    if (!request) return;
    try {
      adopt(await getConsentRequestStatus(request.id));
    } catch (e) {
      setError(errorText(e));
    }
  }, [request, adopt]);

  // Pending: poll for the mother's decision.
  useEffect(() => {
    if (request?.status !== 'pending') return;
    const timer = setInterval(() => void refreshStatus(), POLL_MS);
    return () => clearInterval(timer);
  }, [request?.status, refreshStatus]);

  // Approved: load the granted data once, and tick the countdown.
  useEffect(() => {
    if (request?.status !== 'approved') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    if (fetchedFor.current !== request.id) {
      fetchedFor.current = request.id;
      getConsentedData(request.id)
        .then((res) => {
          setData(res.data);
          adopt(res.request);
        })
        .catch((e) => {
          // 403 = the server says access is gone; re-read the real status.
          if (e instanceof ConsentError && e.status === 403) void refreshStatus();
          else setError(errorText(e));
        });
    }
    return () => clearInterval(timer);
  }, [request?.id, request?.status, adopt, refreshStatus]);

  const remainingMs =
    request?.status === 'approved' && request.accessExpiresAt
      ? new Date(request.accessExpiresAt).getTime() - (now + skewMs)
      : null;
  const windowClosed = remainingMs !== null && remainingMs <= 0;

  // Window closed locally: drop the data immediately and let the server confirm.
  useEffect(() => {
    if (windowClosed) {
      setData(null);
      void refreshStatus();
    }
  }, [windowClosed]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: ConsentSection) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id]));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selected.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      adopt(await createConsentRequest(qrToken, selected));
      setSelected([]);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSubmitting(false);
    }
  };

  const canRequest = !request || request.status === 'denied' || request.status === 'expired';

  return (
    <div className="space-y-5">
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-sandal-100">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Additional Details</h3>
          </div>
          {request && <ConsentStatusBadge status={request.status} />}
        </div>

        {loading && (
          <div className="flex items-center gap-2.5 text-sm text-warm-muted">
            <span className="w-4 h-4 rounded-full border-2 border-sandal-200 border-t-sandal-600 animate-spin" />
            Checking access…
          </div>
        )}

        {!loading && request?.status === 'pending' && (
          <div className="space-y-3">
            <p className="text-sm text-warm-muted">
              Waiting for the patient to respond in her MaaSuraksha portal. Requested{' '}
              <span className="font-medium text-warm-brown">{request.sections.map(sectionLabel).join(', ')}</span> on{' '}
              {formatDateTime(request.requestedAt)}.
            </p>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={() => void refreshStatus()}>
              Check Status
            </Button>
          </div>
        )}

        {!loading && request?.status === 'denied' && (
          <p className="text-sm text-warm-muted">
            The patient declined your previous request
            {request.respondedAt ? ` on ${formatDateTime(request.respondedAt)}` : ''}. No additional details are available.
          </p>
        )}

        {!loading && request?.status === 'expired' && (
          <p className="text-sm text-warm-muted">
            Your temporary access
            {request.accessExpiresAt ? ` ended at ${formatDateTime(request.accessExpiresAt)}` : ' has ended'}. Request again to
            view these details.
          </p>
        )}

        {!loading && request?.status === 'approved' && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-sage-text" />
            <span className="text-warm-muted">Approved by the patient for</span>
            <span className="font-medium text-warm-brown">{request.sections.map(sectionLabel).join(', ')}</span>
            {remainingMs !== null && remainingMs > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-sandal-800 bg-peach-verySoft border border-peach-soft rounded-full px-2.5 py-1">
                <Clock className="w-3.5 h-3.5" />
                {formatCountdown(remainingMs)} left
              </span>
            )}
          </div>
        )}

        {!loading && canRequest && (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-sm text-warm-muted">
              The basic care identity above is all that is shared by QR. To see more, ask the patient for her permission —
              she chooses whether to approve, and any access is temporary.
            </p>
            <fieldset className="space-y-2">
              <legend className="sr-only">Information to request</legend>
              {CONSENT_SECTION_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-start gap-3 rounded-xl border border-sandal-100 bg-white px-3 py-2.5 cursor-pointer hover:border-sandal-300"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-sandal-600"
                    checked={selected.includes(opt.id)}
                    onChange={() => toggle(opt.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-warm-brown">{opt.label}</span>
                    <span className="block text-xs text-warm-muted">{opt.description}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <Button type="submit" disabled={submitting || selected.length === 0}>
              {submitting ? 'Sending…' : 'Request Additional Details'}
            </Button>
          </form>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {request?.status === 'approved' && data && !windowClosed && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
            <ShieldCheck className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Access Details</h3>
          </div>
          <p className="text-xs text-warm-muted">
            Shown only until {request.accessExpiresAt ? formatDateTime(request.accessExpiresAt) : 'access ends'}. Only the
            sections the patient approved are included.
          </p>
          <ApprovedDataView data={data} />
        </Card>
      )}
    </div>
  );
};
