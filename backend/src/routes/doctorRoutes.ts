import { Router } from 'express';
import { getMyAppointments, getMyPatients, getPatientDetail } from '../controllers/doctorController';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/patients', authenticate, requireRole('doctor'), getMyPatients);
router.get('/patients/:patientId', authenticate, requireRole('doctor'), getPatientDetail);
router.get('/appointments', authenticate, requireRole('doctor'), getMyAppointments);

export default router;
