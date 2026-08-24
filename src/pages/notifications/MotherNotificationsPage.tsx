import React, { useMemo, useState } from 'react';
import { BellOff, CheckCheck, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { mockMother } from '@/data/mockData';
import { getNotificationsForMother, NOTIFICATION_TYPE_LABELS } from '@/data/motherNotificationsMockData';
import { NotificationItem, NotificationType } from '@/types';
import { NotificationCard } from './components/NotificationCard';

type TabId = 'all' | 'unread';

const TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  ...(Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]).map((value) => ({
    value,
    label: NOTIFICATION_TYPE_LABELS[value],
  })),
];

export const MotherNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getNotificationsForMother(mockMother.id)
  );
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [typeFilter, setTypeFilter] = useState<'ALL' | NotificationType>('ALL');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const visibleNotifications = useMemo(() => {
    let list = activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;
    if (typeFilter !== 'ALL') list = list.filter((n) => n.type === typeFilter);
    return list;
  }, [notifications, activeTab, typeFilter]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Reminders and updates for your care and baby Vihaan's care, all in one place."
        badge={<Badge variant={unreadCount > 0 ? 'sandal' : 'outline'}>{unreadCount} Unread</Badge>}
        actions={
          <Button
            variant="outline"
            leftIcon={<CheckCheck className="w-4 h-4" />}
            onClick={handleMarkAllRead}
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
            onChange={(e) => setTypeFilter(e.target.value as 'ALL' | NotificationType)}
            options={TYPE_FILTER_OPTIONS}
          />
        </div>
      </div>

      {/* Notification List */}
      {visibleNotifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={activeTab === 'unread' ? 'No unread notifications' : 'No notifications found'}
          description={
            activeTab === 'unread'
              ? "You're all caught up! New reminders and updates will appear here."
              : 'No notifications match this filter yet.'
          }
        />
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  );
};
