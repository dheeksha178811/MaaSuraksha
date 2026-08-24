import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { getMe, motherOnlyPing, doctorOnlyPing } from '../controllers/testController';

const router = Router();

router.get('/me', authenticate, getMe);
router.get('/mother-only', authenticate, requireRole('mother'), motherOnlyPing);
router.get('/doctor-only', authenticate, requireRole('doctor'), doctorOnlyPing);

export default router;
