import { Request, Response, NextFunction } from 'express';

const CATEGORIES = ['ANTENATAL_CHECKUP', 'ULTRASOUND_SCAN', 'LAB_TEST', 'POSTNATAL_CHECKUP', 'PEDIATRIC_CHECKUP', 'VACCINATION'];
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_KEYS = ['category', 'reason', 'preferredDate', 'preferredTime'];
const RESCHEDULE_ALLOWED_KEYS = ['newDate', 'newTime'];

function isISODateString(value: unknown): boolean {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/**
 * Mirrors RequestAppointmentModal.tsx's own client-side rule exactly:
 * category, a preferred date, a preferred time, and a reason are all
 * required — nothing here is an invented business rule. doctorId/
 * hospitalId/status are never accepted (not in the whitelist at all) since
 * the modal never collects them and the service derives them server-side.
 */
export function validateRequestAppointment(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  const unknownKeys = Object.keys(body).filter((key) => !ALLOWED_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    errors.push(`Unsupported field(s): ${unknownKeys.join(', ')}.`);
  }

  if (!body.category || typeof body.category !== 'string' || !CATEGORIES.includes(body.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}.`);
  }
  if (!body.reason || typeof body.reason !== 'string' || body.reason.trim().length === 0) {
    errors.push('reason is required.');
  }
  if (!body.preferredDate || !isISODateString(body.preferredDate)) {
    errors.push('preferredDate is required and must be a valid date.');
  }
  if (!body.preferredTime || typeof body.preferredTime !== 'string' || !TIME_REGEX.test(body.preferredTime)) {
    errors.push('preferredTime is required and must be in HH:MM 24-hour format.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}

/**
 * Cancelling takes no request body — status always becomes 'cancelled'
 * server-side, matching CancelAppointmentModal.tsx's confirm-only flow (no
 * form fields at all) — so any body key is unsupported, and the
 * :appointmentId path param must be a well-formed UUID before it reaches
 * the database.
 */
export function validateCancelAppointment(req: Request, res: Response, next: NextFunction) {
  const errors: string[] = [];

  if (!UUID_REGEX.test(req.params.appointmentId ?? '')) {
    errors.push('appointmentId must be a valid UUID.');
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

/**
 * Mirrors RescheduleAppointmentModal.tsx's own client-side rule exactly: a
 * new date and a new time are both required. doctorId/hospitalId/status are
 * never accepted (not in the whitelist) since the service derives the
 * status transition itself.
 */
export function validateRescheduleAppointment(req: Request, res: Response, next: NextFunction) {
  const errors: string[] = [];

  if (!UUID_REGEX.test(req.params.appointmentId ?? '')) {
    errors.push('appointmentId must be a valid UUID.');
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const unknownKeys = Object.keys(body).filter((key) => !RESCHEDULE_ALLOWED_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    errors.push(`Unsupported field(s): ${unknownKeys.join(', ')}.`);
  }

  if (!body.newDate || !isISODateString(body.newDate)) {
    errors.push('newDate is required and must be a valid date.');
  }
  if (!body.newTime || typeof body.newTime !== 'string' || !TIME_REGEX.test(body.newTime)) {
    errors.push('newTime is required and must be in HH:MM 24-hour format.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}
