import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  HeartPulse,
  IdCard,
  KeyRound,
  MapPin,
  Phone,
  ScanLine,
  Search,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/utils/formatters';
import { AuthNetworkError } from '@/services/authApi';
import { QrScanError, QrScanPatient, isValidQrToken, normalizeQrToken, scanQrToken } from '@/services/qrService';

// Shared by /doctor/scan-qr and /hospital/scan-qr. Token input/paste only for
// now — camera scanning is a later step. Access control is entirely
// server-side (GET /api/qr/scan/:token); this page only renders what the
// backend returns for the signed-in clinician.

const STAGE_LABELS: Record<string, string> = {
  pregnancy: 'Pregnancy',
  postpartum: 'Postpartum',
  infant_care: 'Infant Care',
};

interface ScanFailure {
  title: string;
  description: string;
  showSignIn?: boolean;
}

function describeFailure(error: unknown): ScanFailure {
  if (error instanceof QrScanError) {
    switch (error.status) {
      case 400:
        return {
          title: 'Invalid QR code',
          description: 'That does not look like a MaaSuraksha QR token. Check that the full code was pasted and try again.',
        };
      case 401:
        return {
          title: 'Sign in required',
          description: 'Your session is missing or has expired. Sign in again with your real account to look up a patient.',
          showSignIn: true,
        };
      case 403:
        return {
          title: 'Not permitted',
          description: 'Only doctor and hospital accounts can look up a patient QR.',
        };
      case 404:
        return {
          title: 'No matching patient',
          description:
            'This QR code was not recognised, or the patient is not under your active care. Only the assigned doctor or hospital can view this card.',
        };
      default:
        return { title: 'Lookup failed', description: error.message };
    }
  }
  if (error instanceof AuthNetworkError) {
    return { title: 'Server unreachable', description: error.message };
  }
  return { title: 'Lookup failed', description: 'Something went wrong. Please try again.' };
}

const displayOrDash = (value: string | null) => value || '—';
const dateOrDash = (value: string | null) => (value ? formatDate(value) : '—');

export const QrScanPage: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [inputError, setInputError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<QrScanPatient | null>(null);
  const [failure, setFailure] = useState<ScanFailure | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = normalizeQrToken(tokenInput);
    setPatient(null);
    setFailure(null);

    if (!isValidQrToken(token)) {
      setInputError('A MaaSuraksha QR token is 64 characters of 0-9 and a-f.');
      return;
    }
    setInputError(undefined);

    setLoading(true);
    try {
      setPatient(await scanQrToken(token));
    } catch (error) {
      setFailure(describeFailure(error));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTokenInput('');
    setInputError(undefined);
    setPatient(null);
    setFailure(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scan Patient QR"
        subtitle="Look up a mother's MaaSuraksha care card by pasting the token from her QR code. Only patients under your active care can be viewed."
      />

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <ScanLine className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Enter QR Token</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            id="qr-token"
            label="QR Token"
            placeholder="Paste the 64-character token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4" />}
            error={inputError}
            helperText={inputError ? undefined : 'Camera scanning is coming soon — for now, paste the token encoded in the QR.'}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" leftIcon={<Search className="w-4 h-4" />} disabled={loading || !tokenInput.trim()}>
              {loading ? 'Looking up…' : 'Look Up Patient'}
            </Button>
            {(tokenInput || patient || failure) && (
              <Button type="button" variant="outline" onClick={handleClear} disabled={loading}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {failure && (
        <Card padding="lg" className="flex items-start gap-3 border-red-200 bg-red-50/60">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2 min-w-0">
            <p className="text-sm font-semibold text-warm-brown">{failure.title}</p>
            <p className="text-sm text-warm-muted">{failure.description}</p>
            {failure.showSignIn && (
              <Link to="/auth/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {patient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-sandal-100">
              <div className="flex items-center gap-2.5">
                <IdCard className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-lg font-bold text-warm-brown">Care Identity</h3>
              </div>
              {patient.stage && <Badge variant="sage">{STAGE_LABELS[patient.stage] ?? patient.stage}</Badge>}
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2">
                <dt className="text-xs text-warm-muted">Mother</dt>
                <dd className="font-display text-xl font-bold text-warm-brown">{patient.motherName}</dd>
              </div>
              <div>
                <dt className="text-xs text-warm-muted">MaaSuraksha ID</dt>
                <dd className="font-medium text-warm-brown tracking-wide">{patient.maaSurakshaId}</dd>
              </div>
              <div className="flex items-start gap-2">
                <HeartPulse className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-warm-muted">Blood Group</dt>
                  <dd className="font-medium text-warm-brown">{displayOrDash(patient.bloodGroup)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-warm-muted">Location</dt>
                  <dd className="font-medium text-warm-brown">{displayOrDash(patient.location)}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs text-warm-muted">Issued</dt>
                <dd className="font-medium text-warm-brown">{dateOrDash(patient.issuedDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-warm-muted">Valid Through</dt>
                <dd className="font-medium text-warm-brown">{dateOrDash(patient.validThrough)}</dd>
              </div>
            </dl>
          </Card>

          <div className="space-y-5">
            <Card padding="lg" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
                <ShieldAlert className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-lg font-bold text-warm-brown">Emergency Contact</h3>
              </div>
              {patient.emergencyContactName ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs text-warm-muted">Name</dt>
                      <dd className="font-medium text-warm-brown">
                        {patient.emergencyContactName}
                        {patient.emergencyContactRelation && ` (${patient.emergencyContactRelation})`}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-xs text-warm-muted">Phone</dt>
                      <dd className="font-medium text-warm-brown">{displayOrDash(patient.emergencyContactPhone)}</dd>
                    </div>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-warm-muted">No emergency contact on file.</p>
              )}
            </Card>

            <Card padding="lg" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
                <Stethoscope className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-lg font-bold text-warm-brown">Care Assignment</h3>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs text-warm-muted">Hospital / Facility</dt>
                    <dd className="font-medium text-warm-brown">{displayOrDash(patient.assignedHospitalName)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Stethoscope className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs text-warm-muted">Primary Doctor</dt>
                    <dd className="font-medium text-warm-brown">{displayOrDash(patient.assignedDoctorName)}</dd>
                  </div>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
