import React from 'react';
import { Building2, HeartPulse, IdCard, MapPin, Phone, ShieldAlert, Stethoscope, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { QrScanPatient } from '@/services/qrService';
import { STAGE_LABELS, dateOrDash, displayOrDash } from '../qrScanUi';

// Renders exactly what the backend returned for the signed-in clinician — the
// basic care-identity summary. Shared by /doctor|hospital/scan-qr and /q.
export const PatientQrSummary: React.FC<{ patient: QrScanPatient }> = ({ patient }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-sandal-100">
        <div className="flex items-center gap-2.5">
          <IdCard className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Care Identity</h3>
        </div>
        {patient.stage && <Badge variant="sage">{STAGE_LABELS[patient.stage] ?? patient.stage}</Badge>}
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="sm:col-span-2">
          <dt className="text-xs text-warm-muted">Mother</dt>
          <dd className="font-display text-xl font-bold text-warm-brown">{patient.motherName}</dd>
        </div>
        <div>
          <dt className="text-xs text-warm-muted">MaaSuraksha ID</dt>
          <dd className="font-medium text-warm-brown tracking-wide">{patient.maaSurakshaId}</dd>
        </div>
        <div className="flex items-start gap-2">
          <HeartPulse className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
          <div>
            <dt className="text-xs text-warm-muted">Blood Group</dt>
            <dd className="font-medium text-warm-brown">{displayOrDash(patient.bloodGroup)}</dd>
          </div>
        </div>
        <div className="flex items-start gap-2 sm:col-span-2">
          <MapPin className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
          <div>
            <dt className="text-xs text-warm-muted">Location</dt>
            <dd className="font-medium text-warm-brown">{displayOrDash(patient.location)}</dd>
          </div>
        </div>
        <div>
          <dt className="text-xs text-warm-muted">Issued</dt>
          <dd className="font-medium text-warm-brown">{dateOrDash(patient.issuedDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-warm-muted">Valid Through</dt>
          <dd className="font-medium text-warm-brown">{dateOrDash(patient.validThrough)}</dd>
        </div>
      </dl>
    </Card>

    <div className="space-y-5">
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <ShieldAlert className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Emergency Contact</h3>
        </div>
        {patient.emergencyContactName ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Name</dt>
                <dd className="font-medium text-warm-brown">
                  {patient.emergencyContactName}
                  {patient.emergencyContactRelation && ` (${patient.emergencyContactRelation})`}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Phone</dt>
                <dd className="font-medium text-warm-brown">{displayOrDash(patient.emergencyContactPhone)}</dd>
              </div>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-warm-muted">No emergency contact on file.</p>
        )}
      </Card>

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <Stethoscope className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Care Assignment</h3>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Hospital / Facility</dt>
              <dd className="font-medium text-warm-brown">{displayOrDash(patient.assignedHospitalName)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Stethoscope className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
            <div>
              <dt className="text-xs text-warm-muted">Primary Doctor</dt>
              <dd className="font-medium text-warm-brown">{displayOrDash(patient.assignedDoctorName)}</dd>
            </div>
          </div>
        </dl>
      </Card>
    </div>
  </div>
);
