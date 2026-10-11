import { Request, Response } from 'express';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notificationService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The recipient is always the authenticated user from the JWT.
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
      res.status(500).json({ success: false, message: 'Unable to process notification request.' });
    }
  };
}

// GET /api/notifications
export const list = handle('List notifications', async (_req, res, userId) => {
  res.status(200).json({ success: true, ...(await listNotifications(userId)) });
});

// POST /api/notifications/:id/read
export const markRead = handle('Mark notification read', async (req, res, userId) => {
  if (!UUID_REGEX.test(req.params.id ?? '')) throw new AuthError('Notification not found.', 404);
  const notification = await markNotificationRead(userId, req.params.id);
  const { unreadCount } = await listNotifications(userId);
  res.status(200).json({ success: true, notification, unreadCount });
});

// POST /api/notifications/read-all
export const markAllRead = handle('Mark all notifications read', async (_req, res, userId) => {
  const updated = await markAllNotificationsRead(userId);
  res.status(200).json({ success: true, updated, unreadCount: 0 });
});
