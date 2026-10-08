import { Router } from 'express';
import { accept, cancel, complete, create, detail, list, listDestinations, markInTransit, reject } from '../controllers/referralController';
import { validateCreateReferral, validateRejectReferral, validateReferralIdParam } from '../validators/referralValidators';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

// ---------------------------------------------------------------------------
// /api/referrals — hospital-to-hospital referrals.
// Role gates here are coarse; who may act on a specific referral (sender,
// receiving hospital, patient) is enforced in referralService.
// ---------------------------------------------------------------------------

const router = Router();
const clinician = [authenticate, requireRole('doctor', 'hospital')];
const viewer = [authenticate, requireRole('doctor', 'hospital', 'mother')];

router.get('/hospitals', ...clinician, listDestinations); // before '/:id'
router.post('/', ...clinician, validateCreateReferral, create);
router.get('/', ...viewer, list);
router.get('/:id', ...viewer, validateReferralIdParam, detail);

router.post('/:id/accept', ...clinician, validateReferralIdParam, accept);
router.post('/:id/reject', ...clinician, validateReferralIdParam, validateRejectReferral, reject);
router.post('/:id/in-transit', ...clinician, validateReferralIdParam, markInTransit);
router.post('/:id/complete', ...clinician, validateReferralIdParam, complete);
router.post('/:id/cancel', ...clinician, validateReferralIdParam, cancel);

export default router;
