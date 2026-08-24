import React, { useMemo, useState } from 'react';
import { CalendarPlus, CalendarX2, Filter, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import {
  APPOINTMENT_CATEGORY_LABELS,
  MOTHER_TODAY_ISO,
  RequestAppointmentInput,
  createRequestedAppointment,
  getAppointmentsForMother,
  isCancellable,
  isReschedulable,
} from '@/data/motherAppointmentsMockData';
import { AppointmentCategory, MotherAppointment } from '@/types';
import { AppointmentCard } from './components/AppointmentCard';
import { AppointmentDetailsModal } from './components/AppointmentDetailsModal';
import { RequestAppointmentModal } from './components/RequestAppointmentModal';
import { RescheduleAppointmentModal } from './components/RescheduleAppointmentModal';
import { CancelAppointmentModal } from './components/CancelAppointmentModal';

type TabId = 'upcoming' | 'past';

const CATEGORY_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Categories' },
  ...(Object.keys(APPOINTMENT_CATEGORY_LABELS) as AppointmentCategory[]).map((value) => ({
    value,
    label: APPOINTMENT_CATEGORY_LABELS[value],
  })),
];

export const MotherAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<MotherAppointment[]>(() =>
    getAppointmentsForMother(mockMother.id)
  );
  const [activeTab, setActiveTab] = useState<TabId>('upcoming');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AppointmentCategory>('ALL');

  const [viewingAppointment, setViewingAppointment] = useState<MotherAppointment | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<MotherAppointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<MotherAppointment | null>(null);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => (a.status === 'upcoming' || a.status === 'requested') && a.date >= MOTHER_TODAY_ISO
      ),
    [appointments]
  );

  const pastAppointments = useMemo(
    () =>
      appointments
        .filter(
          (a) =>
            a.status === 'completed' ||
            a.status === 'cancelled' ||
            a.status === 'rescheduled' ||
            ((a.status === 'upcoming' || a.status === 'requested') && a.date < MOTHER_TODAY_ISO)
        )
        .slice()
        .reverse(),
    [appointments]
  );

  const visibleAppointments = useMemo(() => {
    const source = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;
    if (categoryFilter === 'ALL') return source;
    return source.filter((a) => a.category === categoryFilter);
  }, [activeTab, upcomingAppointments, pastAppointments, categoryFilter]);

  const handleRequestAppointment = (input: RequestAppointmentInput) => {
    const newAppointment = createRequestedAppointment(input, appointments);
    setAppointments((prev) => [...prev, newAppointment]);
    setActiveTab('upcoming');
  };

  const handleConfirmReschedule = (appointment: MotherAppointment, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.appointmentId === appointment.appointmentId
          ? { ...a, date: newDate, time: newTime, status: 'rescheduled' as const }
          : a
      )
    );
    setReschedulingAppointment(null);
    setViewingAppointment(null);
  };

  const handleConfirmCancel = (appointment: MotherAppointment) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.appointmentId === appointment.appointmentId ? { ...a, status: 'cancelled' as const } : a
      )
    );
    setCancellingAppointment(null);
    setViewingAppointment(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        subtitle="Track your antenatal, postnatal, and child care visits — and request new ones — all in one place."
        badge={<Badge variant="sandal">{upcomingAppointments.length} Upcoming</Badge>}
        actions={
          <Button leftIcon={<CalendarPlus className="w-4 h-4" />} onClick={() => setRequestModalOpen(true)}>
            Request Appointment
          </Button>
        }
      />

      {/* Assigned Doctor & Hospital */}
      <Card padding="md" className="bg-white flex flex-col sm:flex-row sm:items-center gap-4">
        <Avatar name={mockDoctor.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-lg font-bold text-warm-brown">{mockDoctor.name}</h3>
            <Badge variant="sage" size="sm">Assigned Doctor</Badge>
          </div>
          <p className="text-sm text-warm-muted mt-0.5">
            {mockDoctor.specialization} • {mockHospital.name}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-muted shrink-0">
          <Stethoscope className="w-4 h-4 text-sandal-600" />
          <span>All appointments below are with your assigned care team.</span>
        </div>
      </Card>

      {/* Tabs + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 border-b border-sandal-100 sm:border-0 pb-3 sm:pb-0">
          {(
            [
              { id: 'upcoming', label: `Upcoming (${upcomingAppointments.length})` },
              { id: 'past', label: `Past (${pastAppointments.length})` },
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
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | AppointmentCategory)}
            options={CATEGORY_FILTER_OPTIONS}
          />
        </div>
      </div>

      {/* Appointment List */}
      {visibleAppointments.length === 0 ? (
        <EmptyState
          icon={activeTab === 'upcoming' ? CalendarPlus : CalendarX2}
          title={activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
          description={
            activeTab === 'upcoming'
              ? categoryFilter === 'ALL'
                ? 'You have no scheduled or requested appointments right now. Request one whenever you need to see your doctor.'
                : 'No upcoming appointments match this category filter.'
              : 'Completed, cancelled, and rescheduled appointments will appear here.'
          }
          action={
            activeTab === 'upcoming' && (
              <Button leftIcon={<CalendarPlus className="w-4 h-4" />} onClick={() => setRequestModalOpen(true)}>
                Request Appointment
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {visibleAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.appointmentId}
              appointment={appointment}
              onView={setViewingAppointment}
              onReschedule={isReschedulable(appointment.status) ? setReschedulingAppointment : undefined}
              onCancel={isCancellable(appointment.status) ? setCancellingAppointment : undefined}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {viewingAppointment && (
        <AppointmentDetailsModal
          appointment={viewingAppointment}
          onClose={() => setViewingAppointment(null)}
          onReschedule={isReschedulable(viewingAppointment.status) ? setReschedulingAppointment : undefined}
          onCancel={isCancellable(viewingAppointment.status) ? setCancellingAppointment : undefined}
        />
      )}

      {reschedulingAppointment && (
        <RescheduleAppointmentModal
          appointment={reschedulingAppointment}
          onClose={() => setReschedulingAppointment(null)}
          onConfirm={handleConfirmReschedule}
        />
      )}

      {cancellingAppointment && (
        <CancelAppointmentModal
          appointment={cancellingAppointment}
          onClose={() => setCancellingAppointment(null)}
          onConfirm={handleConfirmCancel}
        />
      )}

      <RequestAppointmentModal
        isOpen={isRequestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSubmit={handleRequestAppointment}
      />
    </div>
  );
};
