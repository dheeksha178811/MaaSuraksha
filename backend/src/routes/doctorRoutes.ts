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
import { getAnalytics, getTrends, postFlagReview, postVital, postWarningSign } from '../controllers/maternalRiskController';
import {
  validateAnalyticsQuery,
  validatePatientIdParam,
  validateRecordVital,
  validateRecordWarningSign,
  validateReviewFlag,
} from '../validators/maternalRiskValidators';
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
// Maternal Risk & Progress (migration 011). Every handler scopes by the JWT
// doctor id against patient_care_records.doctor_id — see maternalRiskService.ts.
router.get('/analytics/maternal-risk', authenticate, requireRole('doctor'), validateAnalyticsQuery, getAnalytics);
router.get('/patients/:patientId/health-trends', authenticate, requireRole('doctor'), validatePatientIdParam, getTrends);
router.post('/patients/:patientId/vitals', authenticate, requireRole('doctor'), validatePatientIdParam, validateRecordVital, postVital);
router.post('/patients/:patientId/warning-signs', authenticate, requireRole('doctor'), validatePatientIdParam, validateRecordWarningSign, postWarningSign);
router.post('/patients/:patientId/flag-reviews', authenticate, requireRole('doctor'), validatePatientIdParam, validateReviewFlag, postFlagReview);
router.get('/appointments',authenticate, requireRole('doctor'), getMyAppointments);
router.get('/care-plans', authenticate, requireRole('doctor'), getMyCarePlans);
router.get('/hospital', authenticate, requireRole('doctor'), getMyHospital);
router.get('/reports', authenticate, requireRole('doctor'), getMyReports);

export default router;
