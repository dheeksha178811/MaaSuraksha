import { PoolClient } from 'pg';
import { pool } from '../config/db';
import { AuthError } from './authService';

export type SettingsPatch = Record<string, unknown>;
export type SettingsRow = Record<string, unknown>;

/**
 * Every *_settings table has no default row created at registration (unlike
 * *_profiles, which registerUser creates atomically) — so "no settings row
 * yet" is normal, expected state for every account, not an error. Only a
 * missing *_profiles row (an orphan user — see Part 1) is treated as 404
 * here, matching the convention already established for /api/auth/me and
 * the emergency-contact endpoints.
 */
async function assertProfileExists(role: string, userId: string): Promise<void> {
  let result;
  switch (role) {
    case 'mother':
      result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [userId]);
      break;
    case 'doctor':
      result = await pool.query('SELECT 1 FROM doctor_profiles WHERE id = $1', [userId]);
      break;
    case 'hospital':
      result = await pool.query('SELECT 1 FROM hospital_profiles WHERE id = $1', [userId]);
      break;
    case 'admin':
      result = await pool.query('SELECT 1 FROM admin_profiles WHERE id = $1', [userId]);
      break;
    default:
      throw new AuthError('Unsupported role.', 400);
  }
  if ((result.rowCount ?? 0) === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

async function lockProfileRow(client: PoolClient, role: string, userId: string): Promise<boolean> {
  let result;
  switch (role) {
    case 'mother':
      result = await client.query('SELECT id FROM mother_profiles WHERE id = $1 FOR UPDATE', [userId]);
      break;
    case 'doctor':
      result = await client.query('SELECT id FROM doctor_profiles WHERE id = $1 FOR UPDATE', [userId]);
      break;
    case 'hospital':
      result = await client.query('SELECT id FROM hospital_profiles WHERE id = $1 FOR UPDATE', [userId]);
      break;
    case 'admin':
      result = await client.query('SELECT id FROM admin_profiles WHERE id = $1 FOR UPDATE', [userId]);
      break;
    default:
      return false;
  }
  return (result.rowCount ?? 0) > 0;
}

function toJsonParam(value: unknown): string | null {
  return value !== undefined ? JSON.stringify(value) : null;
}

// --- Reads -------------------------------------------------------------

async function getMotherSettingsRow(motherId: string): Promise<SettingsRow | null> {
  const result = await pool.query(
    `SELECT mother_id, language, notifications, reminders, privacy
     FROM mother_settings WHERE mother_id = $1`,
    [motherId]
  );
  return result.rows[0] ?? null;
}

async function getDoctorSettingsRow(doctorId: string): Promise<SettingsRow | null> {
  const result = await pool.query(
    `SELECT doctor_id, notifications, communication, workspace, availability, privacy
     FROM doctor_settings WHERE doctor_id = $1`,
    [doctorId]
  );
  return result.rows[0] ?? null;
}

async function getHospitalSettingsRow(hospitalId: string): Promise<SettingsRow | null> {
  const result = await pool.query(
    `SELECT hospital_id, facility, notifications, operational, privacy
     FROM hospital_settings WHERE hospital_id = $1`,
    [hospitalId]
  );
  return result.rows[0] ?? null;
}

async function getAdminSettingsRow(adminId: string): Promise<SettingsRow | null> {
  const result = await pool.query(
    `SELECT admin_id, notifications, program, privacy
     FROM admin_settings WHERE admin_id = $1`,
    [adminId]
  );
  return result.rows[0] ?? null;
}

export async function getSettingsForRole(userId: string, role: string): Promise<SettingsRow | null> {
  await assertProfileExists(role, userId);

  switch (role) {
    case 'mother':
      return getMotherSettingsRow(userId);
    case 'doctor':
      return getDoctorSettingsRow(userId);
    case 'hospital':
      return getHospitalSettingsRow(userId);
    case 'admin':
      return getAdminSettingsRow(userId);
    default:
      return null;
  }
}

// --- Upserts -------------------------------------------------------------
// Each is UPDATE-with-COALESCE (omitted sections keep their stored value)
// then INSERT-if-absent, matching the partial-update convention from Part 2
// and the upsert convention from Part 4's emergency contact.

async function upsertMotherSettings(client: PoolClient, motherId: string, patch: SettingsPatch): Promise<SettingsRow> {
  const language = typeof patch.language === 'string' ? patch.language : null;
  const notifications = toJsonParam(patch.notifications);
  const reminders = toJsonParam(patch.reminders);
  const privacy = toJsonParam(patch.privacy);

  const updated = await client.query(
    `UPDATE mother_settings
     SET language = COALESCE($2, language),
         notifications = COALESCE($3, notifications),
         reminders = COALESCE($4, reminders),
         privacy = COALESCE($5, privacy)
     WHERE mother_id = $1
     RETURNING mother_id, language, notifications, reminders, privacy`,
    [motherId, language, notifications, reminders, privacy]
  );
  if (updated.rows[0]) return updated.rows[0];

  const inserted = await client.query(
    `INSERT INTO mother_settings (mother_id, language, notifications, reminders, privacy)
     VALUES ($1, COALESCE($2, 'en'), $3, $4, $5)
     RETURNING mother_id, language, notifications, reminders, privacy`,
    [motherId, language, notifications, reminders, privacy]
  );
  return inserted.rows[0];
}

async function upsertDoctorSettings(client: PoolClient, doctorId: string, patch: SettingsPatch): Promise<SettingsRow> {
  const notifications = toJsonParam(patch.notifications);
  const communication = toJsonParam(patch.communication);
  const workspace = toJsonParam(patch.workspace);
  const availability = toJsonParam(patch.availability);
  const privacy = toJsonParam(patch.privacy);

  const updated = await client.query(
    `UPDATE doctor_settings
     SET notifications = COALESCE($2, notifications),
         communication = COALESCE($3, communication),
         workspace = COALESCE($4, workspace),
         availability = COALESCE($5, availability),
         privacy = COALESCE($6, privacy)
     WHERE doctor_id = $1
     RETURNING doctor_id, notifications, communication, workspace, availability, privacy`,
    [doctorId, notifications, communication, workspace, availability, privacy]
  );
  if (updated.rows[0]) return updated.rows[0];

  const inserted = await client.query(
    `INSERT INTO doctor_settings (doctor_id, notifications, communication, workspace, availability, privacy)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING doctor_id, notifications, communication, workspace, availability, privacy`,
    [doctorId, notifications, communication, workspace, availability, privacy]
  );
  return inserted.rows[0];
}

async function upsertHospitalSettings(client: PoolClient, hospitalId: string, patch: SettingsPatch): Promise<SettingsRow> {
  const facility = toJsonParam(patch.facility);
  const notifications = toJsonParam(patch.notifications);
  const operational = toJsonParam(patch.operational);
  const privacy = toJsonParam(patch.privacy);

  const updated = await client.query(
    `UPDATE hospital_settings
     SET facility = COALESCE($2, facility),
         notifications = COALESCE($3, notifications),
         operational = COALESCE($4, operational),
         privacy = COALESCE($5, privacy)
     WHERE hospital_id = $1
     RETURNING hospital_id, facility, notifications, operational, privacy`,
    [hospitalId, facility, notifications, operational, privacy]
  );
  if (updated.rows[0]) return updated.rows[0];

  const inserted = await client.query(
    `INSERT INTO hospital_settings (hospital_id, facility, notifications, operational, privacy)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING hospital_id, facility, notifications, operational, privacy`,
    [hospitalId, facility, notifications, operational, privacy]
  );
  return inserted.rows[0];
}

async function upsertAdminSettings(client: PoolClient, adminId: string, patch: SettingsPatch): Promise<SettingsRow> {
  const notifications = toJsonParam(patch.notifications);
  const program = toJsonParam(patch.program);
  const privacy = toJsonParam(patch.privacy);

  const updated = await client.query(
    `UPDATE admin_settings
     SET notifications = COALESCE($2, notifications),
         program = COALESCE($3, program),
         privacy = COALESCE($4, privacy)
     WHERE admin_id = $1
     RETURNING admin_id, notifications, program, privacy`,
    [adminId, notifications, program, privacy]
  );
  if (updated.rows[0]) return updated.rows[0];

  const inserted = await client.query(
    `INSERT INTO admin_settings (admin_id, notifications, program, privacy)
     VALUES ($1, $2, $3, $4)
     RETURNING admin_id, notifications, program, privacy`,
    [adminId, notifications, program, privacy]
  );
  return inserted.rows[0];
}

/**
 * Wrapped in a transaction with a row lock on the caller's own *_profiles
 * row (same technique as Part 4's emergency-contact upsert): it serializes
 * concurrent saves for the same account so two requests can't both see "no
 * settings row" and each insert one, and it doubles as the orphan-user
 * existence check, turning what would otherwise be a bare FK violation into
 * the same 404 used everywhere else for that state.
 */
export async function upsertSettingsForRole(
  userId: string,
  role: string,
  patch: SettingsPatch
): Promise<SettingsRow> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const exists = await lockProfileRow(client, role, userId);
    if (!exists) {
      throw new AuthError('Profile not found for this account.', 404);
    }

    let row: SettingsRow;
    switch (role) {
      case 'mother':
        row = await upsertMotherSettings(client, userId, patch);
        break;
      case 'doctor':
        row = await upsertDoctorSettings(client, userId, patch);
        break;
      case 'hospital':
        row = await upsertHospitalSettings(client, userId, patch);
        break;
      case 'admin':
        row = await upsertAdminSettings(client, userId, patch);
        break;
      default:
        throw new AuthError('Unsupported role.', 400);
    }

    await client.query('COMMIT');
    return row;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
