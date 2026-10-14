import { Request, Response, NextFunction } from 'express';
import { WARNING_SIGN_CODES } from '../services/maternalRiskRules';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOTE_MAX = 500;
const FLAG_KEY_MAX = 200;
export const ANALYTICS_WEEK_OPTIONS = [4, 8, 12, 26];

function fail(res: Response, errors: string[]) {
  res.status(400).json({ success: false, message: 'Validation failed.', errors });
}

const optionalNote = (v: unknown): v is string | undefined | null =>
  v === undefined || v === null || (typeof v === 'string' && v.trim().length <= NOTE_MAX);
const noteOrNull = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

function rejectUnknown(body: Record<string, unknown>, allowed: string[], errors: string[]) {
  const unknown = Object.keys(body).filter((k) => !allowed.includes(k));
  if (unknown.length) errors.push(`Unexpected field(s): ${unknown.join(', ')}.`);
}

export function validatePatientIdParam(req: Request, res: Response, next: NextFunction) {
  if (!UUID_REGEX.test(req.params.patientId)) return fail(res, ['patientId must be a valid UUID.']);
  next();
}

export function validateAnalyticsQuery(req: Request, res: Response, next: NextFunction) {
  const raw = req.query.weeks;
  if (raw === undefined) {
    res.locals.weeks = 8;
    return next();
  }
  const weeks = typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : NaN;
  if (!ANALYTICS_WEEK_OPTIONS.includes(weeks)) {
    return fail(res, [`weeks must be one of: ${ANALYTICS_WEEK_OPTIONS.join(', ')}.`]);
  }
  res.locals.weeks = weeks;
  next();
}

export function validateRecordVital(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];
  rejectUnknown(body, ['systolic', 'diastolic', 'notes'], errors);

  const { systolic, diastolic } = body;
  const isInt = (v: unknown, min: number, max: number): v is number =>
    typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
  if (!isInt(systolic, 50, 300)) errors.push('systolic must be a whole number between 50 and 300 (mmHg).');
  if (!isInt(diastolic, 30, 200)) errors.push('diastolic must be a whole number between 30 and 200 (mmHg).');
  if (isInt(systolic, 50, 300) && isInt(diastolic, 30, 200) && systolic <= diastolic) {
    errors.push('systolic must be greater than diastolic.');
  }
  if (!optionalNote(body.notes)) errors.push(`notes must be text of at most ${NOTE_MAX} characters.`);
  if (errors.length) return fail(res, errors);

  req.body = { systolic, diastolic, notes: noteOrNull(body.notes) };
  next();
}

export function validateRecordWarningSign(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];
  rejectUnknown(body, ['signCode', 'notes'], errors);

  if (typeof body.signCode !== 'string' || !WARNING_SIGN_CODES.includes(body.signCode)) {
    errors.push(`signCode must be one of: ${WARNING_SIGN_CODES.join(', ')}.`);
  }
  if (!optionalNote(body.notes)) errors.push(`notes must be text of at most ${NOTE_MAX} characters.`);
  if (errors.length) return fail(res, errors);

  req.body = { signCode: body.signCode, notes: noteOrNull(body.notes) };
  next();
}

export function validateReviewFlag(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];
  rejectUnknown(body, ['flagKey', 'decision', 'note'], errors);

  if (typeof body.flagKey !== 'string' || !body.flagKey.trim() || body.flagKey.length > FLAG_KEY_MAX) {
    errors.push('flagKey is required.');
  }
  if (body.decision !== 'CONFIRMED' && body.decision !== 'DISMISSED') {
    errors.push('decision must be CONFIRMED or DISMISSED.');
  }
  if (!optionalNote(body.note)) errors.push(`note must be text of at most ${NOTE_MAX} characters.`);
  if (errors.length) return fail(res, errors);

  req.body = { flagKey: body.flagKey, decision: body.decision, note: noteOrNull(body.note) };
  next();
}
