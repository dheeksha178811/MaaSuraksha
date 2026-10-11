// ---------------------------------------------------------------------------
// Real backend client for in-app notifications (/api/notifications).
// The backend scopes every call to the signed-in user (from the JWT); no user
// id is ever sent. Needs the real JWT — there is no mock fallback.
// ---------------------------------------------------------------------------

import { API_BASE_URL, AuthApiError, AuthNetworkError, TOKEN_STORAGE_KEY } from '@/services/authApi';

export class NotificationApiError extends AuthApiError {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export interface AppNotification {
  id: string;
  type: string;
  title: string | null;
  message: string | null;
  priority: 'normal' | 'urgent';
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export interface NotificationInbox {
  notifications: AppNotification[];
  unreadCount: number;
}

async function request(method: 'GET' | 'POST', path: string): Promise<Record<string, any>> {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    throw new NotificationApiError('Sign in with your real account to see notifications.', 401);
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/notifications${path}`, { method, headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new AuthNetworkError('Unable to reach the MaaSuraksha server. Please make sure the backend is running.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new NotificationApiError(typeof body.message === 'string' ? body.message : `Request failed with status ${res.status}.`, res.status);
  }
  return body;
}

export async function getNotifications(): Promise<NotificationInbox> {
  const body = await request('GET', '');
  return { notifications: body.notifications, unreadCount: body.unreadCount };
}

export async function markNotificationRead(id: string): Promise<{ notification: AppNotification; unreadCount: number }> {
  const body = await request('POST', `/${id}/read`);
  return { notification: body.notification, unreadCount: body.unreadCount };
}

export async function markAllNotificationsRead(): Promise<void> {
  await request('POST', '/read-all');
}

// An action_url is only followed when it is a plain in-app path ("/hospital/referrals").
const SAFE_APP_PATH = /^\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/;
export function getSafeActionPath(url: string | null): string | null {
  return url && url.length <= 100 && SAFE_APP_PATH.test(url) ? url : null;
}
