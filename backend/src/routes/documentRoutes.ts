import { Router } from 'express';
import { downloadDocument } from '../controllers/documentController';
import { validateDocumentIdParam } from '../validators/documentValidators';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/:documentId/download', authenticate, requireRole('doctor', 'mother'), validateDocumentIdParam, downloadDocument);

export default router;
