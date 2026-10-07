import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Camera, KeyRound, ScanLine, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QrScanPatient, parseQrInput, scanQrToken } from '@/services/qrService';
import { PatientQrSummary } from './components/PatientQrSummary';
import { QrCameraScanner } from './components/QrCameraScanner';
import { AdditionalDetailsPanel } from './components/AdditionalDetailsPanel';
import { ScanFailure, describeScanFailure } from './qrScanUi';

// Shared by /doctor/scan-qr and /hospital/scan-qr. Two ways in: "Scan with
// Camera" (laptop webcam reads the QR on the mother's phone) or manual entry —
// paste either the full MaaSuraksha QR link or the bare token. (Phones
// normally skip this page — scanning the QR with the phone camera opens /q
// directly.) Both paths end in the same POST /api/qr/scan; access control is
// entirely server-side, and this page only renders what the backend returns
// for the signed-in clinician.

export const QrScanPage: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [inputError, setInputError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<QrScanPatient | null>(null);
  // Kept in memory (never rendered) so the consent request can reference this scan.
  const [patientToken, setPatientToken] = useState<string | null>(null);
  const [failure, setFailure] = useState<ScanFailure | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const lookUp = async (token: string) => {
    setLoading(true);
    try {
      setPatient(await scanQrToken(token));
      setPatientToken(token);
    } catch (error) {
      setFailure(describeScanFailure(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = parseQrInput(tokenInput);
    setPatient(null);
    setFailure(null);
    setCameraOpen(false);

    if (!token) {
      setInputError('Paste a MaaSuraksha QR link, or the 64-character token (0-9 and a-f).');
      return;
    }
    setInputError(undefined);
    await lookUp(token);
  };

  // The scanner has already released the camera by the time this is called.
  const handleCameraToken = (token: string) => {
    setCameraOpen(false);
    setTokenInput('');
    setInputError(undefined);
    setFailure(null);
    setPatient(null);
    void lookUp(token);
  };

  const handleOpenCamera = () => {
    setPatient(null);
    setFailure(null);
    setCameraOpen(true);
  };

  const handleClear = () => {
    setTokenInput('');
    setInputError(undefined);
    setPatient(null);
    setFailure(null);
    setCameraOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scan Patient QR"
        subtitle="Look up a mother's MaaSuraksha care card by scanning her QR code with your camera, or by pasting its link or token. Only patients under your active care can be viewed."
        actions={
          !cameraOpen && (
            <Button leftIcon={<Camera className="w-4 h-4" />} onClick={handleOpenCamera} disabled={loading}>
              Scan with Camera
            </Button>
          )
        }
      />

      {cameraOpen && <QrCameraScanner onToken={handleCameraToken} onClose={() => setCameraOpen(false)} />}

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <ScanLine className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Enter QR Link or Token</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            id="qr-token"
            label="QR Link or Token"
            placeholder="Paste the QR link or the 64-character token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4" />}
            error={inputError}
            helperText={
              inputError
                ? undefined
                : 'On a phone, just scan the QR with its camera. On a laptop, use Scan with Camera above, or paste the link here.'
            }
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

      {patient && <PatientQrSummary patient={patient} />}
      {patient && patientToken && <AdditionalDetailsPanel qrToken={patientToken} />}
    </div>
  );
};
