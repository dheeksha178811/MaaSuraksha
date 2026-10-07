import { Request, Response } from 'express';
import {
  Requester,
  approveConsentRequest,
  createConsentRequest,
  denyConsentRequest,
  getApprovedDataForRequester,
  getCurrentRequestForToken,
  getRequestForRequester,
  listRequestsForMother,
  parseSections,
} from '../services/consentService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Wraps a handler with the shared auth/error handling. Identity and role come
// only from the verified JWT (authenticate + requireRole run before this).
function handle(label: string, fn: (req: Request, res: Response, userId: string) => Promise<void>) {
  return async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication token is required.' });
      return;
    }
    res.setHeader('Cache-Control', 'private, no-store');
    try {
      await fn(req, res, req.user.id);
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.status).json({ success: false, message: error.message });
        return;
      }
      logger.error(`${label} failed`, error);
      res.status(500).json({ success: false, message: 'Unable to process access request.' });
    }
  };
}

function requesterOf(req: Request): Requester {
  return { id: req.user!.id, role: req.user!.role as 'doctor' | 'hospital' };
}

function idParam(req: Request): string {
  const id = req.params.requestId;
  if (!UUID_REGEX.test(id ?? '')) throw new AuthError('Access request not found.', 404);
  return id;
}

function tokenFromBody(req: Request): string {
  const token = req.body?.token;
  if (typeof token !== 'string' || token.length !== 64 || !/^[0-9a-f]+$/.test(token)) {
    throw new AuthError('Invalid QR token format.', 400);
  }
  return token;
}

// --- Doctor / hospital -------------------------------------------------------

// POST /api/consent/requests  { token, sections: string[] }
export const createRequest = handle('Create consent request', async (req, res) => {
  const request = await createConsentRequest(requesterOf(req), tokenFromBody(req), parseSections(req.body?.sections));
  res.status(201).json({ success: true, request });
});

// POST /api/consent/requests/current  { token } — token in body, like /qr/scan
export const getCurrentRequest = handle('Fetch current consent request', async (req, res) => {
  const request = await getCurrentRequestForToken(requesterOf(req), tokenFromBody(req));
  res.status(200).json({ success: true, request });
});

// GET /api/consent/requests/:requestId
export const getRequestStatus = handle('Fetch consent request', async (req, res) => {
  const request = await getRequestForRequester(requesterOf(req), idParam(req));
  res.status(200).json({ success: true, request });
});

// GET /api/consent/requests/:requestId/data — re-checked on every call
export const getRequestData = handle('Fetch consented data', async (req, res) => {
  const result = await getApprovedDataForRequester(requesterOf(req), idParam(req));
  res.status(200).json({ success: true, ...result });
});

// --- Mother ------------------------------------------------------------------

// GET /api/consent/mother/requests
export const listMyRequests = handle('List access requests', async (_req, res, userId) => {
  res.status(200).json({ success: true, requests: await listRequestsForMother(userId) });
});

// POST /api/consent/mother/requests/:requestId/approve
export const approveRequest = handle('Approve access request', async (req, res, userId) => {
  res.status(200).json({ success: true, request: await approveConsentRequest(userId, idParam(req)) });
});

// POST /api/consent/mother/requests/:requestId/deny
export const denyRequest = handle('Deny access request', async (req, res, userId) => {
  res.status(200).json({ success: true, request: await denyConsentRequest(userId, idParam(req)) });
});
