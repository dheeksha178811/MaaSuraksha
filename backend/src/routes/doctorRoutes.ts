import { Router } from 'express';
import { getMyPatients, getPatientDetail } from '../controllers/doctorController';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/patients', authenticate, requireRole('doctor'), getMyPatients);
router.get('/patients/:patientId', authenticate, requireRole('doctor'), getPatientDetail);

export default router;
