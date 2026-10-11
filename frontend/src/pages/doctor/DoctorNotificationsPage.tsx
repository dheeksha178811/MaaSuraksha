import React, { useMemo, useState } from 'react';
import { AlertCircle, Bell, CheckCheck, Filter, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { markAllRead, useNotifications } from '@/hooks/useNotifications';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { NotificationItemCard, kindOf } from '@/pages/notifications/components/NotificationItemCard';

// Real notifications for the signed-in doctor (GET /api/notifications), sharing
// one store with the header bell. Only access-request responses are generated
// for doctors so far, so the filters cover what actually exists.

type DoctorNotificationFilter = 'ALL' | 'UNREAD' | 'ACCESS' | 'URGENT';

const FILTER_OPTIONS: { value: DoctorNotificationFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'ACCESS', label: 'Access Requests' },
  { value: 'URGENT', label: 'Urgent' },
];

export const DoctorNotificationsPage: React.FC = () => {
  const inbox = useNotifications();
  const [filter, setFilter] = useState<DoctorNotificationFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { notifications, unreadCount } = inbox;

  const filteredNotifications = useMemo(() => {
    let list = notifications;
    if (filter === 'UNREAD') list = list.filter((n) => !n.isRead);
    else if (filter === 'URGENT') list = list.filter((n) => n.priority === 'urgent');
    else if (filter === 'ACCESS') list = list.filter((n) => kindOf(n.type) === 'CONSENT');

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((n) => (n.title ?? '').toLowerCase().includes(q) || (n.message ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [notifications, filter, searchQuery]);

  const handleMarkAll = async () => {
    setActionError(null);
    try {
      await markAllRead();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Unable to update notifications.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Notifications"
        subtitle="Stay updated on responses to your patient access requests."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="sandal">{notifications.length} Total</Badge>
            <Badge variant={unreadCount > 0 ? 'danger' : 'outline'}>{unreadCount} Unread</Badge>
          </div>
        }
        actions={
          <Button
            variant="outline"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={() => void handleMarkAll()}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
        }
      />

      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Search & Filter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0',
                  filter === option.value
                    ? 'bg-sandal-500 text-white shadow-sm'
                    : 'bg-white text-warm-muted border border-sandal-200 hover:border-sandal-300 hover:text-warm-brown'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {actionError && (
        <Card padding="md" className="flex items-start gap-3 border-red-200 bg-red-50/60">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-warm-muted">{actionError}</p>
        </Card>
      )}

      {inbox.status === 'loading' ? (
        <AsyncStateView status="loading" loadingLabel="Loading notifications…" />
      ) : inbox.status === 'error' && notifications.length === 0 ? (
        <AsyncStateView status="error" errorMessage={inbox.message} onRetry={() => void inbox.reload()} />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={notifications.length === 0 ? 'No notifications yet' : 'No notifications found'}
          description={
            notifications.length === 0
              ? 'When a patient approves or denies your access request, you will be notified here.'
              : 'No notifications match this filter.'
          }
        />
      ) : (
        <div className="space-y-3">
          {inbox.status === 'error' && (
            <p className="text-xs text-rose-700">Could not refresh: {inbox.message} Showing the last loaded notifications.</p>
          )}
          {filteredNotifications.map((notification) => (
            <NotificationItemCard key={notification.id} notification={notification} onError={setActionError} />
          ))}
        </div>
      )}
    </div>
  );
};
