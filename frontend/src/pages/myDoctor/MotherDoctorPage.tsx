import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Building2,
  CalendarClock,
  CalendarPlus,
  Clock,
  FileText,
  Globe2,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Toast } from '@/components/ui/Toast';
import { formatDate } from '@/utils/formatters';
import { mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import {
  doctorProfileExtras,
  getCareTeamForDoctorHospital,
  getConsultationLogsForMother,
  getDoctorContactOptions,
  getNextAppointmentWithDoctor,
  isAssignedDoctor,
} from '@/data/motherDoctorMockData';
import { APPOINTMENT_CATEGORY_LABELS } from '@/data/motherAppointmentsMockData';
import {
  getAppointmentCategoryIcon,
  getMotherAppointmentStatusBadgeVariant,
  getMotherAppointmentStatusLabel,
} from '@/pages/appointments/motherAppointmentUi';
import { CareTeamMemberCard } from '@/pages/myHospital/components/CareTeamMemberCard';
import { DoctorContactOption } from '@/types';
import * as messageService from '@/services/messageService';
import { DoctorContactCard } from './components/DoctorContactCard';
import { MessageDoctorModal } from './components/MessageDoctorModal';
import { ConsultationLogItem } from './components/ConsultationLogItem';

export const MotherDoctorPage: React.FC = () => {
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type?: 'success' | 'error' } | null>(null);

  const contactOptions = useMemo(() => getDoctorContactOptions(mockDoctor.id), []);
  const careTeam = useMemo(() => getCareTeamForDoctorHospital(mockHospital.id), []);
  const consultationLogs = useMemo(() => getConsultationLogsForMother(mockMother.id), []);
  const nextAppointment = useMemo(
    () => getNextAppointmentWithDoctor(mockMother.id, mockDoctor.id),
    []
  );
  const assigned = isAssignedDoctor(mockMother.id, mockDoctor.id);
  const primaryTeamMember = careTeam.find((m) => m.isPrimaryDoctor);
  const otherTeamMembers = careTeam.filter((m) => !m.isPrimaryDoctor);

  const handleContactAction = (option: DoctorContactOption) => {
    if (option.type === 'CALL' || option.type === 'EMERGENCY') {
      if (option.value) {
        window.location.href = `tel:${option.value.replace(/\s+/g, '')}`;
      }
      return;
    }
    if (option.type === 'MESSAGE') {
      setMessageModalOpen(true);
      return;
    }
    if (option.type === 'VIDEO_CONSULT') {
      setToast({
        title: 'Video consultation requested',
        message: "Your care team will confirm a slot and notify you once it's scheduled.",
      });
    }
  };

  const handleMessageSent = async (messageText: string) => {
    try {
      const conversation = await messageService.startConversationWithMyDoctor();
      await messageService.sendMessage(conversation.conversationId, messageText);
      setToast({
        title: 'Message sent',
        message: `Your message has been sent to ${conversation.patientName}'s care team.`,
      });
    } catch (error) {
      setToast({
        title: 'Message not sent',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const CategoryIcon = nextAppointment ? getAppointmentCategoryIcon(nextAppointment.category) : CalendarClock;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Doctor"
        subtitle="Your assigned doctor's profile, care team, and the ways you can reach them."
        badge={assigned && <Badge variant="sage">Assigned Doctor</Badge>}
      />

      {/* Doctor Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card padding="lg" className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-sandal-100">
            <Avatar name={mockDoctor.name} size="xl" indicator="online" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-xl font-bold text-warm-brown">{mockDoctor.name}</h3>
                {assigned && <Badge variant="sage" size="sm">Primary Doctor</Badge>}
              </div>
              <p className="text-sm text-warm-muted">{mockDoctor.specialization}</p>
              <div className="flex flex-wrap gap-1.5">
                {doctorProfileExtras?.languagesSpoken.map((lang) => (
                  <Badge key={lang} variant="outline" size="sm">{lang}</Badge>
                ))}
              </div>
            </div>
          </div>

          {doctorProfileExtras && (
            <p className="text-sm text-warm-muted leading-relaxed">{doctorProfileExtras.bio}</p>
          )}

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-1">
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Qualification</dt>
                <dd className="font-medium text-warm-brown">{mockDoctor.qualification}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Hospital / Facility</dt>
                <dd className="font-medium text-warm-brown">{mockHospital.name}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Location</dt>
                <dd className="font-medium text-warm-brown">{mockHospital.city}, {mockHospital.state}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Globe2 className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Consultation Modes</dt>
                <dd className="font-medium text-warm-brown">
                  {doctorProfileExtras?.consultationModes.join(', ')}
                </dd>
              </div>
            </div>
          </dl>
        </Card>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
            <Stethoscope className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Your Relationship</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Status</span>
              <Badge variant={assigned ? 'sage' : 'outline'} size="sm">
                {assigned ? 'Primary / Assigned' : 'Not Assigned'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Experience</span>
              <span className="font-semibold text-warm-brown">{mockDoctor.experienceYears} years</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Care Since</span>
              <span className="font-semibold text-warm-brown">{formatDate(mockMother.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Available Days</span>
              <span className="font-semibold text-warm-brown text-right">{mockDoctor.availableDays.length} days/week</span>
            </div>
          </div>
          <Link to="/mother/hospital">
            <Button variant="outline" size="sm" fullWidth leftIcon={<Building2 className="w-4 h-4" />}>
              View Hospital Details
            </Button>
          </Link>
        </Card>
      </div>

      {/* Contact / Communication Options */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100">
          <ShieldCheck className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Contact & Communication</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contactOptions.map((option) => (
            <DoctorContactCard key={option.contactId} option={option} onAction={handleContactAction} />
          ))}
        </div>
      </Card>

      {/* Upcoming Appointment Context */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-sandal-100 flex-wrap">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-xl font-bold text-warm-brown">Upcoming with {mockDoctor.name}</h3>
          </div>
          <Link to="/mother/appointments">
            <Button variant="outline" size="sm" leftIcon={<CalendarPlus className="w-4 h-4" />}>
              View All Appointments
            </Button>
          </Link>
        </div>

        {nextAppointment ? (
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-display font-semibold text-warm-brown text-base">{nextAppointment.title}</h4>
                <Badge variant={getMotherAppointmentStatusBadgeVariant(nextAppointment.status)} size="sm">
                  {getMotherAppointmentStatusLabel(nextAppointment.status)}
                </Badge>
                <Badge variant="outline" size="sm">{APPOINTMENT_CATEGORY_LABELS[nextAppointment.category]}</Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-muted">
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-sandal-500" />
                  {formatDate(nextAppointment.date)} • {nextAppointment.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sandal-500" />
                  {nextAppointment.location}
                </span>
              </div>
              {nextAppointment.reason && (
                <p className="text-xs text-warm-muted leading-relaxed">{nextAppointment.reason}</p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="No upcoming appointments"
            description={`You have no scheduled visits with ${mockDoctor.name} right now.`}
            action={
              <Link to="/mother/appointments">
                <Button leftIcon={<CalendarPlus className="w-4 h-4" />}>Request an Appointment</Button>
              </Link>
            }
          />
        )}
      </Card>

      {/* Care Team Relationship */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100">
          <Users className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Your Care Team</h3>
          <Badge variant="sandal" size="sm">{careTeam.length} Members</Badge>
        </div>
        {careTeam.length === 0 ? (
          <EmptyState icon={Users} title="No care team assigned" description="Your care team will appear here once assigned." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {primaryTeamMember && <CareTeamMemberCard key={primaryTeamMember.memberId} member={primaryTeamMember} />}
            {otherTeamMembers.map((member) => (
              <CareTeamMemberCard key={member.memberId} member={member} />
            ))}
          </div>
        )}
      </Card>

      {/* Doctor Details / Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
            <Clock className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Clinic Timings</h3>
          </div>
          <div className="space-y-2 text-sm">
            {doctorProfileExtras?.clinicTimings.map((timing) => (
              <div
                key={timing.day}
                className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100"
              >
                <span className="text-warm-muted">{timing.day}</span>
                <span className="font-medium text-warm-brown">{timing.hours}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
            <Award className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Achievements & Credentials</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {doctorProfileExtras?.achievements.map((achievement) => (
              <Badge key={achievement} variant="peach" size="sm">{achievement}</Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Consultation History */}
      <Card padding="lg" className="space-y-1">
        <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100 mb-1">
          <FileText className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Consultation History</h3>
        </div>
        {consultationLogs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No consultation notes yet"
            description="Notes from your visits with your doctor will appear here."
          />
        ) : (
          <div>
            {consultationLogs.map((log) => (
              <ConsultationLogItem key={log.logId} log={log} />
            ))}
          </div>
        )}
      </Card>

      <MessageDoctorModal
        isOpen={isMessageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        onSent={handleMessageSent}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Toast type={toast.type ?? 'success'} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};
