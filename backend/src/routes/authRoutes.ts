import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateMe,
  getMyEmergencyContact,
  updateMyEmergencyContact,
  getMySettings,
  updateMySettings,
  getMyChildren,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController';
import {
  validateRegister,
  validateLogin,
  validateUpdateMe,
  validateEmergencyContact,
  validateSettingsUpdate,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from '../validators/authValidators';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validateUpdateMe, updateMe);
router.get('/me/emergency-contact', authenticate, requireRole('mother'), getMyEmergencyContact);
router.put('/me/emergency-contact', authenticate, requireRole('mother'), validateEmergencyContact, updateMyEmergencyContact);
router.get('/me/settings', authenticate, getMySettings);
router.patch('/me/settings', authenticate, validateSettingsUpdate, updateMySettings);
router.get('/me/children', authenticate, requireRole('mother'), getMyChildren);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/change-password', authenticate, validateChangePassword, changePassword);

export default router;
