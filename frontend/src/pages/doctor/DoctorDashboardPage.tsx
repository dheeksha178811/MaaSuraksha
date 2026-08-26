import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  ClipboardList,
  FileWarning,
  ChevronRight,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockDoctor, mockHospital } from '@/data/mockData';
import { getDoctorAlerts, getReportsAwaitingReview } from '@/data/doctorPatientsMockData';
import * as doctorService from '@/services/doctorService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { getAppointmentStatusBadgeVariant } from '@/pages/doctor/doctorUi';

export const DoctorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const doctorId = mockDoctor.id;

  // Reports Awaiting Review and Alerts stay on mock data — there is no real
  // Reports API yet (Phase 6 Part 9 explicitly excluded Reports), and Alerts
  // composites risk flags + overdue follow-ups with reports-awaiting-review,
  // so it can't be made fully real without that API either.
  const reportsAwaitingReview = getReportsAwaitingReview(doctorId);
  const alerts = getDoctorAlerts(doctorId);

  const [patientsState, reloadPatients] = useAsyncData(() => doctorService.getMyPatients(), []);
  const [appointmentsState, reloadAppointments] = useAsyncData(() => doctorService.getMyAppointments(), []);

  const reload = () => {
    reloadPatients();
    reloadAppointments();
  };

  const headerProps = {
    title: `Welcome, ${mockDoctor.name}`,
    subtitle: `${mockDoctor.specialization} • ${mockHospital.name}`,
    badge: <Badge variant="sandal">Doctor Portal</Badge>,
    actions: (
      <Link to="/doctor/patients">
        <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
          My Patients
        </Button>
      </Link>
    ),
  };

  if (patientsState.status === 'loading' || appointmentsState.status === 'loading') {
    return (
      <div className="space-y-6">
        <PageHeader {...headerProps} />
        <AsyncStateView status="loading" loadingLabel="Loading your dashboard…" />
      </div>
    );
  }

  if (patientsState.status === 'error' || appointmentsState.status === 'error') {
    const errorMessage =
      patientsState.status === 'error'
        ? patientsState.message
        : appointmentsState.status === 'error'
        ? appointmentsState.message
        : undefined;
    return (
      <div className="space-y-6">
        <PageHeader {...headerProps} />
        <AsyncStateView status="error" errorMessage={errorMessage} onRetry={reload} />
      </div>
    );
  }

  const patients = patientsState.data;
  const appointments = appointmentsState.data;

  // Local calendar date, not the server's — matches the toISOString().slice
  // pattern already used for "today" elsewhere in this codebase (e.g.
  // AdminReportsPage/HospitalReportsPage). appt_date round-trips as a
  // UTC-midnight ISO string, so comparing its first 10 characters against
  // this is a safe date-only comparison.
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysAppointments = appointments.filter((a) => a.status === 'upcoming' && a.date === todayISO);
  const upcomingAppointments = appointments
    .filter((a) => a.status === 'upcoming' && a.date > todayISO)
    .slice(0, 5);
  const followUpsDue = appointments.filter((a) => a.status === 'upcoming' && a.date < todayISO);

  const statCards = [
    { label: 'My Patients', value: patients.length, icon: Users, tone: 'from-sandal-50 to-sandal-100 border-sandal-200 text-sandal-900' },
    { label: "Today's Appointments", value: todaysAppointments.length, icon: CalendarCheck, tone: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900' },
    { label: 'Follow-ups Due', value: followUpsDue.length, icon: AlertTriangle, tone: 'from-rose-50 to-rose-100 border-rose-200 text-rose-900' },
    { label: 'Reports Awaiting Review', value: reportsAwaitingReview.length, icon: FileWarning, tone: 'from-green-50 to-green-100 border-green-200 text-green-900' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader {...headerProps} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className={`bg-gradient-to-br border ${stat.tone}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-warm-muted mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-white/60 flex items-center justify-center">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Appointments */}
        <div className="lg:col-span-2 space-y-5">
          <Card padding="lg" className="bg-white">
            <div className="flex items-center justify-between pb-4 border-b border-sandal-100">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-xl font-bold text-warm-brown">Today's Appointments</h3>
              </div>
              <Link to="/doctor/appointments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>

            <div className="pt-4 space-y-3">
              {todaysAppointments.length === 0 ? (
                <p className="text-sm text-warm-muted py-4 text-center">No appointments scheduled for today.</p>
              ) : (
                todaysAppointments.map((apt) => (
                  <button
                    key={apt.appointmentId}
                    onClick={() => navigate(`/doctor/patients/${apt.patientId}`)}
                    className="w-full text-left p-4 rounded-2xl bg-warm-cream/50 border border-sandal-100 hover:border-sandal-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-warm-brown text-base">{apt.patientName}</span>
                        <Badge variant={getAppointmentStatusBadgeVariant(apt.status)} size="sm">{apt.type}</Badge>
                      </div>
                      <p className="text-xs text-warm-muted">{apt.location}</p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="text-sm font-semibold text-warm-brown block">{apt.time}</span>
                      <span className="text-xs text-warm-muted">{apt.date}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          <Card padding="lg" className="bg-white">
            <div className="flex items-center justify-between pb-4 border-b border-sandal-100">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-xl font-bold text-warm-brown">Upcoming Appointments</h3>
              </div>
              <Link to="/doctor/appointments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>

            <div className="pt-4 space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-warm-muted py-4 text-center">No upcoming appointments.</p>
              ) : (
                upcomingAppointments.map((apt) => (
                  <button
                    key={apt.appointmentId}
                    onClick={() => navigate(`/doctor/patients/${apt.patientId}`)}
                    className="w-full text-left p-3 rounded-xl hover:bg-warm-cream/60 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-warm-brown truncate">{apt.patientName}</p>
                      <p className="text-xs text-warm-muted truncate">{apt.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-warm-brown">{apt.date}</p>
                      <p className="text-[11px] text-warm-muted">{apt.time}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Alerts, Follow-ups, Reports */}
        <div className="space-y-5">
          <Card padding="md" className="bg-white space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Alerts</h3>
            </div>
            <div className="space-y-2.5">
              {alerts.length === 0 ? (
                <p className="text-xs text-warm-muted">No active alerts. All patients are on track.</p>
              ) : (
                alerts.slice(0, 5).map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => navigate(`/doctor/patients/${alert.patientId}`)}
                    className="w-full text-left p-3 rounded-xl bg-warm-ivory border border-sandal-100 hover:border-sandal-300 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          alert.severity === 'high'
                            ? 'bg-rose-500'
                            : alert.severity === 'moderate'
                            ? 'bg-amber-500'
                            : 'bg-sandal-400'
                        }`}
                      />
                      <p className="text-xs text-warm-brown leading-relaxed">{alert.message}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>

          <Card padding="md" className="bg-white space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
              <Stethoscope className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Follow-ups Due</h3>
            </div>
            <div className="space-y-2.5">
              {followUpsDue.length === 0 ? (
                <p className="text-xs text-warm-muted">No overdue follow-ups.</p>
              ) : (
                followUpsDue.map((apt) => (
                  <button
                    key={apt.appointmentId}
                    onClick={() => navigate(`/doctor/patients/${apt.patientId}`)}
                    className="w-full text-left p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 hover:border-rose-300 transition-colors"
                  >
                    <p className="text-xs font-semibold text-warm-brown">{apt.patientName}</p>
                    <p className="text-[11px] text-warm-muted">{apt.type} was due {apt.date}</p>
                  </button>
                ))
              )}
            </div>
          </Card>

          <Card padding="md" className="bg-white space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
              <FileWarning className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Reports Awaiting Review</h3>
            </div>
            <div className="space-y-2.5">
              {reportsAwaitingReview.length === 0 ? (
                <p className="text-xs text-warm-muted">No reports pending review.</p>
              ) : (
                reportsAwaitingReview.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => report.patientId && navigate(`/doctor/patients/${report.patientId}`)}
                    className="w-full text-left p-2.5 rounded-xl bg-warm-ivory border border-sandal-100 hover:border-sandal-300 transition-colors"
                  >
                    <p className="text-xs font-semibold text-warm-brown truncate">{report.name}</p>
                    <p className="text-[11px] text-warm-muted">{report.date}</p>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
