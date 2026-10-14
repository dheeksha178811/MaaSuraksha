import { Request, Response } from 'express';
import {
  getMaternalRiskAnalytics,
  getPatientTrends,
  recordVital,
  recordWarningSign,
  reviewFlag,
} from '../services/maternalRiskService';
import { logger } from '../utils/logger';

const NOT_FOUND = { success: false, message: 'Patient not found for this account.' };
const unauthenticated = (res: Response) =>
  res.status(401).json({ success: false, message: 'Authentication token is required.' });

export async function getAnalytics(req: Request, res: Response) {
  if (!req.user) return unauthenticated(res);
  try {
    const analytics = await getMaternalRiskAnalytics(req.user.id, res.locals.weeks as number);
    res.status(200).json({ success: true, analytics });
  } catch (error) {
    logger.error('Fetch maternal risk analytics failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch maternal risk analytics.' });
  }
}

export async function getTrends(req: Request, res: Response) {
  if (!req.user) return unauthenticated(res);
  try {
    const trends = await getPatientTrends(req.user.id, req.params.patientId);
    if (!trends) return res.status(404).json(NOT_FOUND);
    res.status(200).json({ success: true, trends });
  } catch (error) {
    logger.error('Fetch patient health trends failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch health trends.' });
  }
}

export async function postVital(req: Request, res: Response) {
  if (!req.user) return unauthenticated(res);
  try {
    const created = await recordVital(req.user.id, req.params.patientId, req.body);
    if (!created) return res.status(404).json(NOT_FOUND);
    res.status(201).json({ success: true, id: created.id });
  } catch (error) {
    logger.error('Record blood pressure failed', error);
    res.status(500).json({ success: false, message: 'Unable to record blood pressure.' });
  }
}

export async function postWarningSign(req: Request, res: Response) {
  if (!req.user) return unauthenticated(res);
  try {
    const created = await recordWarningSign(req.user.id, req.params.patientId, req.body);
    if (!created) return res.status(404).json(NOT_FOUND);
    res.status(201).json({ success: true, id: created.id });
  } catch (error) {
    logger.error('Record warning sign failed', error);
    res.status(500).json({ success: false, message: 'Unable to record warning sign.' });
  }
}

export async function postFlagReview(req: Request, res: Response) {
  if (!req.user) return unauthenticated(res);
  try {
    const result = await reviewFlag(req.user.id, req.params.patientId, req.body);
    if (result === 'patient_not_found') return res.status(404).json(NOT_FOUND);
    if (result === 'flag_not_found') {
      return res.status(404).json({ success: false, message: 'That flag is not currently raised for this patient.' });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Review risk flag failed', error);
    res.status(500).json({ success: false, message: 'Unable to save the review.' });
  }
}
