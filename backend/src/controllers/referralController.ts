import { Request, Response } from 'express';
import {
  Actor,
  CreateReferralInput,
  ReferralAction,
  createReferral,
  getReferral,
  listReferralDestinations,
  listReferrals,
  transitionReferral,
} from '../services/referralService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

// Identity and role come only from the verified JWT (authenticate +
// requireRole run before every handler here).
function handle(label: string, fn: (req: Request, res: Response, actor: Actor) => Promise<void>) {
  return async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication token is required.' });
      return;
    }
    res.setHeader('Cache-Control', 'private, no-store');
    try {
      await fn(req, res, { id: req.user.id, role: req.user.role as Actor['role'] });
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.status).json({ success: false, message: error.message });
        return;
      }
      logger.error(`${label} failed`, error);
      res.status(500).json({ success: false, message: 'Unable to process referral request.' });
    }
  };
}

const clinician = (actor: Actor) => ({ id: actor.id, role: actor.role as 'doctor' | 'hospital' });

export const listDestinations = handle('List referral destinations', async (_req, res, actor) => {
  res.status(200).json({ success: true, hospitals: await listReferralDestinations(clinician(actor)) });
});

export const create = handle('Create referral', async (req, res, actor) => {
  const referral = await createReferral(clinician(actor), req.body as CreateReferralInput);
  res.status(201).json({ success: true, referral });
});

export const list = handle('List referrals', async (_req, res, actor) => {
  res.status(200).json({ success: true, referrals: await listReferrals(actor) });
});

export const detail = handle('Fetch referral', async (req, res, actor) => {
  res.status(200).json({ success: true, referral: await getReferral(actor, req.params.id) });
});

const transition = (label: string, action: ReferralAction) =>
  handle(label, async (req, res, actor) => {
    const referral = await transitionReferral(actor, req.params.id, action, req.body?.rejection_reason);
    res.status(200).json({ success: true, referral });
  });

export const accept = transition('Accept referral', 'accept');
export const reject = transition('Reject referral', 'reject');
export const markInTransit = transition('Mark referral in transit', 'in-transit');
export const complete = transition('Complete referral', 'complete');
export const cancel = transition('Cancel referral', 'cancel');
