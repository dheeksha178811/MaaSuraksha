import { Router } from 'express';
import {
  getMyGrowthMeasurements,
  logGrowthMeasurement,
  getMyMilestones,
  markMilestoneAchieved,
  getMyVaccinations,
  toggleVaccinationReminder,
} from '../controllers/motherController';
import { validateLogGrowthMeasurement } from '../validators/growthValidators';
import { validateMarkMilestoneAchieved } from '../validators/milestoneValidators';
import { validateToggleVaccinationReminder } from '../validators/vaccinationValidators';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/growth-measurements', authenticate, requireRole('mother'), getMyGrowthMeasurements);
router.post('/growth-measurements', authenticate, requireRole('mother'), validateLogGrowthMeasurement, logGrowthMeasurement);
router.get('/milestones', authenticate, requireRole('mother'), getMyMilestones);
router.patch('/milestones/:milestoneId/achieve', authenticate, requireRole('mother'), validateMarkMilestoneAchieved, markMilestoneAchieved);
router.get('/vaccinations', authenticate, requireRole('mother'), getMyVaccinations);
router.patch('/vaccinations/:vaccinationId/reminder', authenticate, requireRole('mother'), validateToggleVaccinationReminder, toggleVaccinationReminder);

export default router;
