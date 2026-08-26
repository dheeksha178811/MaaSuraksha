import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

// Local-disk storage for uploaded report files (documents.file_url) — the
// smallest safe localhost-compatible solution, since the project has no
// existing file-upload infrastructure (no multer, no cloud storage SDK) to
// reuse. Files land under backend/uploads/documents, outside src/ and
// gitignored, mirroring dist/ and node_modules/ (build/runtime output, not
// source). There is currently no HTTP route that serves these files back —
// see documentService.ts's comment on file_url — so this only proves and
// persists genuine binary storage, not an end-to-end download.
const UPLOAD_DIR = path.join(__dirname, '../../uploads/documents');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Conservative allowlist for the medical-report use case (scans, lab PDFs,
// prescriptions) — the upload modal's file input has no `accept` attribute
// today (unrestricted in the UI), but accepting arbitrary binaries straight
// to disk with no filter at all is an avoidable risk now that this is a real
// upload path rather than a mock one.
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.doc', '.docx']);
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error(`Unsupported file type "${ext || 'unknown'}". Allowed types: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}.`));
      return;
    }
    cb(null, true);
  },
}).single('file');

/**
 * Wraps multer's callback-style middleware so its errors (oversized file,
 * disallowed extension, malformed multipart body) reach the client as a
 * normal 400 JSON response instead of falling through to the generic 500
 * errorHandler.
 */
export function uploadReportFile(req: Request, res: Response, next: NextFunction) {
  upload(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    const message = err instanceof multer.MulterError ? err.message : err instanceof Error ? err.message : 'File upload failed.';
    res.status(400).json({ success: false, message });
  });
}
