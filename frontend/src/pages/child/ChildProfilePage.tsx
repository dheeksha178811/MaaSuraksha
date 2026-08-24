import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  CalendarClock,
  Droplet,
  FileText,
  Pill,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { mockChild, mockDoctor, mockMother } from '@/data/mockData';
import {
  MOTHER_TODAY_ISO,
  getMeasurementsByRecipient,
  getMilestonesByRecipient,
  getPreviousMeasurement,
} from '@/data/motherGrowthMockData';
import { getVaccinationsByRecipient } from '@/data/motherVaccinationsMockData';
import { getMedicationsForMother } from '@/data/motherMedicationsMockData';
import { getUpcomingAppointmentsForMother } from '@/data/motherAppointmentsMockData';
import { getReportsForChild } from '@/data/childReportsMockData';
import { GrowthMeasurement, MilestoneRecord, MotherMedication, MotherVaccinationRecord, Report } from '@/types';

import { MeasurementCard } from '@/pages/growth/components/MeasurementCard';
import { MeasurementDetailsModal } from '@/pages/growth/components/MeasurementDetailsModal';
import { MilestoneCard } from '@/pages/growth/components/MilestoneCard';
import { MilestoneDetailsModal } from '@/pages/growth/components/MilestoneDetailsModal';
import { VaccinationCard } from '@/pages/vaccinations/components/VaccinationCard';
import { VaccinationDetailsModal } from '@/pages/vaccinations/components/VaccinationDetailsModal';
import { MedicationCard } from '@/pages/medications/components/MedicationCard';
import { MedicationDetailsModal } from '@/pages/medications/components/MedicationDetailsModal';
import { ReportDetailsModal } from '@/pages/reports/ReportDetailsModal';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, viewAllHref, viewAllLabel = 'View All' }) => (
  <div className="flex items-center justify-between pb-4 border-b border-sandal-100">
    <div className="flex items-center gap-2.5">
      {icon}
      <h3 className="font-display text-xl font-bold text-warm-brown">{title}</h3>
    </div>
    {viewAllHref && (
      <Link to={viewAllHref}>
        <Button variant="ghost" size="sm">{viewAllLabel}</Button>
      </Link>
    )}
  </div>
);

