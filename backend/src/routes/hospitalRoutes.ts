import { Router } from 'express';
import {
  getMyHospitalPatient,
  getMyHospitalPatients,
  getMyHospitalProfile,
  getMyHospitalSettings,
  updateMyHospitalProfile,
  updateMyHospitalSettings,
} from '../controllers/hospitalController';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/profile', authenticate, requireRole('hospital'), getMyHospitalProfile);
router.patch('/profile', authenticate, requireRole('hospital'), updateMyHospitalProfile);
router.get('/settings', authenticate, requireRole('hospital'), getMyHospitalSettings);
router.patch('/settings', authenticate, requireRole('hospital'), updateMyHospitalSettings);
router.get('/patients', authenticate, requireRole('hospital'), getMyHospitalPatients);
router.get('/patients/:patientId', authenticate, requireRole('hospital'), getMyHospitalPatient);

export default router;
