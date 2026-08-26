import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const CATEGORIES = ['ULTRASOUND', 'BLOOD_TEST', 'PRESCRIPTION', 'OTHER'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_KEYS = ['name', 'category'];

/**
 * Runs after uploadReportFile (multer) has already parsed the multipart
 * body, so req.body holds the text fields and req.file holds the file.
 * Mirrors UploadReportModal.tsx's own client-side rule ("Please provide a
 * report title and select a file") — title, category, and a file are all
 * required. doctorId/motherId/hospitalId/patientId are never accepted here;
 * :patientId in the URL is only ever used as an ownership lookup key in
 * documentService.ts, never trusted as an authority source on its own.
 *
 * multer has already written req.file to disk by the time this runs (it
 * parses the whole multipart body before any downstream middleware sees
 * it) — a request this validator rejects would otherwise leave that file
 * orphaned with no documents row ever pointing at it, so a failing check
 * removes it first.
 */
export function validateUploadReport(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const errors: string[] = [];

  if (!UUID_REGEX.test(req.params.patientId ?? '')) {
    errors.push('patientId must be a valid UUID.');
  }

  const unknownKeys = Object.keys(body).filter((key) => !ALLOWED_KEYS.includes(key));
  if (unknownKeys.length > 0) {
    errors.push(`Unsupported field(s): ${unknownKeys.join(', ')}.`);
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('name is required.');
  }
  if (!body.category || typeof body.category !== 'string' || !CATEGORIES.includes(body.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}.`);
  }
  if (!req.file) {
    errors.push('file is required.');
  }

  if (errors.length > 0) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) logger.error('Failed to remove orphaned upload after validation failure', err);
      });
    }
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  next();
}
