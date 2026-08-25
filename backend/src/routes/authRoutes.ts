import { Router } from 'express';
import { register, login, getMe, forgotPassword, resetPassword, changePassword } from '../controllers/authController';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from '../validators/authValidators';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/change-password', authenticate, validateChangePassword, changePassword);

export default router;
