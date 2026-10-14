import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { getHealth, getDatabaseHealth } from '../controllers/healthController';

const router = Router();

router.get('/', getHealth);
// /db runs a real query, so in production only an admin may call it;
// /health stays public for uptime checks.
if (process.env.NODE_ENV === 'production') {
  router.get('/db', authenticate, requireRole('admin'), getDatabaseHealth);
} else {
  router.get('/db', getDatabaseHealth);
}

export default router;
