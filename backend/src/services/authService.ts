import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import { signToken } from '../utils/jwt';

const SALT_ROUNDS = 12;

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
  role: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface UserRow {
  id: string;
  email: string;
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
    role: row.role,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

export async function registerUser(
  email: string,
  password: string,
  role: string,
  phone?: string
): Promise<{ user: AuthUser; token: string }> {
  const existing = await pool.query<{ id: string }>('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AuthError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, password_hash, phone, role, avatar_url, is_active, created_at`,
    [email, passwordHash, role, phone ?? null]
  );

  const user = toAuthUser(result.rows[0]);
  const token = signToken({ userId: user.id, role: user.role });

  return { user, token };
}

export async function loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, phone, role, avatar_url, is_active, created_at
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
