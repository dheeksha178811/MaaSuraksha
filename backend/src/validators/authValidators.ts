import { Request, Response, NextFunction } from 'express';
import { validateProfileByRole } from './profileValidators';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['mother', 'doctor', 'hospital', 'admin'];
const MIN_PASSWORD_LENGTH = 8;

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { email, password, role, phone, profile } = req.body ?? {};
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email is required.');
  }
  if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (!role || typeof role !== 'string' || !VALID_ROLES.includes(role)) {
    errors.push(`Role must be one of: ${VALID_ROLES.join(', ')}.`);
  }
  if (phone !== undefined && phone !== null && typeof phone !== 'string') {
    errors.push('Phone must be a string.');
  }
  if (profile !== undefined && (typeof profile !== 'object' || profile === null || Array.isArray(profile))) {
    errors.push('profile must be an object.');
  }

  // Only validate profile fields once the role itself is known to be valid —
  // otherwise we'd be validating against the wrong shape.
  if (role && typeof role === 'string' && VALID_ROLES.includes(role)) {
    errors.push(...validateProfileByRole(role, profile));
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body ?? {};
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email is required.');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}
