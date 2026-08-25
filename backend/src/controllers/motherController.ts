import { Request, Response } from 'express';
import { listMyGrowthMeasurements, logMyGrowthMeasurement } from '../services/growthMeasurementService';
import { listMyMilestones, markMyMilestoneAchieved } from '../services/milestoneService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

export async function getMyGrowthMeasurements(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const measurements = await listMyGrowthMeasurements(req.user.id);
    res.status(200).json({ success: true, measurements });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch growth measurements failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch growth measurements.' });
  }
}

export async function logGrowthMeasurement(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  const { recipientType, childId, date, weightKg, heightCm, headCircumferenceCm, notes } = req.body ?? {};

  try {
    const measurement = await logMyGrowthMeasurement(req.user.id, {
      recipientType,
      childId,
      measuredOn: date,
      weightKg,
      heightCm,
      headCircumferenceCm,
      notes,
    });
    res.status(201).json({ success: true, measurement });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Log growth measurement failed', error);
    res.status(500).json({ success: false, message: 'Unable to log growth measurement.' });
  }
}

export async function getMyMilestones(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const milestones = await listMyMilestones(req.user.id);
    res.status(200).json({ success: true, milestones });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch milestones failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch milestones.' });
  }
}

export async function markMilestoneAchieved(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const milestone = await markMyMilestoneAchieved(req.user.id, req.params.milestoneId);
    res.status(200).json({ success: true, milestone });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Mark milestone achieved failed', error);
    res.status(500).json({ success: false, message: 'Unable to mark milestone achieved.' });
  }
}
