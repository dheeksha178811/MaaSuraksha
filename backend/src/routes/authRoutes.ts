import { Router } from 'express';
import { register, login, getMe, updateMe, forgotPassword, resetPassword, changePassword } from '../controllers/authController';
import {
  validateRegister,
  validateLogin,
  validateUpdateMe,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from '../validators/authValidators';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validateUpdateMe, updateMe);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/change-password', authenticate, validateChangePassword, changePassword);

export default router;
