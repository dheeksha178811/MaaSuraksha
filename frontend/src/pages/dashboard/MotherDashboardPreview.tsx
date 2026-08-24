import React from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  HeartPulse,
  Stethoscope,
  Syringe,
  CalendarCheck,
  Sparkles,
  ChevronRight,
  Heart
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { mockMother, mockChild, mockDoctor, mockHospital, mockVaccinations } from '@/data/mockData';
import { CARE_STAGE_DETAILS, CareStage } from '@/data/careJourneyMockData';
import { setCareStage, useCareStage } from '@/hooks/useCareStage';
import { getUpcomingAppointmentsForMother } from '@/data/motherAppointmentsMockData';
import { getMotherAppointmentStatusLabel } from '@/pages/appointments/motherAppointmentUi';

const careStageOptions = (Object.keys(CARE_STAGE_DETAILS) as CareStage[]).map((stage) => ({
  value: stage,
  label: CARE_STAGE_DETAILS[stage].label,
}));

const isPregnancyStage = (stage: CareStage) =>
  stage === 'EARLY_PREGNANCY' || stage === 'ANTENATAL_CARE' || stage === 'LATE_PREGNANCY';

export const MotherDashboardPreview: React.FC = () => {
  const careStage = useCareStage();
  const stageDetails = CARE_STAGE_DETAILS[careStage];
  const pregnancyActive = isPregnancyStage(careStage);
  const upcomingAppointments = getUpcomingAppointmentsForMother(mockMother.id).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Welcome, ${mockMother.name}`}
        subtitle={stageDetails.dashboardSubtitle}
        badge={<Badge variant="sage">{stageDetails.label}</Badge>}
        actions={
          <div className="w-full sm:w-56">
            <Select
              aria-label="Current care stage"
              options={careStageOptions}
              value={careStage}
              onChange={(event) => setCareStage(event.target.value as CareStage)}
            />
          </div>
        }
      />

      {/* Module 0 Notice Banner */}
      <div className="p-4 rounded-2xl bg-peach-verySoft/80 border border-sandal-200/80 flex items-start gap-3 shadow-subtle">
        <Sparkles className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm text-sandal-900 leading-relaxed">
          <strong>Care focus:</strong> {stageDetails.focus}. {stageDetails.reminder}
        </div>
      </div>

      {/* Quick Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Child Snapshot Card */}
        <Card variant="default" padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-peach-soft text-sandal-700 flex items-center justify-center">
              {pregnancyActive ? <HeartPulse className="w-5 h-5" /> : <Baby className="w-5 h-5" />}
            </div>
            <Badge variant="sandal" size="sm">{pregnancyActive ? 'Week 32' : mockChild.ageDisplay}</Badge>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-warm-brown">
              {pregnancyActive ? 'Current pregnancy' : mockChild.name}
            </h4>
            <p className="text-xs text-warm-muted mt-0.5">
              {pregnancyActive ? 'Expected delivery: July 25, 2026' : `Born at ${mockChild.birthHospital} • Weight: ${mockChild.currentWeightKg} kg`}
            </p>
          </div>
          <div className="pt-2 border-t border-sandal-100 flex items-center justify-between text-xs">
            <span className="text-warm-muted">{pregnancyActive ? 'Pregnancy progress' : `Blood Group: ${mockChild.bloodGroup}`}</span>
            <Link to="/mother/pregnancy" className="text-sandal-700 font-semibold hover:underline flex items-center gap-0.5">
              <span>{pregnancyActive ? 'View journey' : 'Pregnancy history'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Assigned Doctor Card */}
        <Card variant="default" padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-peach-verySoft text-sandal-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <Badge variant="sage" size="sm">Primary OB/GYN</Badge>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-warm-brown">
              {mockDoctor.name}
            </h4>
            <p className="text-xs text-warm-muted mt-0.5">
              {mockDoctor.specialization}
            </p>
          </div>
          <div className="pt-2 border-t border-sandal-100 flex items-center justify-between text-xs">
            <span className="text-warm-muted">{mockHospital.name}</span>
            <Link to="/mother/doctor" className="text-sandal-700 font-semibold hover:underline flex items-center gap-0.5">
              <span>Doctor Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Next Immunization Milestone Card */}
        <Card variant="default" padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sage-soft text-sage-text flex items-center justify-center">
              <Syringe className="w-5 h-5" />
            </div>
            <Badge variant="sandal" size="sm">Due in 7 Days</Badge>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-warm-brown">
              {pregnancyActive ? stageDetails.nextEvent : mockVaccinations[1]?.vaccineName || 'Pentavalent-1'}
            </h4>
            <p className="text-xs text-warm-muted mt-0.5">
              {pregnancyActive ? 'Upcoming care event' : `Target Milestone: ${mockVaccinations[1]?.targetAgeDescription} (Aug 29)`}
            </p>
          </div>
          <div className="pt-2 border-t border-sandal-100 flex items-center justify-between text-xs">
            <span className="text-sage-text font-medium">{pregnancyActive ? 'Care plan' : 'Routine Primary Dose'}</span>
            <Link to={pregnancyActive ? '/mother/pregnancy' : '/mother/vaccinations'} className="text-sandal-700 font-semibold hover:underline flex items-center gap-0.5">
              <span>{pregnancyActive ? 'Open' : 'Schedule'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Main Content Split: Upcoming Appointment & Health Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Appointment & Milestone Tracker */}
        <div className="lg:col-span-2 space-y-5">
          <Card padding="lg" className="bg-white">
            <div className="flex items-center justify-between pb-4 border-b border-sandal-100">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-xl font-bold text-warm-brown">
                  {pregnancyActive ? 'Pregnancy care plan' : 'Upcoming Consultations'}
                </h3>
              </div>
              <Link to="/mother/appointments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>

            <div className="pt-4 space-y-3">
              {pregnancyActive ? (
                <div className="p-4 rounded-2xl bg-warm-cream/50 border border-sandal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-warm-brown text-base">
                        {stageDetails.nextEvent}
                      </span>
                      <Badge variant="sandal" size="sm">Scheduled</Badge>
                    </div>
                    <p className="text-xs text-warm-muted">
                      With {mockDoctor.name} • {mockHospital.name}
                    </p>
                    <p className="text-xs text-sandal-700 italic pt-1">
                      "{stageDetails.focus}"
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-sm font-semibold text-warm-brown block">Planned</span>
                    <span className="text-xs text-warm-muted">Review in journey</span>
                  </div>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <p className="text-sm text-warm-muted py-2">
                  No upcoming appointments. Visit the Appointments page to request one.
                </p>
              ) : (
                upcomingAppointments.map((apt) => (
                  <div
                    key={apt.appointmentId}
                    className="p-4 rounded-2xl bg-warm-cream/50 border border-sandal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-warm-brown text-base">
                          {apt.title}
                        </span>
                        <Badge variant={apt.status === 'upcoming' ? 'sandal' : 'peach'} size="sm">
                          {getMotherAppointmentStatusLabel(apt.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-warm-muted">
                        With {apt.doctorName} • {apt.hospitalName}
                      </p>
                      {apt.reason && (
                        <p className="text-xs text-sandal-700 italic pt-1">
                          "{apt.reason}"
                        </p>
                      )}
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-sm font-semibold text-warm-brown block">
                        {apt.date}
                      </span>
                      <span className="text-xs text-warm-muted">{apt.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Maternal Care Tips */}
        <div className="space-y-5">
          <Card padding="md" className="bg-white space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
              <Heart className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">
                Care Advice & Tips
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-warm-ivory border border-sandal-100">
                <span className="text-xs font-semibold text-sandal-800 block">{pregnancyActive ? 'Pregnancy wellness' : 'Postnatal Nutrition'}</span>
                <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                  {pregnancyActive ? 'Keep your scheduled tests, appointments, rest, and hydration routine visible in one calm care plan.' : 'Focus on calcium-rich ragi, lentils, leafy greens, and adequate hydration to support lactation.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-warm-ivory border border-sandal-100">
                <span className="text-xs font-semibold text-sandal-800 block">{pregnancyActive ? 'Current milestone' : 'Gentle Recovery'}</span>
                <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                  {pregnancyActive ? `${stageDetails.progress}% of the pregnancy journey is represented in this mock record.` : 'Avoid heavy lifting during early weeks. Take short calming walks and rest whenever the baby sleeps.'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/mother/nutrition">
                <Button variant="outline" size="sm" fullWidth>
                  {pregnancyActive ? 'View Pregnancy Journey' : 'Explore Nutrition Guidance'}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
