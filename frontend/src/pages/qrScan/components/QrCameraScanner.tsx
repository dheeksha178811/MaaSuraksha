import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { parseQrInput } from '@/services/qrService';

// Webcam QR scanner for the Scan Patient QR page. It is only mounted after the
// clinician clicks "Scan with Camera", so the browser's camera permission
// prompt never appears before that. Frames are decoded in memory only — nothing
// is recorded, stored or uploaded — and the camera is released as soon as a
// MaaSuraksha QR is read, on cancel, and on unmount. The raw token is handed
// straight to onToken and never shown or logged here.

interface QrCameraScannerProps {
  onToken: (token: string) => void;
  onClose: () => void;
}

type CameraStatus =
  | { kind: 'starting' }
  | { kind: 'scanning' }
  | { kind: 'error'; title: string; description: string };

const UNSUPPORTED: CameraStatus = {
  kind: 'error',
  title: 'Camera not available',
  description:
    'This browser cannot access a camera here. Browsers only allow camera access on secure (HTTPS) pages or on localhost. You can still paste the QR link or token above.',
};

function describeCameraError(error: unknown): CameraStatus {
  const name = error instanceof DOMException || error instanceof Error ? error.name : '';
  const message = typeof error === 'string' ? error : error instanceof Error ? error.message : '';

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return {
      kind: 'error',
      title: 'Camera permission denied',
      description:
        "Camera access was blocked. Allow camera access for this site in your browser's address bar or settings, then try again — or paste the QR link or token above.",
    };
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || /camera not found/i.test(message)) {
    return {
      kind: 'error',
      title: 'No camera found',
      description: 'No camera was detected on this device. Connect a webcam, or paste the QR link or token above.',
    };
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return {
      kind: 'error',
      title: 'Camera is in use',
      description: 'The camera could not be started — another app or browser tab may be using it. Close it and try again.',
    };
  }
  return {
    kind: 'error',
    title: 'Could not start the camera',
    description: 'Something went wrong starting the camera. Try again, or paste the QR link or token above.',
  };
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({ onToken, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>({ kind: 'starting' });
  const [notMaaSuraksha, setNotMaaSuraksha] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus(UNSUPPORTED);
      return;
    }

    let cancelled = false;
    let handled = false;

    const scanner = new QrScanner(
      video,
      (result) => {
        if (handled) return;
        const token = parseQrInput(result.data);
        if (!token) {
          // Some other QR code — keep scanning and say so.
          setNotMaaSuraksha(true);
          return;
        }
        handled = true;
        // Release the camera immediately, before the lookup starts.
        scanner.destroy();
        onToken(token);
      },
      {
        // Fires on every frame without a QR in it — expected, not an error.
        onDecodeError: () => {},
        returnDetailedScanResult: true,
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scanner
      .start()
      .then(() => {
        if (!cancelled) setStatus({ kind: 'scanning' });
      })
      .catch((error) => {
        if (!cancelled) setStatus(describeCameraError(error));
      });

    return () => {
      cancelled = true;
      scanner.destroy();
    };
    // Mounted once per "Scan with Camera" click; onToken is only called once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failed = status.kind === 'error';

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-sandal-100">
        <div className="flex items-center gap-2.5">
          <Camera className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Scan with Camera</h3>
        </div>
        <Button type="button" variant="outline" size="sm" leftIcon={<X className="w-4 h-4" />} onClick={onClose}>
          Stop Camera
        </Button>
      </div>

      <p className="text-sm text-warm-muted">
        This computer's webcam will be used to scan the mother's MaaSuraksha QR. Hold her phone screen steady in front
        of the camera — the code is read automatically. Nothing is recorded or saved.
      </p>

      {status.kind === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50/60">
          <CameraOff className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold text-warm-brown">{status.title}</p>
            <p className="text-sm text-warm-muted">{status.description}</p>
          </div>
        </div>
      )}

      {/* The video element stays mounted for the scanner's whole life; it is only hidden on error. */}
      <div
        className={
          failed
            ? 'hidden'
            : 'relative w-full max-w-md mx-auto aspect-video overflow-hidden rounded-2xl bg-warm-brown/90 border border-sandal-200'
        }
      >
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        {status.kind === 'starting' && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/80">
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Starting camera…
          </div>
        )}
      </div>

      {status.kind === 'scanning' && notMaaSuraksha && (
        <p className="text-xs text-warm-muted text-center">
          That QR code is not a MaaSuraksha care card. Keep scanning, or stop the camera.
        </p>
      )}
    </Card>
  );
};
