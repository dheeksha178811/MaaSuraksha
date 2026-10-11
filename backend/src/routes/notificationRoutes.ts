import { Router } from 'express';
import { list, markAllRead, markRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

// /api/notifications — the signed-in user's own in-app notifications.
const router = Router();
const anyUser = [authenticate, requireRole('mother', 'doctor', 'hospital', 'admin')];

router.get('/', ...anyUser, list);
router.post('/read-all', ...anyUser, markAllRead); // before '/:id/read'
router.post('/:id/read', ...anyUser, markRead);

export default router;
