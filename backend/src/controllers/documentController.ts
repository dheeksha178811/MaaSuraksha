import { Request, Response } from 'express';
import { DocumentDownloadRole, getDocumentDownloadForUser } from '../services/documentService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

function roleOf(req: Request): DocumentDownloadRole | null {
  const role = req.user?.role;
  return role === 'doctor' || role === 'mother' ? role : null;
}

export async function downloadDocument(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }
  const role = roleOf(req);
  if (!role) {
    res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });
    return;
  }

  try {
    const file = await getDocumentDownloadForUser(req.user.id, role, req.params.documentId);
    // root + relative path (rather than one absolute path) keeps the actual
    // send confined to the uploads folder as well.
    res.download(
      file.relativePath,
      file.downloadName,
      {
        root: file.directory,
        cacheControl: false,
        headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
      },
      (err) => {
        if (!err) return;
        logger.error('Send document file failed', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Unable to download document.' });
        }
      }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Download document failed', error);
    res.status(500).json({ success: false, message: 'Unable to download document.' });
  }
}
