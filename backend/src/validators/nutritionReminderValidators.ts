import { Request, Response, NextFunction } from 'express';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Toggling a reminder takes no request body — it always flips the current
 * value server-side (matching ReminderRow.tsx's `!enabled` logic exactly),
 * never a client-supplied on/off value — so any body key at all is
 * unsupported, and the :reminderId path param must be a well-formed UUID
 * before it reaches the database.
 */
export function validateToggleNutritionReminder(req: Request, res: Response, next: NextFunction) {
  const errors: string[] = [];

  if (!UUID_REGEX.test(req.params.reminderId ?? '')) {
    errors.push('reminderId must be a valid UUID.');
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
