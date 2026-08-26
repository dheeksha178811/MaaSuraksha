import { Router } from 'express';
import {
  getMyAdminProfile,
  getMyAdminSettings,
  updateMyAdminProfile,
  updateMyAdminSettings,
} from '../controllers/adminController';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/profile', authenticate, requireRole('admin'), getMyAdminProfile);
router.patch('/profile', authenticate, requireRole('admin'), updateMyAdminProfile);
router.get('/settings', authenticate, requireRole('admin'), getMyAdminSettings);
router.patch('/settings', authenticate, requireRole('admin'), updateMyAdminSettings);

export default router;
