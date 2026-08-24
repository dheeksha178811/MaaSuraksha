import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CalendarClock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { AssignedPatient } from '@/types';
import { getAppointmentsForPatient } from '@/data/doctorPatientsMockData';
import {
  getPatientStageSummary,
  getRiskBadgeVariant,
  getStatusBadgeVariant,
  getStatusLabel,
} from '@/pages/doctor/doctorUi';

export interface PatientCardProps {
  patient: AssignedPatient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const navigate = useNavigate();
  const nextAppointment = getAppointmentsForPatient(patient.patientId)
    .filter((a) => a.status === 'upcoming')
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];

  return (
    <Card
      variant="interactive"
      padding="md"
      onClick={() => navigate(`/doctor/patients/${patient.patientId}`)}
      className="space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={patient.name} size="md" />
          <div className="min-w-0">
            <h4 className="font-display font-semibold text-warm-brown truncate">{patient.name}</h4>
            <p className="text-xs text-warm-muted truncate">{getPatientStageSummary(patient)}</p>
          </div>
        </div>
        <Badge variant={patient.stage === 'ANTENATAL' ? 'sandal' : 'sage'} size="sm">
          {patient.stage === 'ANTENATAL' ? 'Antenatal' : 'Postnatal'}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={getStatusBadgeVariant(patient.status)} size="sm">
          {getStatusLabel(patient.status)}
        </Badge>
        <Badge variant={getRiskBadgeVariant(patient.riskLevel)} size="sm">
          {patient.riskLevel} Risk
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-sandal-100/60">
        <div className="flex items-center gap-1.5 text-xs text-warm-muted min-w-0">
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {nextAppointment
              ? `Next: ${nextAppointment.date} • ${nextAppointment.time}`
              : 'No upcoming appointment'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/doctor/patients/${patient.patientId}`);
          }}
        >
          View
        </Button>
      </div>
    </Card>
  );
};
