import React, { useMemo, useState } from 'react';
import { AlertCircle, BellOff, CheckCheck, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { markAllRead, useNotifications } from '@/hooks/useNotifications';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { NOTIFICATION_KIND_LABELS, NotificationItemCard, NotificationKind, kindOf } from './components/NotificationItemCard';

// Real notifications for the signed-in mother (GET /api/notifications), sharing
// one store with the header bell so counts and read state always agree.

type TabId = 'all' | 'unread';

const TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  ...(Object.keys(NOTIFICATION_KIND_LABELS) as (keyof typeof NOTIFICATION_KIND_LABELS)[]).map((value) => ({
    value,
    label: NOTIFICATION_KIND_LABELS[value],
  })),
];

export const MotherNotificationsPage: React.FC = () => {
  const inbox = useNotifications();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [typeFilter, setTypeFilter] = useState<'ALL' | NotificationKind>('ALL');
  const [actionError, setActionError] = useState<string | null>(null);

  const { notifications, unreadCount } = inbox;

  const visibleNotifications = useMemo(() => {
    let list = activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;
    if (typeFilter !== 'ALL') list = list.filter((n) => kindOf(n.type) === typeFilter);
    return list;
  }, [notifications, activeTab, typeFilter]);

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
        title="Notifications"
        subtitle="Access requests and updates about your care, all in one place."
        badge={<Badge variant={unreadCount > 0 ? 'sandal' : 'outline'}>{unreadCount} Unread</Badge>}
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

      {/* Tabs + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 border-b border-sandal-100 sm:border-0 pb-3 sm:pb-0">
          {(
            [
              { id: 'all', label: `All (${notifications.length})` },
              { id: 'unread', label: `Unread (${unreadCount})` },
            ] as { id: TabId; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-sandal-500 text-white shadow-sm'
                  : 'text-warm-muted hover:bg-warm-cream hover:text-sandal-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 flex items-center gap-2">
          <Filter className="w-4 h-4 text-sandal-600 shrink-0" />
          <Select
            aria-label="Filter by notification type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'ALL' | NotificationKind)}
            options={TYPE_FILTER_OPTIONS}
          />
        </div>
      </div>

      {actionError && (
        <Card padding="md" className="flex items-start gap-3 border-red-200 bg-red-50/60">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-warm-muted">{actionError}</p>
        </Card>
      )}

      {/* Notification List */}
      {inbox.status === 'loading' ? (
        <AsyncStateView status="loading" loadingLabel="Loading notifications…" />
      ) : inbox.status === 'error' && notifications.length === 0 ? (
        <AsyncStateView status="error" errorMessage={inbox.message} onRetry={() => void inbox.reload()} />
      ) : visibleNotifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description={
            activeTab === 'unread'
              ? "You're all caught up! New updates will appear here."
              : notifications.length === 0
                ? 'When a doctor or hospital asks to view your records, you will be notified here.'
                : 'No notifications match this filter.'
          }
        />
      ) : (
        <div className="space-y-3">
          {inbox.status === 'error' && (
            <p className="text-xs text-rose-700">Could not refresh: {inbox.message} Showing the last loaded notifications.</p>
          )}
          {visibleNotifications.map((notification) => (
            <NotificationItemCard key={notification.id} notification={notification} onError={setActionError} />
          ))}
        </div>
      )}
    </div>
  );
};
