import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockDoctor } from '@/data/mockData';
import { getAppointmentsForDoctor } from '@/data/doctorPatientsMockData';
import { getAppointmentStatusBadgeVariant } from '@/pages/doctor/doctorUi';
import { DoctorAppointmentStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

export const DoctorAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'ALL' | DoctorAppointmentStatus>('ALL');

  const allAppointments = useMemo(() => getAppointmentsForDoctor(mockDoctor.id), []);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'ALL') return allAppointments;
    return allAppointments.filter((a) => a.status === statusFilter);
  }, [allAppointments, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        subtitle="All scheduled visits across your assigned patients."
        badge={<Badge variant="sandal">{allAppointments.length} Total</Badge>}
      />

      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Filter by Status
          </h3>
          <div className="max-w-xs">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | DoctorAppointmentStatus)}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {filteredAppointments.length === 0 ? (
        <Card className="bg-warm-ivory border-sandal-100">
          <div className="text-center py-12">
            <CalendarCheck className="w-10 h-10 text-sandal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-warm-brown mb-2">No Appointments Found</h3>
            <p className="text-warm-muted">No appointments match this filter.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => (
            <Card key={apt.appointmentId} variant="interactive" className="hover:shadow-warm-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-warm-brown">{apt.patientName}</h4>
                    <Badge variant={getAppointmentStatusBadgeVariant(apt.status)} size="sm">{apt.status}</Badge>
                  </div>
                  <p className="text-sm text-warm-muted mt-1">{apt.type} • {apt.location}</p>
                  {apt.notes && <p className="text-xs text-sandal-700 italic mt-1">{apt.notes}</p>}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-warm-brown">{apt.date}</p>
                    <p className="text-xs text-warm-muted">{apt.time}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/patients/${apt.patientId}`)}>
                    Open Patient
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
