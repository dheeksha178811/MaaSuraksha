import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/utils/cn';
import { DoctorNotification } from '@/types';
import { DOCTOR_NOTIFICATIONS_NOW_ISO } from '@/data/doctorNotificationsMockData';
import { formatClinicalTimestamp } from '@/pages/doctor/doctorUi';
import {
  DOCTOR_NOTIFICATION_ACTION_LABELS,
  DOCTOR_NOTIFICATION_TYPE_LABELS,
  getDoctorNotificationBadgeVariant,
  getDoctorNotificationIcon,
} from '@/pages/doctor/doctorNotificationsUi';

export interface DoctorNotificationCardProps {
  notification: DoctorNotification;
  onMarkRead: (id: string) => void;
}

export const DoctorNotificationCard: React.FC<DoctorNotificationCardProps> = ({ notification, onMarkRead }) => {
  const navigate = useNavigate();
  const Icon = getDoctorNotificationIcon(notification.type);
  const isUrgent = notification.priority === 'urgent';

  const handleAction = () => {
    onMarkRead(notification.id);
    if (notification.actionUrl) navigate(notification.actionUrl);
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
          'relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
          isUrgent ? 'bg-white text-rose-600 border-rose-200' : 'bg-white text-sandal-700 border-sandal-100'
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
          <Badge variant={getDoctorNotificationBadgeVariant(notification.type)} size="sm">
            {DOCTOR_NOTIFICATION_TYPE_LABELS[notification.type]}
          </Badge>
        </div>
        <p className="text-xs text-warm-muted leading-relaxed">{notification.description}</p>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <span className="text-[11px] text-sandal-600/80 font-medium">
            {formatClinicalTimestamp(notification.timestamp, DOCTOR_NOTIFICATIONS_NOW_ISO)}
          </span>
          {notification.actionUrl && (
            <button
              onClick={handleAction}
              className="text-xs font-semibold text-sandal-700 hover:underline flex items-center gap-0.5 shrink-0"
            >
              {DOCTOR_NOTIFICATION_ACTION_LABELS[notification.type]}
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
          onClick={() => onMarkRead(notification.id)}
        >
          <Check className="w-4 h-4" />
        </IconButton>
      )}
    </Card>
  );
};
