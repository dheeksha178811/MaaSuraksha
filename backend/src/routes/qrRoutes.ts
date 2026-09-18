import { Router } from 'express';
import { scanQrToken } from '../controllers/qrController';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

// ---------------------------------------------------------------------------
// /api/qr routes — QR token resolution for clinicians (doctor + hospital)
//
// The mother-side GET /api/mother/care-card is mounted in motherRoutes.ts
// alongside the other authenticated mother endpoints.
// ---------------------------------------------------------------------------

const router = Router();

// GET /api/qr/scan/:token
// Clinicians only: doctor or hospital must have an active patient_care_records
// row linking them to the mother whose card the token belongs to.
router.get('/scan/:token', authenticate, requireRole('doctor', 'hospital'), scanQrToken);

export default router;
