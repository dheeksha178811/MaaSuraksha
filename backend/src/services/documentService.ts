import path from 'path';
import { pool } from '../config/db';
import { AuthError } from './authService';

export interface DocumentReportRow {
  document_id: string;
  patient_id: string;
  patient_name: string;
  child_id: string | null;
  child_name: string | null;
  name: string;
  category: string | null;
  doc_date: string | null;
  status: string | null;
  description: string | null;
  file_size: string | null;
  file_type: string | null;
  file_url: string | null;
  doctor_name: string | null;
  hospital_name: string | null;
}

// Same projection/join shape as doctorService.ts's listMyReports (read for
// the uploading doctor) — kept in this file too so an uploaded row can be
// returned to the client immediately, in exactly the same Report shape,
// without a second round trip.
const REPORT_ROW_SELECT = `
  SELECT
    d.id AS document_id, pcr.id AS patient_id, u.name AS patient_name,
    pcr.child_id, cp.name AS child_name,
    d.name, d.category, d.doc_date, d.status, d.description,
    d.file_size, d.file_type, d.file_url,
    doc_u.name AS doctor_name, hp.facility_name AS hospital_name
  FROM documents d
  JOIN patient_care_records pcr ON pcr.id = d.patient_care_record_id
  JOIN users u ON u.id = pcr.mother_id
  JOIN users doc_u ON doc_u.id = pcr.doctor_id
  LEFT JOIN child_profiles cp ON cp.id = pcr.child_id
  LEFT JOIN hospital_profiles hp ON hp.id = d.hospital_id
`;

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXTENSION_LABELS: Record<string, string> = {
  '.pdf': 'PDF',
  '.jpg': 'IMAGE',
  '.jpeg': 'IMAGE',
  '.png': 'IMAGE',
  '.gif': 'IMAGE',
  '.webp': 'IMAGE',
  '.doc': 'DOCUMENT',
  '.docx': 'DOCUMENT',
};

export interface UploadedReportFile {
  path: string;
  size: number;
  originalname: string;
}

export interface UploadReportInput {
  name: string;
  category: string;
  file: UploadedReportFile;
}

/**
 * Doctor uploads a report for one of her own patients. patientCareRecordId
 * is a patient_care_records id (the same "patientId" doctorService.ts's
 * getPatientByIdForDoctor/listConsultationNotesForPatient already use) —
 * ownership is verified by requiring doctor_id = $2 AND is_active = true on
 * that row, exactly like those two, so mother_id/child_id/hospital_id for
 * the new document are all derived server-side from a row this doctor
 * actually owns, never accepted from the client.
 *
 * file.path is this process's local disk path under backend/uploads/documents
 * (see middleware/uploadReportFile.ts). No HTTP route serves it back yet —
 * that's a real, reported limitation, not a bug — so file_url stores a
 * server-relative path (uploads/documents/<generated-name>) as internal
 * storage metadata only, not a browser-reachable URL.
 */
export async function uploadDocumentForPatient(
  doctorId: string,
  patientCareRecordId: string,
  input: UploadReportInput
): Promise<DocumentReportRow> {
  const ownership = await pool.query<{ mother_id: string; child_id: string | null; hospital_id: string }>(
    `SELECT mother_id, child_id, hospital_id FROM patient_care_records WHERE id = $1 AND doctor_id = $2 AND is_active = true`,
    [patientCareRecordId, doctorId]
  );
  const assignment = ownership.rows[0];
  if (!assignment) {
    throw new AuthError('Patient not found for this account.', 404);
  }

  const ext = path.extname(input.file.originalname).toLowerCase();
  const fileType = EXTENSION_LABELS[ext] ?? 'OTHER';
  const fileSize = formatFileSize(input.file.size);
  const fileUrl = path.relative(path.join(__dirname, '../..'), input.file.path).split(path.sep).join('/');

  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO documents (
       mother_id, child_id, patient_care_record_id, uploaded_by_user_id, hospital_id,
       name, category, doc_date, status, file_size, file_type, file_url
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, 'COMPLETED', $8, $9, $10)
     RETURNING id`,
    [
      assignment.mother_id,
      assignment.child_id,
      patientCareRecordId,
      doctorId,
      assignment.hospital_id,
      input.name,
      input.category,
      fileSize,
      fileType,
      fileUrl,
    ]
  );

  const row = await pool.query<DocumentReportRow>(`${REPORT_ROW_SELECT} WHERE d.id = $1`, [inserted.rows[0].id]);
  return row.rows[0];
}

export interface MotherDocumentRow {
  id: string;
  name: string;
  category: string | null;
  doc_date: string | null;
  status: string | null;
  description: string | null;
  file_size: string | null;
  file_type: string | null;
  file_url: string | null;
  doctor_name: string | null;
  hospital_name: string | null;
}

/**
 * documents.mother_id has a FK to mother_profiles(id), so an orphan user
 * (JWT role=mother but no mother_profiles row) can never legitimately own a
 * document — same 404 convention used throughout this backend
 * (vaccinationService.ts, appointmentService.ts).
 */
async function assertMotherProfileExists(motherId: string): Promise<void> {
  const result = await pool.query('SELECT 1 FROM mother_profiles WHERE id = $1', [motherId]);
  if (result.rowCount === 0) {
    throw new AuthError('Profile not found for this account.', 404);
  }
}

/**
 * A mother's own documents — scoped directly by documents.mother_id (never
 * by anything client-supplied). doctor_name/hospital_name are resolved the
 * same way doctorService.ts's listMyReports resolves them for the doctor
 * side of this same table, via patient_care_records; LEFT JOINed (not
 * JOINed) so a document survives in her list even if its
 * patient_care_record_id ever stops resolving to an active assignment.
 */
export async function listDocumentsForMother(motherId: string): Promise<MotherDocumentRow[]> {
  await assertMotherProfileExists(motherId);

  const result = await pool.query<MotherDocumentRow>(
    `SELECT
       d.id, d.name, d.category, d.doc_date, d.status, d.description,
       d.file_size, d.file_type, d.file_url,
       doc_u.name AS doctor_name, hp.facility_name AS hospital_name
     FROM documents d
     LEFT JOIN patient_care_records pcr ON pcr.id = d.patient_care_record_id
     LEFT JOIN users doc_u ON doc_u.id = pcr.doctor_id
     LEFT JOIN hospital_profiles hp ON hp.id = COALESCE(d.hospital_id, pcr.hospital_id)
     WHERE d.mother_id = $1
     ORDER BY d.doc_date DESC NULLS LAST, d.created_at DESC`,
    [motherId]
  );
  return result.rows;
}
