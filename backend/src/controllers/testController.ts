import { Request, Response } from 'express';

// Verification-only endpoints for the auth middleware (Part 3). Not real
// domain APIs — kept under /api/test so they're obviously scaffolding.

export function getMe(req: Request, res: Response) {
  res.json({ success: true, message: 'Authenticated.', user: req.user });
}

export function motherOnlyPing(req: Request, res: Response) {
  res.json({ success: true, message: 'Mother-only endpoint reached.', user: req.user });
}

export function doctorOnlyPing(req: Request, res: Response) {
  res.json({ success: true, message: 'Doctor-only endpoint reached.', user: req.user });
}
