import { Request, Response, NextFunction } from 'express';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateConversationIdParam(req: Request, res: Response, next: NextFunction) {
  if (!UUID_REGEX.test(req.params.conversationId ?? '')) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: ['conversationId must be a valid UUID.'] });
    return;
  }
  next();
}

/**
 * Mirrors MessageComposer.tsx's own client-side rule: only non-empty text is
 * ever sent. sender_user_id/sender_role are never accepted (not in the
 * whitelist at all) since the controller derives them from the verified JWT.
 */
export function validateSendMessage(req: Request, res: Response, next: NextFunction) {
  const errors: string[] = [];

  if (!UUID_REGEX.test(req.params.conversationId ?? '')) {
    errors.push('conversationId must be a valid UUID.');
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const unknownKeys = Object.keys(body).filter((key) => key !== 'text');
  if (unknownKeys.length > 0) {
    errors.push(`Unsupported field(s): ${unknownKeys.join(', ')}.`);
  }
  if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
    errors.push('text is required.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}

/**
 * motherId is only meaningful (and only read) when a doctor calls this route
 * — a mother's own conversation is always resolved server-side from her
 * active care assignment, so any motherId she sends is simply ignored by the
 * service, never trusted as her identity.
 */
export function validateStartConversation(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  const unknownKeys = Object.keys(body).filter((key) => key !== 'motherId');
  if (unknownKeys.length > 0) {
    errors.push(`Unsupported field(s): ${unknownKeys.join(', ')}.`);
  }
  if (body.motherId !== undefined && (typeof body.motherId !== 'string' || !UUID_REGEX.test(body.motherId))) {
    errors.push('motherId must be a valid UUID when provided.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}
