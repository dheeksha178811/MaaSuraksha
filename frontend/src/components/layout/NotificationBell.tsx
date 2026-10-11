import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRightLeft, Bell, CheckCheck, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { UserRole } from '@/types';
import { AppNotification, getSafeActionPath } from '@/services/notificationService';
import { markAllRead, markRead, useNotifications } from '@/hooks/useNotifications';
import { formatDateTime } from '@/utils/dateTime';
import { cn } from '@/utils/cn';

// Header bell backed by the shared notification store (GET /api/notifications),
// the same one the Mother / Doctor notification pages use, so the list and
// unread count always agree. Read state is persisted server-side.

const iconFor = (type: string) =>
  type.startsWith('CONSENT') ? ShieldCheck : type.startsWith('REFERRAL') ? ArrowRightLeft : Bell;

export const NotificationBell: React.FC<{ role: UserRole }> = ({ role }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const inbox = useNotifications();

  const unread = inbox.unreadCount;

  const toggle = () => {
    if (!open) void inbox.reload();
    setOpen(!open);
  };

  const handleOpenNotification = async (n: AppNotification) => {
    if (!n.isRead) {
      try {
        await markRead(n.id);
      } catch {
        // Navigating still works; the next refresh shows the real state.
      }
    }
    const path = getSafeActionPath(n.actionUrl);
    if (path) {
      setOpen(false);
      navigate(path);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
    } catch {
      // The store re-reads from the server either way.
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label="View notifications"
        className="relative p-2 rounded-xl text-warm-muted hover:text-sandal-900 hover:bg-warm-cream focus:outline-none focus:ring-2 focus:ring-sandal-300 cursor-pointer transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sandal-500 ring-2 ring-warm-ivory animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-warm-lg border border-sandal-100 ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-sandal-100">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-warm-brown">
                {role === 'doctor' ? 'Clinical Alerts' : role === 'mother' ? 'Care Notifications' : 'Notifications'}
              </span>
              <Badge variant="sandal" size="sm">{unread} New</Badge>
            </div>
            <button onClick={() => setOpen(false)} className="text-xs text-sandal-600 hover:underline">
              Close
            </button>
          </div>

          {inbox.status === 'loading' && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-warm-muted">
              <span className="w-4 h-4 rounded-full border-2 border-sandal-200 border-t-sandal-600 animate-spin" />
              Loading notifications…
            </div>
          )}

          {inbox.status === 'error' && inbox.notifications.length === 0 && (
            <div className="py-5 text-center space-y-2">
              <p className="flex items-center justify-center gap-1.5 text-xs text-rose-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {inbox.message}
              </p>
              <button onClick={() => void inbox.reload()} className="text-xs font-semibold text-sandal-700 hover:underline">
                Retry
              </button>
            </div>
          )}

          {inbox.status === 'ready' && inbox.notifications.length === 0 && (
            <p className="text-xs text-warm-muted text-center py-6">You are all caught up. No notifications yet.</p>
          )}

          {inbox.notifications.length > 0 && (
            <>
              <div className="py-2 space-y-2.5 max-h-72 overflow-y-auto">
                {inbox.notifications.map((n) => {
                  const Icon = iconFor(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => void handleOpenNotification(n)}
                      className={cn(
                        'w-full text-left p-2.5 rounded-xl border transition-colors',
                        n.isRead
                          ? 'bg-white border-sandal-100/50 hover:bg-warm-cream/50'
                          : 'bg-warm-cream/50 hover:bg-warm-cream border-sandal-200'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-peach-verySoft text-sandal-600 shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs text-warm-brown truncate', n.isRead ? 'font-medium' : 'font-semibold')}>
                            {n.title}
                            {n.priority === 'urgent' && !n.isRead && <span className="ml-1.5 text-[10px] font-semibold text-rose-600">URGENT</span>}
                          </p>
                          <p className="text-[11px] text-warm-muted leading-relaxed mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-sandal-600/80 font-medium block mt-1">{formatDateTime(n.createdAt)}</span>
                        </div>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-sandal-500 shrink-0 mt-1.5" aria-label="Unread" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {unread > 0 && (
                <div className="pt-2 border-t border-sandal-100 text-center">
                  <button
                    onClick={() => void handleMarkAll()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sandal-700 hover:underline"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all as read
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
