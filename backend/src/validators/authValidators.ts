import { Request, Response, NextFunction } from 'express';
import { validateProfileByRole, validateProfileUpdateByRole } from './profileValidators';

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

export function validateForgotPassword(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body ?? {};
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email is required.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}

export function validateChangePassword(req: Request, res: Response, next: NextFunction) {
  const { currentPassword, newPassword } = req.body ?? {};
  const errors: string[] = [];

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push('currentPassword is required.');
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.push(`newPassword must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (
    typeof currentPassword === 'string' &&
    typeof newPassword === 'string' &&
    currentPassword === newPassword
  ) {
    errors.push('newPassword must be different from currentPassword.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}

const UPDATE_ME_ALLOWED_KEYS = ['phone', 'email', 'profile'];

/**
 * Runs after `authenticate` in the route chain, so req.user is already set —
 * that lets us validate the role-specific profile fields here too (via
 * validateProfileUpdateByRole), using the role from the JWT/DB rather than
 * anything the client could supply. Top-level keys are whitelisted rather
 * than blacklisted, so protected fields (role, id, password_hash, is_active,
 * reset_token_hash, reset_token_expires_at, created_at, userId, ...) are
 * rejected by construction, not by name-checking each one.
 */
export function validateUpdateMe(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  const unknownKeys = Object.keys(body).filter((key) => !UPDATE_ME_ALLOWED_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    errors.push(`Unsupported field(s): ${unknownKeys.join(', ')}.`);
  }

  if (body.phone !== undefined && typeof body.phone !== 'string') {
    errors.push('phone must be a string.');
  }
  if (body.email !== undefined && (typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email))) {
    errors.push('A valid email is required.');
  }
  if (body.profile !== undefined && (typeof body.profile !== 'object' || body.profile === null || Array.isArray(body.profile))) {
    errors.push('profile must be an object.');
  }

  const isProfileObject = typeof body.profile === 'object' && body.profile !== null && !Array.isArray(body.profile);
  const profileKeyCount = isProfileObject ? Object.keys(body.profile as Record<string, unknown>).length : 0;
  const hasAnyUpdate = body.phone !== undefined || body.email !== undefined || profileKeyCount > 0;
  if (!hasAnyUpdate) {
    errors.push('At least one field (phone, email, or profile) must be provided.');
  }

  if (req.user && isProfileObject) {
    errors.push(...validateProfileUpdateByRole(req.user.role, body.profile));
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}

const EMERGENCY_CONTACT_ALLOWED_KEYS = ['name', 'relation', 'phone'];

export function validateEmergencyContact(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  const unknownKeys = Object.keys(body).filter((key) => !EMERGENCY_CONTACT_ALLOWED_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    errors.push(`Unsupported field(s): ${unknownKeys.join(', ')}.`);
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('name is required.');
  }
  if (!body.phone || typeof body.phone !== 'string' || body.phone.trim().length === 0) {
    errors.push('phone is required.');
  }
  if (body.relation !== undefined && body.relation !== null && typeof body.relation !== 'string') {
    errors.push('relation must be a string.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}

export function validateResetPassword(req: Request, res: Response, next: NextFunction) {
  const { resetToken, newPassword } = req.body ?? {};
  const errors: string[] = [];

  if (!resetToken || typeof resetToken !== 'string' || resetToken.trim().length === 0) {
    errors.push('resetToken is required.');
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.push(`newPassword must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}
