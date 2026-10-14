import { Request, Response, NextFunction } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt';
import { pool } from '../config/db';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  let payload: { userId: string; role: string };
  try {
    payload = verifyToken(token);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Authentication token has expired.' });
      return;
    }
    res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    return;
  }

  // A valid signature is not enough: the account must still exist and be
  // active, so deactivating a user takes effect immediately instead of when
  // their token expires. The role comes from the database, not the token.
  try {
    const result = await pool.query<{ role: string; is_active: boolean }>(
      'SELECT role, is_active FROM users WHERE id = $1',
      [payload.userId]
    );
    const row = result.rows[0];
    if (!row || !row.is_active) {
      res.status(401).json({ success: false, message: 'Invalid authentication token.' });
      return;
    }
    req.user = { id: payload.userId, role: row.role };
    next();
  } catch (error) {
    logger.error('Authentication lookup failed', error);
    res.status(500).json({ success: false, message: 'Unable to verify authentication.' });
  }
}
