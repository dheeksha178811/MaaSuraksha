import { Router } from 'express';
import { getMyGrowthMeasurements, logGrowthMeasurement } from '../controllers/motherController';
import { validateLogGrowthMeasurement } from '../validators/growthValidators';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/growth-measurements', authenticate, requireRole('mother'), getMyGrowthMeasurements);
router.post('/growth-measurements', authenticate, requireRole('mother'), validateLogGrowthMeasurement, logGrowthMeasurement);

export default router;
