import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getProfileForRole, updateProfileForRole } from '../services/profileService';
import { getSettingsForRole, upsertSettingsForRole } from '../services/settingsService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

// Only the fields EditHospitalProfileModal.tsx actually collects — the same
// whitelist updateProfileForRole('hospital', ...) already enforces at the
// SQL level (COALESCE over this exact column set). Facility identity fields
// (facilityName, facilityType, licenseNumber, tagline, accreditations, ...)
// are managed by MaaSuraksha, not self-editable — same convention as
// doctor_profiles' specialization/qualification.
const EDITABLE_PROFILE_FIELDS = ['address', 'city', 'state', 'postalCode', 'contactNumber', 'totalBeds'];

function pickEditableProfileFields(body: Record<string, unknown>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of EDITABLE_PROFILE_FIELDS) {
    if (body[key] !== undefined) patch[key] = body[key];
  }
  return patch;
}

/**
 * Flattens the hospital's users row (name/email/phone) together with its
 * hospital_profiles row into one object — mirrors what getCurrentUser()
 * already assembles for /auth/me, just shaped flat instead of nested under
 * `profile` so the frontend's existing HospitalProfile-shaped mapping can
 * read every field directly.
 */
async function loadHospitalProfileView(userId: string): Promise<Record<string, unknown> | null> {
  const userResult = await pool.query<{ name: string; email: string; phone: string | null }>(
    'SELECT name, email, phone FROM users WHERE id = $1',
    [userId]
  );
  const profile = await getProfileForRole(userId, 'hospital');
  if (!userResult.rows[0] || !profile) return null;
  return { ...userResult.rows[0], ...profile };
}

export async function getMyHospitalProfile(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const profile = await loadHospitalProfileView(req.user.id);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Hospital profile not found for this account.' });
      return;
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    logger.error('Fetch hospital profile failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch hospital profile.' });
  }
}

export async function updateMyHospitalProfile(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const patch = pickEditableProfileFields((req.body ?? {}) as Record<string, unknown>);
    const updated = await updateProfileForRole(pool, req.user.id, 'hospital', patch);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Hospital profile not found for this account.' });
      return;
    }
    const profile = await loadHospitalProfileView(req.user.id);
    res.status(200).json({ success: true, profile });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Update hospital profile failed', error);
    res.status(500).json({ success: false, message: 'Unable to update hospital profile.' });
  }
}

export async function getMyHospitalSettings(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const settings = await getSettingsForRole(req.user.id, 'hospital');
    res.status(200).json({ success: true, settings });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch hospital settings failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch hospital settings.' });
  }
}

export async function updateMyHospitalSettings(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const settings = await upsertSettingsForRole(req.user.id, 'hospital', (req.body ?? {}) as Record<string, unknown>);
    res.status(200).json({ success: true, settings });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Update hospital settings failed', error);
    res.status(500).json({ success: false, message: 'Unable to update hospital settings.' });
  }
}
