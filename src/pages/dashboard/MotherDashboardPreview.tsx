import React from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
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
import { mockMother, mockChild, mockDoctor, mockHospital, mockAppointments, mockVaccinations } from '@/data/mockData';

export const MotherDashboardPreview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Welcome, ${mockMother.name}`}
        subtitle="Your personalized maternal and infant care space for postpartum week 5."
        badge={<Badge variant="sage">Postpartum Recovery</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="warm" size="md">
              Hospital: {mockHospital.name}
            </Badge>
          </div>
        }
      />

      {/* Module 0 Notice Banner */}
      <div className="p-4 rounded-2xl bg-peach-verySoft/80 border border-sandal-200/80 flex items-start gap-3 shadow-subtle">
        <Sparkles className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm text-sandal-900 leading-relaxed">
          <strong>Module 0 Preview:</strong> You are viewing the foundational layout of the Mother Workspace. Full interactive modules (Profile, Immunizations, Nutrition, Schedules, Documents) will be integrated in subsequent modules.
        </div>
      </div>

      {/* Quick Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Child Snapshot Card */}
        <Card variant="default" padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-peach-soft text-sandal-700 flex items-center justify-center">
              <Baby className="w-5 h-5" />
            </div>
            <Badge variant="sandal" size="sm">{mockChild.ageDisplay}</Badge>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-warm-brown">
              {mockChild.name}
            </h4>
            <p className="text-xs text-warm-muted mt-0.5">
              Born at {mockChild.birthHospital} • Weight: {mockChild.currentWeightKg} kg
            </p>
          </div>
          <div className="pt-2 border-t border-sandal-100 flex items-center justify-between text-xs">
            <span className="text-warm-muted">Blood Group: {mockChild.bloodGroup}</span>
            <Link to="/mother/child" className="text-sandal-700 font-semibold hover:underline flex items-center gap-0.5">
              <span>View Profile</span>
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
              {mockVaccinations[1]?.vaccineName || 'Pentavalent-1'}
            </h4>
            <p className="text-xs text-warm-muted mt-0.5">
              Target Milestone: {mockVaccinations[1]?.targetAgeDescription} (Aug 29)
            </p>
          </div>
          <div className="pt-2 border-t border-sandal-100 flex items-center justify-between text-xs">
            <span className="text-sage-text font-medium">Routine Primary Dose</span>
            <Link to="/mother/vaccinations" className="text-sandal-700 font-semibold hover:underline flex items-center gap-0.5">
              <span>Schedule</span>
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
                  Upcoming Consultations
                </h3>
              </div>
              <Link to="/mother/appointments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>

            <div className="pt-4 space-y-3">
              {mockAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-warm-cream/50 border border-sandal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-warm-brown text-base">
                        {apt.title}
                      </span>
                      <Badge variant={apt.status === 'upcoming' ? 'sandal' : 'sage'} size="sm">
                        {apt.status === 'upcoming' ? 'Scheduled' : 'Completed'}
                      </Badge>
                    </div>
                    <p className="text-xs text-warm-muted">
                      With {apt.doctorName} • {apt.location}
                    </p>
                    {apt.notes && (
                      <p className="text-xs text-sandal-700 italic pt-1">
                        "{apt.notes}"
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
              ))}
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
                <span className="text-xs font-semibold text-sandal-800 block">Postnatal Nutrition</span>
                <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                  Focus on calcium-rich ragi, lentils, leafy greens, and adequate hydration to support lactation.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-warm-ivory border border-sandal-100">
                <span className="text-xs font-semibold text-sandal-800 block">Gentle Recovery</span>
                <p className="text-xs text-warm-muted mt-1 leading-relaxed">
                  Avoid heavy lifting during early weeks. Take short calming walks and rest whenever the baby sleeps.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/mother/nutrition">
                <Button variant="outline" size="sm" fullWidth>
                  Explore Nutrition Guidance
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
