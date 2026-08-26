import { Router } from 'express';
import {
  getMyAppointments,
  getMyCarePlans,
  getMyPatients,
  getPatientConsultationNotes,
  getPatientDetail,
} from '../controllers/doctorController';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/patients', authenticate, requireRole('doctor'), getMyPatients);
router.get('/patients/:patientId', authenticate, requireRole('doctor'), getPatientDetail);
router.get('/patients/:patientId/consultation-notes', authenticate, requireRole('doctor'), getPatientConsultationNotes);
router.get('/appointments', authenticate, requireRole('doctor'), getMyAppointments);
router.get('/care-plans', authenticate, requireRole('doctor'), getMyCarePlans);

export default router;