export const ChildProfilePage: React.FC = () => {
  const [milestones, setMilestones] = useState<MilestoneRecord[]>(() =>
    getMilestonesByRecipient(mockMother.id, 'CHILD')
  );
  const [vaccinations, setVaccinations] = useState<MotherVaccinationRecord[]>(() =>
    getVaccinationsByRecipient(mockMother.id, 'CHILD')
  );

  const measurements = useMemo(() => getMeasurementsByRecipient(mockMother.id, 'CHILD'), []);
  const medications = useMemo(
    () => getMedicationsForMother(mockMother.id).filter((m: MotherMedication) => m.childId === mockChild.id),
    []
  );
  const reports = useMemo(() => getReportsForChild(), []);

  const [viewingMeasurement, setViewingMeasurement] = useState<GrowthMeasurement | null>(null);
  const [viewingMilestone, setViewingMilestone] = useState<MilestoneRecord | null>(null);
  const [viewingVaccination, setViewingVaccination] = useState<MotherVaccinationRecord | null>(null);
  const [viewingMedication, setViewingMedication] = useState<MotherMedication | null>(null);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);

  const latestMeasurement = measurements[measurements.length - 1];
  const recentMeasurements = useMemo(() => measurements.slice(-3).reverse(), [measurements]);

  const achievedMilestoneCount = milestones.filter((m) => m.status === 'achieved').length;
  const dueSoonMilestones = milestones.filter((m) => m.status !== 'achieved');

  const completedVaccineCount = vaccinations.filter((v) => v.status === 'completed').length;
  const dueOrUpcomingVaccinations = vaccinations.filter((v) => v.status !== 'completed');

  const nextAppointment = useMemo(
    () => getUpcomingAppointmentsForMother(mockMother.id).find((a) => a.childId === mockChild.id),
    []
  );
  const nextVaccination = useMemo(
    () => vaccinations.find((v) => v.status === 'due_soon' || v.status === 'overdue' || v.status === 'upcoming'),
    [vaccinations]
  );
  const nextMilestone = useMemo(() => milestones.find((m) => m.status !== 'achieved'), [milestones]);

  const handleMarkMilestoneAchieved = (milestone: MilestoneRecord) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.milestoneId === milestone.milestoneId
          ? { ...m, status: 'achieved' as const, achievedDate: MOTHER_TODAY_ISO }
          : m
      )
    );
    setViewingMilestone((prev) =>
      prev && prev.milestoneId === milestone.milestoneId
        ? { ...prev, status: 'achieved' as const, achievedDate: MOTHER_TODAY_ISO }
        : prev
    );
  };

  const handleToggleVaccinationReminder = (vaccination: MotherVaccinationRecord) => {
    setVaccinations((prev) =>
      prev.map((v) =>
        v.vaccinationId === vaccination.vaccinationId ? { ...v, reminderEnabled: !v.reminderEnabled } : v
      )
    );
    setViewingVaccination((prev) =>
      prev && prev.vaccinationId === vaccination.vaccinationId
        ? { ...prev, reminderEnabled: !prev.reminderEnabled }
        : prev
    );
  };

  const handleDownloadReport = (report: Report) => {
    alert(`Downloading: ${report.name}\n\nIn production, this would download the actual file.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Child"
        subtitle={`${mockChild.name}'s complete care profile — growth, milestones, vaccinations, medications, and reports in one place.`}
        badge={<Badge variant="sandal">{mockChild.ageDisplay} old</Badge>}
      />

      {/* Child Profile Header */}
      <Card padding="lg" className="bg-white">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <Avatar name={mockChild.name} size="xl" />
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl font-bold text-warm-brown">{mockChild.name}</h2>
                <Badge variant="peach" size="sm">{mockChild.gender === 'boy' ? 'Baby Boy' : 'Baby Girl'}</Badge>
              </div>
              <p className="text-sm text-warm-muted mt-0.5">
                Born {formatDate(mockChild.dateOfBirth)} • {mockChild.ageDisplay} old
              </p>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-2 border-t border-sandal-100">
              <div>
                <dt className="text-xs text-warm-muted flex items-center gap-1"><Droplet className="w-3.5 h-3.5" />Blood Group</dt>
                <dd className="font-semibold text-warm-brown mt-0.5">{mockChild.bloodGroup}</dd>
              </div>
              <div>
                <dt className="text-xs text-warm-muted flex items-center gap-1"><Scale className="w-3.5 h-3.5" />Birth Weight</dt>
                <dd className="font-semibold text-warm-brown mt-0.5">{mockChild.birthWeightKg} kg</dd>
              </div>
              <div>
                <dt className="text-xs text-warm-muted flex items-center gap-1"><Scale className="w-3.5 h-3.5" />Current Weight</dt>
                <dd className="font-semibold text-warm-brown mt-0.5">{mockChild.currentWeightKg} kg</dd>
              </div>
              <div>
                <dt className="text-xs text-warm-muted flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />Current Height</dt>
                <dd className="font-semibold text-warm-brown mt-0.5">{latestMeasurement?.heightCm ? `${latestMeasurement.heightCm} cm` : '—'}</dd>
              </div>
            </dl>

            <div className="pt-2 border-t border-sandal-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-warm-muted">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-sandal-500" />
                {mockDoctor.name} • {mockDoctor.specialization}
              </span>
              <span className="flex items-center gap-1.5">
                <Baby className="w-3.5 h-3.5 text-sandal-500" />
                Born at {mockChild.birthHospital}
              </span>
              <span className="flex items-center gap-1.5 sm:col-span-2">
                Mother: {mockMother.name} • Emergency Contact: {mockMother.emergencyContact.name} ({mockMother.emergencyContact.relation}) — {mockMother.emergencyContact.phone}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center">
            <Scale className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs text-warm-muted">Latest Weight</p>
          <p className="font-display text-lg font-bold text-warm-brown">
            {latestMeasurement?.weightKg !== undefined ? `${latestMeasurement.weightKg} kg` : '—'}
          </p>
        </Card>
        <Card padding="md" className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sage-soft text-sage-text flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs text-warm-muted">Vaccinations</p>
          <p className="font-display text-lg font-bold text-warm-brown">{completedVaccineCount} of {vaccinations.length} Done</p>
        </Card>
        <Card padding="md" className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs text-warm-muted">Milestones Achieved</p>
          <p className="font-display text-lg font-bold text-warm-brown">{achievedMilestoneCount} of {milestones.length}</p>
        </Card>
        <Card padding="md" className="space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sage-soft text-sage-text flex items-center justify-center">
            <Pill className="w-4.5 h-4.5" />
          </div>
          <p className="text-xs text-warm-muted">Active Medications</p>
          <p className="font-display text-lg font-bold text-warm-brown">{medications.filter((m) => m.status === 'active').length}</p>
        </Card>
      </div>

      {/* Upcoming Care */}
      <Card padding="md" className="bg-peach-verySoft/60 border-peach-soft">
        <div className="flex items-center gap-2 pb-3 border-b border-peach-soft">
          <CalendarClock className="w-5 h-5 text-sandal-700" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Upcoming Care for {mockChild.name}</h3>
        </div>
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-warm-muted mb-1">Next Appointment</p>
            {nextAppointment ? (
              <p className="font-semibold text-warm-brown">{nextAppointment.title} — {formatDate(nextAppointment.date)}</p>
            ) : (
              <p className="text-warm-muted">None scheduled</p>
            )}
          </div>
          <div>
            <p className="text-xs text-warm-muted mb-1">Next Vaccination Due</p>
            {nextVaccination ? (
              <p className="font-semibold text-warm-brown">{nextVaccination.vaccineName} — {formatDate(nextVaccination.recommendedDate)}</p>
            ) : (
              <p className="text-warm-muted">All caught up</p>
            )}
          </div>
          <div>
            <p className="text-xs text-warm-muted mb-1">Next Milestone</p>
            {nextMilestone ? (
              <p className="font-semibold text-warm-brown">{nextMilestone.title} — {nextMilestone.targetAgeRange}</p>
            ) : (
              <p className="text-warm-muted">All tracked milestones achieved</p>
            )}
          </div>
        </div>
      </Card>

      {/* Growth Summary */}
      <Card padding="lg" className="bg-white space-y-4">
        <SectionHeader
          icon={<Ruler className="w-5 h-5 text-sandal-600" />}
          title="Growth Summary"
          viewAllHref="/mother/growth-milestones"
          viewAllLabel="View Full Growth Chart"
        />
        {recentMeasurements.length === 0 ? (
          <EmptyState icon={Ruler} title="No growth measurements yet" description="Weight and height readings will appear here." />
        ) : (
          <div className="space-y-3">
            {recentMeasurements.map((measurement) => (
              <MeasurementCard
                key={measurement.measurementId}
                measurement={measurement}
                previous={getPreviousMeasurement(mockMother.id, measurement, measurements)}
                onView={setViewingMeasurement}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Developmental Milestones */}
      <Card padding="lg" className="bg-white space-y-4">
        <SectionHeader
          icon={<Sparkles className="w-5 h-5 text-sandal-600" />}
          title="Developmental Milestones"
          viewAllHref="/mother/growth-milestones"
          viewAllLabel="View All Milestones"
        />
        {dueSoonMilestones.length === 0 ? (
          <EmptyState icon={Sparkles} title="All milestones achieved" description="New milestones will appear here as they become relevant for his age." />
        ) : (
          <div className="space-y-3">
            {dueSoonMilestones.map((milestone) => (
              <MilestoneCard
                key={milestone.milestoneId}
                milestone={milestone}
                onView={setViewingMilestone}
                onMarkAchieved={handleMarkMilestoneAchieved}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Vaccination Status */}
      <Card padding="lg" className="bg-white space-y-4">
        <SectionHeader
          icon={<Syringe className="w-5 h-5 text-sandal-600" />}
          title="Vaccination Status"
          viewAllHref="/mother/vaccinations"
          viewAllLabel="View Full Record"
        />
        {dueOrUpcomingVaccinations.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Fully up to date" description="All scheduled vaccinations have been completed." />
        ) : (
          <div className="space-y-3">
            {dueOrUpcomingVaccinations.map((vaccination) => (
              <VaccinationCard
                key={vaccination.vaccinationId}
                vaccination={vaccination}
                onView={setViewingVaccination}
                onToggleReminder={handleToggleVaccinationReminder}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Medications */}
      <Card padding="lg" className="bg-white space-y-4">
        <SectionHeader
          icon={<Pill className="w-5 h-5 text-sandal-600" />}
          title="Medications"
          viewAllHref="/mother/medications"
          viewAllLabel="Manage Medications"
        />
        {medications.length === 0 ? (
          <EmptyState icon={Pill} title="No medications on record" description="Any medications prescribed for him will appear here." />
        ) : (
          <div className="space-y-3">
            {medications.map((medication) => (
              <MedicationCard key={medication.medicationId} medication={medication} onView={setViewingMedication} />
            ))}
          </div>
        )}
      </Card>

      {/* Reports */}
      <Card padding="lg" className="bg-white space-y-4">
        <SectionHeader
          icon={<FileText className="w-5 h-5 text-sandal-600" />}
          title="Reports"
          viewAllHref="/mother/documents"
          viewAllLabel="View All Reports"
        />
        {reports.length === 0 ? (
          <EmptyState icon={FileText} title="No reports yet" description="Newborn screening and pediatric reports will appear here." />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} variant="interactive" className="hover:shadow-warm-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-warm-brown">{report.name}</h4>
                      <Badge
                        variant={report.status === 'COMPLETED' ? 'sage' : report.status === 'PENDING' ? 'danger' : 'sandal'}
                        size="sm"
                      >
                        {report.status === 'COMPLETED' ? 'Completed' : report.status === 'PENDING' ? 'Pending' : 'Upcoming'}
                      </Badge>
                    </div>
                    <p className="text-sm text-warm-muted mt-1">{report.doctor} • {formatDate(report.date)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setViewingReport(report)} className="shrink-0">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      {viewingMeasurement && (
        <MeasurementDetailsModal
          measurement={viewingMeasurement}
          previous={getPreviousMeasurement(mockMother.id, viewingMeasurement, measurements)}
          onClose={() => setViewingMeasurement(null)}
        />
      )}

      {viewingMilestone && (
        <MilestoneDetailsModal
          milestone={viewingMilestone}
          onClose={() => setViewingMilestone(null)}
          onMarkAchieved={handleMarkMilestoneAchieved}
        />
      )}

      {viewingVaccination && (
        <VaccinationDetailsModal
          vaccination={viewingVaccination}
          onClose={() => setViewingVaccination(null)}
          onToggleReminder={handleToggleVaccinationReminder}
        />
      )}

      {viewingMedication && (
        <MedicationDetailsModal medication={viewingMedication} onClose={() => setViewingMedication(null)} />
      )}

      {viewingReport && (
        <ReportDetailsModal
          report={viewingReport}
          onClose={() => setViewingReport(null)}
          onDownload={handleDownloadReport}
        />
      )}
    </div>
  );
};
