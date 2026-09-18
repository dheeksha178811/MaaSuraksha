import { Request, Response } from 'express';
import { getOrCreateMyCareCard, lookupByQrToken } from '../services/careCardService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// GET /api/mother/care-card
// Requires: authenticate + requireRole('mother')
// Returns the authenticated mother's own active care card including qr_token.
// Creates a card automatically on first access (idempotent).
// ---------------------------------------------------------------------------
export async function getMyCareCard(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const careCard = await getOrCreateMyCareCard(req.user.id);
    res.status(200).json({ success: true, careCard });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch care card failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch care card.' });
  }
}

// ---------------------------------------------------------------------------
// GET /api/qr/scan/:token
// Requires: authenticate + requireRole('doctor', 'hospital')
// Resolves an opaque qr_token to the minimal safe identity payload for a
// clinician. Returns 404 when the token is unknown OR when the clinician has
// no active patient_care_records assignment to the mother whose card this is
// — no information is leaked about whether the token exists at all.
// ---------------------------------------------------------------------------
export async function scanQrToken(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  const { token } = req.params;
  if (!token || typeof token !== 'string' || token.length !== 64 || !/^[0-9a-f]+$/.test(token)) {
    res.status(400).json({ success: false, message: 'Invalid QR token format.' });
    return;
  }

  const role = req.user.role as 'doctor' | 'hospital';

  try {
    const result = await lookupByQrToken(token, req.user.id, role);
    if (!result) {
      res.status(404).json({ success: false, message: 'QR code not recognised or you do not have access to this patient.' });
      return;
    }
    res.status(200).json({ success: true, patient: result });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('QR token scan failed', error);
    res.status(500).json({ success: false, message: 'Unable to process QR scan.' });
  }
}
