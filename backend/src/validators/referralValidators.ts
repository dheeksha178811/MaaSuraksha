import { Request, Response, NextFunction } from 'express';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRIORITIES = ['ROUTINE', 'URGENT', 'EMERGENCY'];
const CREATE_KEYS = ['mother_id', 'to_hospital_id', 'reason', 'priority', 'clinical_summary'];
const REASON_MAX = 1000;
const SUMMARY_MAX = 4000;
const REJECTION_MAX = 1000;

function fail(res: Response, errors: string[]) {
  res.status(400).json({ success: false, message: 'Validation failed.', errors });
}

const isText = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;

/**
 * The client names only the patient (a lookup key, re-verified against the
 * caller's active care assignment), the destination, and the clinical content.
 * Anything else — notably from_hospital_id, referring_doctor_id, status — is
 * rejected outright rather than silently ignored, so it can never be mistaken
 * for something the server trusts.
 */
export function validateCreateReferral(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  const unknown = Object.keys(body).filter((k) => !CREATE_KEYS.includes(k));
  if (unknown.length) errors.push(`Unexpected field(s): ${unknown.join(', ')}.`);

  if (typeof body.mother_id !== 'string' || !UUID_REGEX.test(body.mother_id)) errors.push('mother_id must be a valid UUID.');
  if (typeof body.to_hospital_id !== 'string' || !UUID_REGEX.test(body.to_hospital_id)) errors.push('to_hospital_id must be a valid UUID.');
  if (!isText(body.reason, REASON_MAX)) errors.push(`reason is required (max ${REASON_MAX} characters).`);
  if (typeof body.priority !== 'string' || !PRIORITIES.includes(body.priority)) errors.push(`priority must be one of: ${PRIORITIES.join(', ')}.`);
  if (!isText(body.clinical_summary, SUMMARY_MAX)) errors.push(`clinical_summary is required (max ${SUMMARY_MAX} characters).`);

  if (errors.length) return fail(res, errors);

  req.body = {
    mother_id: body.mother_id,
    to_hospital_id: body.to_hospital_id,
    reason: (body.reason as string).trim(),
    priority: body.priority,
    clinical_summary: (body.clinical_summary as string).trim(),
  };
  next();
}

export function validateRejectReferral(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  if (!isText(body.rejection_reason, REJECTION_MAX)) {
    return fail(res, [`rejection_reason is required (max ${REJECTION_MAX} characters).`]);
  }
  req.body = { rejection_reason: (body.rejection_reason as string).trim() };
  next();
}

export function validateReferralIdParam(req: Request, res: Response, next: NextFunction) {
  if (!UUID_REGEX.test(req.params.id ?? '')) {
    res.status(404).json({ success: false, message: 'Referral not found.' });
    return;
  }
  next();
}
