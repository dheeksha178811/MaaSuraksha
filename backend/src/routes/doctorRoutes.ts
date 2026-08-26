import { Router } from 'express';
import {
  getMyAppointments,
  getMyCarePlans,
  getMyHospital,
  getMyPatients,
  getMyReports,
  getPatientConsultationNotes,
  getPatientDetail,
  uploadPatientReport,
} from '../controllers/doctorController';
import { validateUploadReport } from '../validators/documentValidators';
import { uploadReportFile } from '../middleware/uploadReportFile';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/patients', authenticate, requireRole('doctor'), getMyPatients);
router.get('/patients/:patientId', authenticate, requireRole('doctor'), getPatientDetail);
router.get('/patients/:patientId/consultation-notes', authenticate, requireRole('doctor'), getPatientConsultationNotes);
router.post(
  '/patients/:patientId/reports',
  authenticate,
  requireRole('doctor'),
  uploadReportFile,
  validateUploadReport,
  uploadPatientReport
);
router.get('/appointments', authenticate, requireRole('doctor'), getMyAppointments);
router.get('/care-plans', authenticate, requireRole('doctor'), getMyCarePlans);
router.get('/hospital', authenticate, requireRole('doctor'), getMyHospital);
router.get('/reports', authenticate, requireRole('doctor'), getMyReports);

export default router;
