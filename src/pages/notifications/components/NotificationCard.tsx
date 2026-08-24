import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/utils/cn';
import { NotificationItem } from '@/types';
import { getNotificationBadgeVariant, getNotificationIcon } from '../notificationsUi';
import { NOTIFICATION_TYPE_LABELS } from '@/data/motherNotificationsMockData';

export interface NotificationCardProps {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onMarkRead }) => {
  const Icon = getNotificationIcon(notification.type);

  return (
    <Card
      padding="md"
      className={cn(
        'flex items-start gap-3 transition-colors',
        !notification.isRead && 'bg-peach-verySoft/40 border-sandal-200'
      )}
    >
      <div className="relative w-10 h-10 rounded-xl bg-white text-sandal-700 border border-sandal-100 flex items-center justify-center shrink-0">
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
          <Badge variant={getNotificationBadgeVariant(notification.type)} size="sm">
            {NOTIFICATION_TYPE_LABELS[notification.type]}
          </Badge>
        </div>
        <p className="text-xs text-warm-muted leading-relaxed">{notification.message}</p>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <span className="text-[11px] text-sandal-600/80 font-medium">{notification.timestamp}</span>
          {notification.actionUrl && (
            <Link
              to={notification.actionUrl}
              onClick={() => onMarkRead(notification.id)}
              className="text-xs font-semibold text-sandal-700 hover:underline flex items-center gap-0.5 shrink-0"
            >
              View details
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {!notification.isRead && (
        <IconButton
          aria-label="Mark as read"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => onMarkRead(notification.id)}
        >
          <Check className="w-4 h-4" />
        </IconButton>
      )}
    </Card>
  );
};
