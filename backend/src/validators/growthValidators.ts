import { Request, Response, NextFunction } from 'express';

const RECIPIENT_TYPES = ['MOTHER', 'CHILD'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_KEYS = ['recipientType', 'childId', 'date', 'weightKg', 'heightCm', 'headCircumferenceCm', 'notes'];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isISODateString(value: unknown): boolean {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/**
 * Mirrors LogMeasurementModal.tsx's own client-side rule exactly: a date is
 * always required, and at least one of weight/height/head-circumference
 * must be present — nothing here is an invented business rule.
 */
export function validateLogGrowthMeasurement(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  const unknownKeys = Object.keys(body).filter((key) => !ALLOWED_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    errors.push(`Unsupported field(s): ${unknownKeys.join(', ')}.`);
  }

  if (!body.recipientType || typeof body.recipientType !== 'string' || !RECIPIENT_TYPES.includes(body.recipientType)) {
    errors.push(`recipientType must be one of: ${RECIPIENT_TYPES.join(', ')}.`);
  }

  if (!body.date || !isISODateString(body.date)) {
    errors.push('date is required and must be a valid date.');
  }

  const hasWeight = body.weightKg !== undefined && body.weightKg !== null;
  const hasHeight = body.heightCm !== undefined && body.heightCm !== null;
  const hasHeadCirc = body.headCircumferenceCm !== undefined && body.headCircumferenceCm !== null;

  if (!hasWeight && !hasHeight && !hasHeadCirc) {
    errors.push('At least one of weightKg, heightCm, or headCircumferenceCm is required.');
  }
  if (hasWeight && (!isFiniteNumber(body.weightKg) || (body.weightKg as number) <= 0 || (body.weightKg as number) > 300)) {
    errors.push('weightKg must be a number between 0 and 300.');
  }
  if (hasHeight && (!isFiniteNumber(body.heightCm) || (body.heightCm as number) <= 0 || (body.heightCm as number) > 250)) {
    errors.push('heightCm must be a number between 0 and 250.');
  }
  if (
    hasHeadCirc &&
    (!isFiniteNumber(body.headCircumferenceCm) || (body.headCircumferenceCm as number) <= 0 || (body.headCircumferenceCm as number) > 100)
  ) {
    errors.push('headCircumferenceCm must be a number between 0 and 100.');
  }

  if (body.recipientType === 'CHILD') {
    if (!body.childId || typeof body.childId !== 'string' || !UUID_REGEX.test(body.childId)) {
      errors.push('childId is required and must be a valid UUID when recipientType is CHILD.');
    }
  } else if (body.recipientType === 'MOTHER' && body.childId !== undefined) {
    errors.push('childId must not be provided when recipientType is MOTHER.');
  }

  if (hasHeadCirc && body.recipientType === 'MOTHER') {
    errors.push('headCircumferenceCm is only applicable when recipientType is CHILD.');
  }

  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== 'string') {
    errors.push('notes must be a string.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}
