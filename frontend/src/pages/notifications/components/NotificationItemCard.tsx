import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Bell, Check, ChevronRight, LucideIcon, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/utils/cn';
import { AppNotification, getSafeActionPath } from '@/services/notificationService';
import { markRead } from '@/hooks/useNotifications';
import { formatDateTime } from '@/utils/dateTime';

// Card for one real notification, shared by the Mother and Doctor pages
// (same styling as the cards these pages used with mock data).

export const NOTIFICATION_KIND_LABELS = { CONSENT: 'Access Request', REFERRAL: 'Referral' } as const;
export type NotificationKind = keyof typeof NOTIFICATION_KIND_LABELS | 'OTHER';

export const kindOf = (type: string): NotificationKind =>
  type.startsWith('CONSENT') ? 'CONSENT' : type.startsWith('REFERRAL') ? 'REFERRAL' : 'OTHER';

const ICONS: Record<NotificationKind, LucideIcon> = { CONSENT: ShieldCheck, REFERRAL: ArrowRightLeft, OTHER: Bell };

const ACTION_LABELS: Record<string, string> = {
  CONSENT_REQUESTED: 'Review Request',
  CONSENT_APPROVED: 'Open Scanner',
  CONSENT_DENIED: 'Open Scanner',
};

export const NotificationItemCard: React.FC<{ notification: AppNotification; onError: (message: string) => void }> = ({
  notification,
  onError,
}) => {
  const navigate = useNavigate();
  const kind = kindOf(notification.type);
  const Icon = ICONS[kind];
  const isUrgent = notification.priority === 'urgent';
  const actionPath = getSafeActionPath(notification.actionUrl);

  const markAsRead = async () => {
    try {
      await markRead(notification.id);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Unable to update the notification.');
    }
  };

  const handleAction = async () => {
    if (!notification.isRead) await markAsRead();
    if (actionPath) navigate(actionPath);
  };

  return (
    <Card
      padding="md"
      className={cn(
        'flex items-start gap-3 transition-colors',
        !notification.isRead && (isUrgent ? 'bg-rose-50/50 border-rose-200' : 'bg-peach-verySoft/40 border-sandal-200')
      )}
    >
      <div
        className={cn(
          'relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-white',
          isUrgent ? 'text-rose-600 border-rose-200' : 'text-sandal-700 border-sandal-100'
        )}
      >
        <Icon className="w-5 h-5" />
        {!notification.isRead && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-sandal-500 ring-2 ring-warm-ivory" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className={cn('text-sm text-warm-brown', notification.isRead ? 'font-medium' : 'font-semibold')}>
            {notification.title}
          </h4>
          {kind !== 'OTHER' && (
            <Badge variant={kind === 'CONSENT' ? 'sandal' : 'peach'} size="sm">
              {NOTIFICATION_KIND_LABELS[kind]}
            </Badge>
          )}
          {isUrgent && !notification.isRead && <Badge variant="danger" size="sm">Urgent</Badge>}
        </div>
        <p className="text-xs text-warm-muted leading-relaxed">{notification.message}</p>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <span className="text-[11px] text-sandal-600/80 font-medium">{formatDateTime(notification.createdAt)}</span>
          {actionPath && (
            <button
              onClick={() => void handleAction()}
              className="text-xs font-semibold text-sandal-700 hover:underline flex items-center gap-0.5 shrink-0"
            >
              {ACTION_LABELS[notification.type] ?? 'View details'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!notification.isRead && (
        <IconButton
          aria-label="Mark as read"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => void markAsRead()}
        >
          <Check className="w-4 h-4" />
        </IconButton>
      )}
    </Card>
  );
};
