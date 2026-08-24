import React, { useMemo, useState } from 'react';
import { Bell, CheckCheck, Filter, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { mockDoctor } from '@/data/mockData';
import { getNotificationsForDoctor } from '@/data/doctorNotificationsMockData';
import { DoctorNotification } from '@/types';
import {
  DOCTOR_NOTIFICATION_FILTER_TYPES,
  DoctorNotificationFilter,
} from '@/pages/doctor/doctorNotificationsUi';
import { DoctorNotificationCard } from '@/pages/doctor/components/DoctorNotificationCard';

const FILTER_OPTIONS: { value: DoctorNotificationFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'MESSAGE', label: 'Messages' },
  { value: 'APPOINTMENT', label: 'Appointments' },
  { value: 'REPORT', label: 'Reports' },
  { value: 'CARE_PLAN', label: 'Care Plans' },
  { value: 'URGENT', label: 'Urgent' },
];

export const DoctorNotificationsPage: React.FC = () => {
  const doctorId = mockDoctor.id;
  const [notifications, setNotifications] = useState<DoctorNotification[]>(() => getNotificationsForDoctor(doctorId));
  const [filter, setFilter] = useState<DoctorNotificationFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    let list = notifications;
    if (filter === 'UNREAD') list = list.filter((n) => !n.isRead);
    else if (filter === 'URGENT') list = list.filter((n) => n.priority === 'urgent');
    else if (filter !== 'ALL') list = list.filter((n) => DOCTOR_NOTIFICATION_FILTER_TYPES[filter].includes(n.type));

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.patientName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notifications, filter, searchQuery]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Notifications"
        subtitle="Stay updated on patient alerts, reports, appointments, and care activity."
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
            onClick={handleMarkAllRead}
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
                placeholder="Search notifications or patient..."
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

      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description="No notifications match this filter yet."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <DoctorNotificationCard key={notification.id} notification={notification} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  );
};
