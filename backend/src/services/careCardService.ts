import crypto from 'crypto';
import { pool } from '../config/db';
import { AuthError } from './authService';

// ---------------------------------------------------------------------------
// care_cards row shape (migration 002 + migration 007 extension)
// ---------------------------------------------------------------------------
export interface CareCardRow {
  id: string;
  mother_id: string;
  maa_suraksha_id: string;
  qr_token: string;
  issued_date: string | null;
  valid_through: string | null;
  is_active: boolean;
  created_at: string;
}

// What the mother's own endpoint returns — includes the qr_token so the
// frontend can encode it into the QR code without embedding any PHI.
export interface MotherCareCardResponse {
  cardId: string;
  motherId: string;
  maaSurakshaId: string;
  qrToken: string;
  issuedDate: string | null;
  validThrough: string | null;
  isActive: boolean;
}

// What the doctor/hospital scan endpoint returns after verifying the token
// and the active patient_care_records relationship. Contains only the
// identity and care-assignment fields a clinician needs at the point of
// care — no full medical record, no raw DB ids.
export interface QrScanResult {
  maaSurakshaId: string;
  motherName: string;
  bloodGroup: string | null;
  stage: string | null;
  location: string | null;
  issuedDate: string | null;
  validThrough: string | null;
  emergencyContactName: string | null;
  emergencyContactRelation: string | null;
  emergencyContactPhone: string | null;
  assignedDoctorName: string | null;
  assignedHospitalName: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateQrToken(): string {
  // 32 cryptographically random bytes → 64-char lowercase hex string.
  // Cannot be derived from maa_suraksha_id, mother_id, or any other field.
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a deterministic MaaSuraksha ID from a date and a 6-digit padded
 * counter derived from the care_cards primary key. Format: MS-KA-YYYY-XXXXXX.
 * The state abbreviation is fixed to 'KA' in this phase; extending to a
 * real state field is additive (no schema change needed here).
 */
// Arbitrary fixed key for pg_advisory_xact_lock — serializes MaaSuraksha ID
// allocation across concurrent care-card creations (see getOrCreateMyCareCard).
const MAA_SURAKSHA_ID_LOCK_KEY = 7_007_001;

const ACTIVE_CARD_SELECT = `
  SELECT id, mother_id, maa_suraksha_id, qr_token, issued_date, valid_through, is_active, created_at
    FROM care_cards
   WHERE mother_id = $1 AND is_active = true
   ORDER BY created_at DESC
   LIMIT 1`;

function buildMaaSurakshaId(date: Date, rowIndex: number): string {
  const year = date.getFullYear();
  const seq = String(rowIndex % 1_000_000).padStart(6, '0');
  return `MS-KA-${year}-${seq}`;
}

async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

// ---------------------------------------------------------------------------
// Mother-side: get (or create on first access) the care card
// ---------------------------------------------------------------------------

/**
 * Returns the active care_cards row for this mother, creating one if it does
 * not yet exist. Creation is idempotent: no UNIQUE constraint on
 * care_cards.mother_id exists (migration 002), so the existing-card check is
 * repeated inside the advisory-locked transaction below — concurrent first
 * requests for the same mother serialize there and only the first inserts.
 *
 * The qr_token is generated here with crypto.randomBytes so it is always
 * unguessable and not stored anywhere in plaintext outside the DB row.
 */
export async function getOrCreateMyCareCard(motherId: string): Promise<MotherCareCardResponse> {
  await assertMotherProfileExists(motherId);

  // Fast path: an existing active card is returned without taking the lock.
  // Not authoritative on its own — re-checked under the lock below.
  const existing = await pool.query<CareCardRow>(ACTIVE_CARD_SELECT, [motherId]);

  if (existing.rows[0]) {
    return toMotherCareCardResponse(existing.rows[0]);
  }

  // No active card — create one.
  const now = new Date();
  const validThrough = new Date(now);
  validThrough.setFullYear(validThrough.getFullYear() + 3);

  const qrToken = generateQrToken();

  // The human-readable ID's counter is allocated under a transaction-scoped
  // advisory lock, so concurrent card creations serialize here: each one
  // reads the highest counter only after the previous insert has committed.
  // The counter is MAX(existing suffix) + 1 rather than COUNT(*) + 1, since
  // care_cards rows are removed by ON DELETE CASCADE from mother_profiles and
  // a shrinking count would re-issue an ID that is still in use. The lock is
  // released automatically on COMMIT/ROLLBACK.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [MAA_SURAKSHA_ID_LOCK_KEY]);

    // Authoritative re-check: a concurrent request for this same mother may
    // have created her card while this one waited for the lock.
    const lockedExisting = await client.query<CareCardRow>(ACTIVE_CARD_SELECT, [motherId]);
    if (lockedExisting.rows[0]) {
      await client.query('COMMIT');
      return toMotherCareCardResponse(lockedExisting.rows[0]);
    }

    const maxResult = await client.query<{ max_seq: number | null }>(
      `SELECT MAX(substring(maa_suraksha_id FROM '^MS-KA-[0-9]{4}-([0-9]{6})$')::int) AS max_seq
         FROM care_cards`
    );
    const rowIndex = (maxResult.rows[0].max_seq ?? 0) + 1;
    const maaSurakshaId = buildMaaSurakshaId(now, rowIndex);

    const result = await client.query<CareCardRow>(
      `INSERT INTO care_cards (mother_id, maa_suraksha_id, qr_token, issued_date, valid_through, is_active)
            VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, mother_id, maa_suraksha_id, qr_token, issued_date, valid_through, is_active, created_at`,
      [
        motherId,
        maaSurakshaId,
        qrToken,
        now.toISOString().slice(0, 10),
        validThrough.toISOString().slice(0, 10),
      ]
    );

    await client.query('COMMIT');
    return toMotherCareCardResponse(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function toMotherCareCardResponse(row: CareCardRow): MotherCareCardResponse {
  return {
    cardId: row.id,
    motherId: row.mother_id,
    maaSurakshaId: row.maa_suraksha_id,
    qrToken: row.qr_token,
    issuedDate: row.issued_date,
    validThrough: row.valid_through,
    isActive: row.is_active,
  };
}

// ---------------------------------------------------------------------------
// Doctor / Hospital scan: resolve a qr_token to safe identity + care info
// ---------------------------------------------------------------------------

/**
 * Resolves a qr_token to a QrScanResult for an authenticated clinician
 * (doctor or hospital). The authorization check mirrors the pattern used by
 * doctorService.getPatientByIdForDoctor and doctorService.listMyPatients:
 * the clinician must have an active patient_care_records row linking them to
 * the mother whose card this token belongs to. A token that exists but has no
 * matching PCR for this clinician returns null (same as "not found") — no
 * information is leaked about whether the token exists at all.
 *
 * scannerId is the users.id of the authenticated doctor or hospital user.
 * scannerRole is 'doctor' | 'hospital', used to pick the correct FK column
 * in patient_care_records (doctor_id vs hospital_id).
 */
export async function lookupByQrToken(
  qrToken: string,
  scannerId: string,
  scannerRole: 'doctor' | 'hospital'
): Promise<QrScanResult | null> {
  // Step 1: resolve the token to a mother_id via care_cards.
  const cardResult = await pool.query<{ mother_id: string; maa_suraksha_id: string; issued_date: string | null; valid_through: string | null }>(
    `SELECT mother_id, maa_suraksha_id, issued_date, valid_through
       FROM care_cards
      WHERE qr_token = $1 AND is_active = true`,
    [qrToken]
  );
  const card = cardResult.rows[0];
  if (!card) return null;

  // Step 2: verify the clinician has an active care assignment to this mother.
  // The FK column differs by role; both are indexed in patient_care_records.
  const pcrColumn = scannerRole === 'doctor' ? 'doctor_id' : 'hospital_id';
  const pcrResult = await pool.query(
    `SELECT 1 FROM patient_care_records
      WHERE mother_id = $1 AND ${pcrColumn} = $2 AND is_active = true
      LIMIT 1`,
    [card.mother_id, scannerId]
  );
  if (pcrResult.rowCount === 0) return null;

  // Step 3: fetch the minimal safe identity payload — no full medical record,
  // no raw patient IDs, no documents. Same join pattern as
  // doctorService.listMyPatients.
  const infoResult = await pool.query<{
    mother_name: string;
    blood_group: string | null;
    stage: string | null;
    location: string | null;
    ec_name: string | null;
    ec_relation: string | null;
    ec_phone: string | null;
    doctor_name: string | null;
    hospital_name: string | null;
  }>(
    `SELECT
         u.name                        AS mother_name,
         mp.blood_group,
         mp.stage,
         mp.location,
         ec.name                       AS ec_name,
         ec.relation                   AS ec_relation,
         ec.phone                      AS ec_phone,
         doc_u.name                    AS doctor_name,
         hp.facility_name              AS hospital_name
       FROM mother_profiles mp
       JOIN users u  ON u.id  = mp.id
       LEFT JOIN emergency_contacts ec
              ON ec.mother_id = mp.id AND ec.is_primary = true
       LEFT JOIN patient_care_records pcr
              ON pcr.mother_id = mp.id AND pcr.is_active = true
       LEFT JOIN users doc_u ON doc_u.id  = pcr.doctor_id
       LEFT JOIN hospital_profiles hp ON hp.id = pcr.hospital_id
      WHERE mp.id = $1
      LIMIT 1`,
    [card.mother_id]
  );
  const info = infoResult.rows[0];
  if (!info) return null;

  return {
    maaSurakshaId: card.maa_suraksha_id,
    motherName: info.mother_name,
    bloodGroup: info.blood_group,
    stage: info.stage,
    location: info.location,
    issuedDate: card.issued_date,
    validThrough: card.valid_through,
    emergencyContactName: info.ec_name,
    emergencyContactRelation: info.ec_relation,
    emergencyContactPhone: info.ec_phone,
    assignedDoctorName: info.doctor_name,
    assignedHospitalName: info.hospital_name,
  };
}
