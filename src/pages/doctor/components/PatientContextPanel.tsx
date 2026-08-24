import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarClock, ClipboardList, Stethoscope, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockDoctor, mockHospital } from '@/data/mockData';
import { getAppointmentsForPatient, getRecommendationsForPatient } from '@/data/doctorPatientsMockData';
import { AssignedPatient } from '@/types';
import {
  getPatientStageSummary,
  getRiskBadgeVariant,
  getStatusBadgeVariant,
  getStatusLabel,
} from '@/pages/doctor/doctorUi';

export interface PatientContextPanelProps {
  patient: AssignedPatient;
}

export const PatientContextPanel: React.FC<PatientContextPanelProps> = ({ patient }) => {
  const upcomingAppointment = getAppointmentsForPatient(patient.patientId)
    .filter((a) => a.status === 'upcoming')
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];

  const activeRecommendation = getRecommendationsForPatient(patient.patientId).find((r) => r.active);

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
        <User className="w-4 h-4 text-sandal-600" />
        <h3 className="font-display text-base font-bold text-warm-brown">Patient Context</h3>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-warm-brown">{patient.name}</p>
        <p className="text-xs text-warm-muted">{getPatientStageSummary(patient)}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant={getStatusBadgeVariant(patient.status)} size="sm">{getStatusLabel(patient.status)}</Badge>
          <Badge variant={getRiskBadgeVariant(patient.riskLevel)} size="sm">{patient.riskLevel} Risk</Badge>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-sandal-100/70 text-xs">
        <div className="flex items-start gap-2">
          <Stethoscope className="w-3.5 h-3.5 text-sandal-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-warm-muted">Assigned Doctor</p>
            <p className="font-medium text-warm-brown">{mockDoctor.name} (You)</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Building2 className="w-3.5 h-3.5 text-sandal-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-warm-muted">Hospital</p>
            <p className="font-medium text-warm-brown">{mockHospital.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <CalendarClock className="w-3.5 h-3.5 text-sandal-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-warm-muted">Upcoming Appointment</p>
            <p className="font-medium text-warm-brown">
              {upcomingAppointment ? `${upcomingAppointment.type} • ${upcomingAppointment.date}` : 'None scheduled'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ClipboardList className="w-3.5 h-3.5 text-sandal-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-warm-muted">Care Plan Status</p>
            <p className="font-medium text-warm-brown">
              {activeRecommendation ? activeRecommendation.title : 'No active recommendation'}
            </p>
          </div>
        </div>
      </div>

      <Link to={`/doctor/patients/${patient.patientId}`}>
        <Button variant="outline" size="sm" fullWidth>View Full Patient Record</Button>
      </Link>
    </Card>
  );
};
