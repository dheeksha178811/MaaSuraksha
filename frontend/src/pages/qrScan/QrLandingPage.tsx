import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn, QrCode, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TOKEN_STORAGE_KEY } from '@/services/authApi';
import {
  QR_LANDING_PATH,
  QrScanError,
  QrScanPatient,
  clearPendingQrToken,
  getPendingQrToken,
  savePendingQrToken,
  scanQrToken,
  tokenFromHash,
} from '@/services/qrService';
import { useMockAuth } from '@/hooks/useMockAuth';
import { PatientQrSummary } from './components/PatientQrSummary';
import { AdditionalDetailsPanel } from './components/AdditionalDetailsPanel';
import { ScanFailure, describeScanFailure } from './qrScanUi';

// Where a clinician's phone lands after scanning a mother's MaaSuraksha QR
// (`<origin>/q#t=<token>`). The token is read from the URL fragment, saved in
// tab-scoped sessionStorage only for the sign-in round trip, and removed from
// the address bar straight away. It is never rendered. The lookup itself is an
// authenticated POST /api/qr/scan — who may see what is decided server-side;
// this page only reflects the result.

type View =
  | { kind: 'loading' }
  | { kind: 'none' }
  | { kind: 'invalid' }
  | { kind: 'signin'; expired: boolean }
  | { kind: 'wrongRole' }
  | { kind: 'failure'; failure: ScanFailure }
  | { kind: 'success'; patient: QrScanPatient; token: string };

const SIGN_IN_REDIRECT_DELAY_MS = 1800;

export const QrLandingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useMockAuth();
  const [view, setView] = useState<View>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;

    // 1. Take the token out of the fragment and scrub it from the address bar.
    const hadFragment = location.hash.length > 1;
    if (hadFragment) {
      const fromLink = tokenFromHash(location.hash);
      if (fromLink) savePendingQrToken(fromLink);
      navigate(location.pathname, { replace: true });
    }

    // 2. Continue with whatever scan is pending (this visit's, or one that
    //    survived the login redirect).
    const token = getPendingQrToken();
    if (!token) {
      setView(hadFragment ? { kind: 'invalid' } : { kind: 'none' });
      return;
    }
    if (!sessionStorage.getItem(TOKEN_STORAGE_KEY)) {
      setView({ kind: 'signin', expired: false });
      return;
    }

    scanQrToken(token)
      .then((patient) => {
        if (cancelled) return;
        clearPendingQrToken();
        setView({ kind: 'success', patient, token });
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof QrScanError && error.status === 401) {
          // Keep the pending token — it resumes after signing in again.
          setView({ kind: 'signin', expired: true });
          return;
        }
        if (error instanceof QrScanError && error.status === 403) {
          // Keep the pending token so signing in with a clinician account can
          // continue this scan.
          setView({ kind: 'wrongRole' });
          return;
        }
        const failure = describeScanFailure(error);
        // A network failure is retryable, so the token is kept; any definitive
        // answer (invalid / no access) ends the scan.
        if (error instanceof QrScanError) clearPendingQrToken();
        setView({ kind: 'failure', failure });
      });

    return () => {
      cancelled = true;
    };
    // Runs once per visit; location.hash is read from that first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToSignIn = () => navigate('/auth/login', { state: { from: QR_LANDING_PATH } });

  useEffect(() => {
    if (view.kind !== 'signin') return;
    const timer = setTimeout(goToSignIn, SIGN_IN_REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.kind]);

  const switchAccount = () => {
    logout();
    goToSignIn();
  };

  const signOut = () => {
    clearPendingQrToken();
    logout();
    navigate('/auth/login');
  };

  const dismiss = () => {
    clearPendingQrToken();
    setView({ kind: 'none' });
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Patient Care Card"
        subtitle="Basic care-identity details from a MaaSuraksha QR code. Visible only to the assigned doctor or hospital."
      />

      {view.kind === 'loading' && (
        <Card padding="lg" className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-full border-2 border-sandal-200 border-t-sandal-600 animate-spin" />
          <p className="text-sm text-warm-muted">Checking this QR code…</p>
        </Card>
      )}

      {view.kind === 'none' && (
        <Card padding="lg" className="flex items-start gap-3">
          <QrCode className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
          <div className="space-y-2 min-w-0">
            <p className="text-sm font-semibold text-warm-brown">No QR code to show</p>
            <p className="text-sm text-warm-muted">
              This page opens when you scan a mother's MaaSuraksha QR code with your phone camera. Scan the code
              again to view her care card.
            </p>
            <Link to="/auth/login">
              <Button variant="outline" size="sm">Go to Portal</Button>
            </Link>
          </div>
        </Card>
      )}

      {view.kind === 'invalid' && (
        <Card padding="lg" className="flex items-start gap-3 border-red-200 bg-red-50/60">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold text-warm-brown">Invalid QR code</p>
            <p className="text-sm text-warm-muted">
              That link is not a valid MaaSuraksha QR code. Try scanning the mother's QR code again.
            </p>
          </div>
        </Card>
      )}

      {view.kind === 'signin' && (
        <Card padding="lg" className="flex items-start gap-3">
          <LogIn className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
          <div className="space-y-2 min-w-0">
            <p className="text-sm font-semibold text-warm-brown">
              {view.expired ? 'Your session has expired' : 'Sign in to view this care card'}
            </p>
            <p className="text-sm text-warm-muted">
              Only signed-in doctor and hospital accounts can view a patient's QR details. Redirecting you to sign in —
              your scan will continue afterwards.
            </p>
            <Button size="sm" onClick={goToSignIn}>Sign In Now</Button>
          </div>
        </Card>
      )}

      {view.kind === 'wrongRole' && (
        <Card padding="lg" className="flex items-start gap-3 border-red-200 bg-red-50/60">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2 min-w-0">
            <p className="text-sm font-semibold text-warm-brown">Not permitted</p>
            <p className="text-sm text-warm-muted">
              Only doctor and hospital accounts can view a patient's QR details, and you are signed in with a
              different type of account.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="sm" onClick={switchAccount}>Sign in with a doctor or hospital account</Button>
              <Button size="sm" variant="outline" onClick={dismiss}>Dismiss</Button>
            </div>
          </div>
        </Card>
      )}

      {view.kind === 'failure' && (
        <Card padding="lg" className="flex items-start gap-3 border-red-200 bg-red-50/60">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold text-warm-brown">{view.failure.title}</p>
            <p className="text-sm text-warm-muted">{view.failure.description}</p>
          </div>
        </Card>
      )}

      {view.kind === 'success' && (
        <>
          <PatientQrSummary patient={view.patient} />
          <AdditionalDetailsPanel qrToken={view.token} />
          <div className="flex flex-col sm:flex-row gap-2">
            {(role === 'doctor' || role === 'hospital') && (
              <Link to={`/${role}/scan-qr`}>
                <Button variant="outline" size="sm">Open Scan Patient QR</Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        </>
      )}
    </div>
  );
};
