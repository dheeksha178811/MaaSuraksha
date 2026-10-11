import { useEffect, useSyncExternalStore } from 'react';
import {
  AppNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notificationService';
import { TOKEN_STORAGE_KEY } from '@/services/authApi';

// One shared, module-level notification store so the header bell and the
// Mother / Doctor notification pages always show the same list and unread
// count. State is whatever GET /api/notifications last returned for the
// signed-in user; read state is persisted by the backend, never kept only in
// a component. Polls every 30s while at least one component is subscribed,
// and is reset whenever the signed-in session (JWT) changes.

export type NotificationsState =
  | { status: 'loading'; notifications: AppNotification[]; unreadCount: number }
  | { status: 'error'; message: string; notifications: AppNotification[]; unreadCount: number }
  | { status: 'ready'; notifications: AppNotification[]; unreadCount: number };

const POLL_MS = 30000;
const LOADING: NotificationsState = { status: 'loading', notifications: [], unreadCount: 0 };

let state: NotificationsState = LOADING;
let sessionToken: string | null = null;
let subscribers = 0;
let timer: ReturnType<typeof setInterval> | undefined;
let requestSeq = 0;
const listeners = new Set<() => void>();

function set(next: NotificationsState) {
  state = next;
  listeners.forEach((l) => l());
}

const currentToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

// A different login (or logout) must never see the previous user's data.
function resetIfSessionChanged() {
  const token = currentToken();
  if (token !== sessionToken) {
    sessionToken = token;
    requestSeq++;
    set(LOADING);
  }
}

export async function refreshNotifications(): Promise<void> {
  resetIfSessionChanged();
  const seq = ++requestSeq;
  try {
    const inbox = await getNotifications();
    if (seq === requestSeq) set({ status: 'ready', ...inbox });
  } catch (e) {
    if (seq !== requestSeq) return;
    const message = e instanceof Error && e.message ? e.message : 'Unable to load notifications.';
    set({ status: 'error', message, notifications: state.notifications, unreadCount: state.unreadCount });
  }
}

export async function markRead(id: string): Promise<void> {
  const res = await markNotificationRead(id);
  if (state.status === 'ready' || state.notifications.length > 0) {
    set({
      status: 'ready',
      unreadCount: res.unreadCount,
      notifications: state.notifications.map((n) => (n.id === id ? res.notification : n)),
    });
  }
}

export async function markAllRead(): Promise<void> {
  try {
    await markAllNotificationsRead();
  } finally {
    await refreshNotifications();
  }
}

/** Current store contents (also used by tests outside React). */
export const getNotificationsSnapshot = (): NotificationsState => state;

function subscribe(listener: () => void) {
  listeners.add(listener);
  subscribers++;
  if (subscribers === 1) {
    timer = setInterval(() => void refreshNotifications(), POLL_MS);
  }
  return () => {
    listeners.delete(listener);
    subscribers--;
    if (subscribers === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export function useNotifications(): NotificationsState & { reload: () => Promise<void> } {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  // Fetch (and session-check) on mount of every consumer.
  useEffect(() => {
    void refreshNotifications();
  }, []);
  return { ...snapshot, reload: refreshNotifications };
}
