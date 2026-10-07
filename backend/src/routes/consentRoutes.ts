import { Router } from 'express';
import {
  approveRequest,
  createRequest,
  denyRequest,
  getCurrentRequest,
  getRequestData,
  getRequestStatus,
  listMyRequests,
} from '../controllers/consentController';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

// ---------------------------------------------------------------------------
// /api/consent — QR-based consent for additional patient details.
// Clinicians (doctor/hospital) ask; only the mother can approve or deny. The
// data endpoint re-verifies approval + expiry server-side on every call.
// ---------------------------------------------------------------------------

const router = Router();
const clinician = [authenticate, requireRole('doctor', 'hospital')];
const mother = [authenticate, requireRole('mother')];

router.post('/requests', ...clinician, createRequest);
router.post('/requests/current', ...clinician, getCurrentRequest);
router.get('/requests/:requestId', ...clinician, getRequestStatus);
router.get('/requests/:requestId/data', ...clinician, getRequestData);

router.get('/mother/requests', ...mother, listMyRequests);
router.post('/mother/requests/:requestId/approve', ...mother, approveRequest);
router.post('/mother/requests/:requestId/deny', ...mother, denyRequest);

export default router;
