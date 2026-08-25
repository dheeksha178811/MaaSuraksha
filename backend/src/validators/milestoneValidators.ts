import { Request, Response, NextFunction } from 'express';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Marking a milestone achieved takes no request body — achieved_date is
 * always today's date server-side (matching MOTHER_TODAY_ISO in both
 * frontend call sites), never client-supplied — so any body key at all is
 * unsupported, and the :milestoneId path param must be a well-formed UUID
 * before it reaches the database.
 */
export function validateMarkMilestoneAchieved(req: Request, res: Response, next: NextFunction) {
  const errors: string[] = [];

  if (!UUID_REGEX.test(req.params.milestoneId ?? '')) {
    errors.push('milestoneId must be a valid UUID.');
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const unknownKeys = Object.keys(body);
  if (unknownKeys.length > 0) {
    errors.push(`Unsupported field(s): ${unknownKeys.join(', ')}.`);
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}
