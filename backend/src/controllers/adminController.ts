import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getProfileForRole, updateProfileForRole } from '../services/profileService';
import { getSettingsForRole, upsertSettingsForRole } from '../services/settingsService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

// Only the fields admin_profiles actually exposes for self-editing — matches
// updateProfileForRole('admin', ...)'s own whitelist in profileService.ts
// (COALESCE over exactly this column set).
const EDITABLE_PROFILE_FIELDS = ['title', 'jurisdictionLevel'];

function pickEditableProfileFields(body: Record<string, unknown>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of EDITABLE_PROFILE_FIELDS) {
    if (body[key] !== undefined) patch[key] = body[key];
  }
  return patch;
}

/**
 * Flattens the admin's users row (name/email/phone) together with its
 * admin_profiles row into one object — mirrors what getCurrentUser()
 * already assembles for /auth/me (same pattern used for
 * loadHospitalProfileView in hospitalController.ts), just shaped flat
 * instead of nested under `profile`.
 */
async function loadAdminProfileView(userId: string): Promise<Record<string, unknown> | null> {
  const userResult = await pool.query<{ name: string; email: string; phone: string | null }>(
    'SELECT name, email, phone FROM users WHERE id = $1',
    [userId]
  );
  const profile = await getProfileForRole(userId, 'admin');
  if (!userResult.rows[0] || !profile) return null;
  return { ...userResult.rows[0], ...profile };
}

export async function getMyAdminProfile(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const profile = await loadAdminProfileView(req.user.id);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Admin profile not found for this account.' });
      return;
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    logger.error('Fetch admin profile failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch admin profile.' });
  }
}

export async function updateMyAdminProfile(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const patch = pickEditableProfileFields((req.body ?? {}) as Record<string, unknown>);
    const updated = await updateProfileForRole(pool, req.user.id, 'admin', patch);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Admin profile not found for this account.' });
      return;
    }
    const profile = await loadAdminProfileView(req.user.id);
    res.status(200).json({ success: true, profile });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Update admin profile failed', error);
    res.status(500).json({ success: false, message: 'Unable to update admin profile.' });
  }
}

export async function getMyAdminSettings(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const settings = await getSettingsForRole(req.user.id, 'admin');
    res.status(200).json({ success: true, settings });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch admin settings failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch admin settings.' });
  }
}

export async function updateMyAdminSettings(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const settings = await upsertSettingsForRole(req.user.id, 'admin', (req.body ?? {}) as Record<string, unknown>);
    res.status(200).json({ success: true, settings });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Update admin settings failed', error);
    res.status(500).json({ success: false, message: 'Unable to update admin settings.' });
  }
}
