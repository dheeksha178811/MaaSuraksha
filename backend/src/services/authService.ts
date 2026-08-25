import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Pool, PoolClient } from 'pg';
import { pool } from '../config/db';
import { signToken } from '../utils/jwt';
import { createProfileForRole, getProfileForRole, updateProfileForRole } from './profileService';
import { isPgError, PG_ERROR_CODES } from '../utils/dbErrors';

type Queryable = Pool | PoolClient;

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MINUTES = 30;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: string,
  phone: string | undefined,
  profile: Record<string, unknown>
): Promise<{ user: AuthUser; token: string; profile: unknown }> {
  const existing = await pool.query<{ id: string }>('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AuthError('An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // user + role profile are created in the same transaction: if the
    // profile insert fails for any reason, the user insert is rolled back
    // too, so a registration attempt can never leave an orphan user row.
    const userResult = await client.query<UserRow>(
      `INSERT INTO users (email, password_hash, name, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, password_hash, phone, role, avatar_url, is_active, created_at`,
      [email, passwordHash, name, role, phone ?? null]
    );
    const userRow = userResult.rows[0];

    const profileRow = await createProfileForRole(client, userRow.id, role, profile);

    await client.query('COMMIT');

    const user = toAuthUser(userRow);
    const token = signToken({ userId: user.id, role: user.role });

    return { user, token, profile: profileRow };
  } catch (error) {
    await client.query('ROLLBACK');

    if (isPgError(error)) {
      if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
        throw new AuthError(
          'A record with a duplicate unique value already exists (e.g. email or license number).',
          409
        );
      }
      if (error.code === PG_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
        throw new AuthError('The profile references a record that does not exist (e.g. hospitalId).', 400);
      }
      if (error.code === PG_ERROR_CODES.CHECK_VIOLATION || error.code === PG_ERROR_CODES.NOT_NULL_VIOLATION) {
        throw new AuthError('One or more profile fields failed a database validation rule.', 400);
      }
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, name, password_hash, phone, role, avatar_url, is_active, created_at
     FROM users WHERE email = $1`,
    [email]
  );

  const row = result.rows[0];
  if (!row || !row.is_active) {
    throw new AuthError('Invalid email or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, row.password_hash);
  if (!passwordMatches) {
    throw new AuthError('Invalid email or password.', 401);
  }

  const user = toAuthUser(row);
  const token = signToken({ userId: user.id, role: user.role });

  return { user, token };
}

export interface CurrentUser extends AuthUser {
  isActive: boolean;
  profile: Record<string, unknown>;
}

/**
 * Identity comes exclusively from the JWT-derived userId (req.user.id) —
 * callers must never accept a userId from request input for this lookup.
 */
export async function getCurrentUser(userId: string): Promise<CurrentUser> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, name, password_hash, phone, role, avatar_url, is_active, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  const row = result.rows[0];
  if (!row) {
    throw new AuthError('User not found.', 404);
  }

  const profile = await getProfileForRole(row.id, row.role);
  if (!profile) {
    throw new AuthError('Profile not found for this account.', 404);
  }

  return {
    ...toAuthUser(row),
    isActive: row.is_active,
    profile,
  };
}

export interface UpdateMePayload {
  phone?: string;
  email?: string;
  profile?: Record<string, unknown>;
}

function translateProfileUpdateError(error: unknown): never {
  if (isPgError(error)) {
    if (error.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
      throw new AuthError('A record with a duplicate unique value already exists (e.g. email).', 409);
    }
    if (error.code === PG_ERROR_CODES.CHECK_VIOLATION || error.code === PG_ERROR_CODES.NOT_NULL_VIOLATION) {
      throw new AuthError('One or more fields failed a database validation rule.', 400);
    }
  }
  throw error;
}

async function updateUserRow(
  executor: Queryable,
  userId: string,
  patch: { phone?: string; email?: string }
): Promise<UserRow | null> {
  const result = await executor.query<UserRow>(
    `UPDATE users
     SET phone = COALESCE($2, phone),
         email = COALESCE($3, email),
         updated_at = now()
     WHERE id = $1
     RETURNING id, email, name, password_hash, phone, role, avatar_url, is_active, created_at`,
    [userId, patch.phone ?? null, patch.email ?? null]
  );
  return result.rows[0] ?? null;
}

/**
 * Identity comes exclusively from (userId, role) resolved by the caller from
 * req.user — never from request body/query. A client can never change role
 * through this path: role is only ever read here, never written.
 *
 * Transaction behavior: only wraps users + profile updates in one
 * BEGIN/COMMIT/ROLLBACK when BOTH are being written in the same call, so
 * they can't partially succeed. A patch touching only one table skips the
 * transaction entirely.
 */
export async function updateCurrentUser(
  userId: string,
  role: string,
  patch: UpdateMePayload
): Promise<CurrentUser> {
  const hasUserFields = patch.phone !== undefined || patch.email !== undefined;
  const hasProfileFields = patch.profile !== undefined && Object.keys(patch.profile).length > 0;

  let userRow: UserRow | null;
  let profileRow: Record<string, unknown> | null;

  if (hasUserFields && hasProfileFields) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      userRow = await updateUserRow(client, userId, patch);
      if (!userRow) {
        throw new AuthError('User not found.', 404);
      }
      profileRow = await updateProfileForRole(client, userId, role, patch.profile!);
      if (!profileRow) {
        throw new AuthError('Profile not found for this account.', 404);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      translateProfileUpdateError(error);
    } finally {
      client.release();
    }
  } else if (hasUserFields) {
    try {
      userRow = await updateUserRow(pool, userId, patch);
    } catch (error) {
      translateProfileUpdateError(error);
    }
    if (!userRow) {
      throw new AuthError('User not found.', 404);
    }
    profileRow = await getProfileForRole(userId, role);
    if (!profileRow) {
      throw new AuthError('Profile not found for this account.', 404);
    }
  } else if (hasProfileFields) {
    try {
      profileRow = await updateProfileForRole(pool, userId, role, patch.profile!);
    } catch (error) {
      translateProfileUpdateError(error);
    }
    if (!profileRow) {
      throw new AuthError('Profile not found for this account.', 404);
    }
    const result = await pool.query<UserRow>(
      `SELECT id, email, name, password_hash, phone, role, avatar_url, is_active, created_at
       FROM users WHERE id = $1`,
      [userId]
    );
    userRow = result.rows[0] ?? null;
    if (!userRow) {
      throw new AuthError('User not found.', 404);
    }
  } else {
    throw new AuthError('No fields provided to update.', 400);
  }

  return {
    ...toAuthUser(userRow),
    isActive: userRow.is_active,
    profile: profileRow,
  };
}

export interface PasswordResetRequestResult {
  resetToken?: string;
  expiresAt?: string;
}

/**
 * Always succeeds from the caller's point of view — whether or not the email
 * matches an account is never observable from the return value alone. Only
 * the (dev-only) resetToken/expiresAt fields being present tells you a match
 * was found; the controller gates those behind NODE_ENV before responding.
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResult> {
  const rawToken = generateResetToken();
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  const result = await pool.query<{ id: string }>(
    `UPDATE users
     SET reset_token_hash = $1, reset_token_expires_at = $2, updated_at = now()
     WHERE email = $3 AND is_active = true
     RETURNING id`,
    [tokenHash, expiresAt.toISOString(), email]
  );

  if (result.rowCount === 0) {
    return {};
  }

  return { resetToken: rawToken, expiresAt: expiresAt.toISOString() };
}

/**
 * Single atomic UPDATE guarded by the token hash + expiry: this is what
 * makes the token single-use (it's cleared on success, so a reused token
 * hashes to a value that no longer matches any row) and makes expired /
 * unknown tokens fail the same way (zero rows affected).
 */
export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = hashResetToken(rawToken);
  const passwordHash = await hashPassword(newPassword);

  const result = await pool.query(
    `UPDATE users
     SET password_hash = $1, reset_token_hash = NULL, reset_token_expires_at = NULL, updated_at = now()
     WHERE reset_token_hash = $2 AND reset_token_expires_at > now()
     RETURNING id`,
    [passwordHash, tokenHash]
  );

  if (result.rowCount === 0) {
    throw new AuthError('Invalid or expired reset token.', 400);
  }
}

/**
 * Change password for an already-authenticated user (distinct from the
 * logged-out forgot/reset-password flow above). Any outstanding reset token
 * is cleared too, so an old reset link can't still work after the user
 * changes their password proactively.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const result = await pool.query<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = $1 AND is_active = true',
    [userId]
  );

  const row = result.rows[0];
  if (!row) {
    throw new AuthError('User not found.', 404);
  }

  const currentMatches = await bcrypt.compare(currentPassword, row.password_hash);
  if (!currentMatches) {
    throw new AuthError('Current password is incorrect.', 401);
  }

  const passwordHash = await hashPassword(newPassword);

  await pool.query(
    `UPDATE users
     SET password_hash = $1, reset_token_hash = NULL, reset_token_expires_at = NULL, updated_at = now()
     WHERE id = $2`,
    [passwordHash, userId]
  );
}
