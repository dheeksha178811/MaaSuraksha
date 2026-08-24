import React, { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRightLeft,
  Baby,
  BedDouble,
  CalendarClock,
  ClipboardList,
  HeartPulse,
  Stethoscope,
  User,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { mockHospital } from '@/data/mockData';
import { CreateReferralInput, createReferral, getHospitalPatientById } from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { ReferralFormModal } from '@/pages/hospital/components/ReferralFormModal';
import {
  CARE_TYPE_LABELS,
  DELIVERY_STATUS_LABELS,
  DELIVERY_TYPE_LABELS,
  NEONATAL_CARE_LEVEL_LABELS,
  NEONATAL_STATUS_LABELS,
  PATIENT_STATUS_LABELS,
  REFERRAL_STATUS_LABELS,
  getDeliveryStatusBadgeVariant,
  getNeonatalStatusBadgeVariant,
  getPatientStatusBadgeVariant,
  getReferralStatusBadgeVariant,
  getRiskBadgeVariant,
} from '@/pages/hospital/hospitalUi';

export const HospitalPatientDetailPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [referralOpen, setReferralOpen] = useState(false);

  const fetcher = useCallback(() => (patientId ? getHospitalPatientById(patientId) : Promise.resolve(undefined)), [patientId]);
  const [state, reload] = useAsyncData(fetcher, [patientId]);

  const handleCreateReferral = async (input: CreateReferralInput) => {
    await createReferral(input);
    setReferralOpen(false);
    reload();
  };

  if (state.status !== 'success') {
    return (
      <div className="space-y-6">
        <PageHeader title="Patient Record" subtitle={mockHospital.facilityName} />
        <AsyncStateView status={state.status} loadingLabel="Loading patient record…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      </div>
    );
  }

  const patient = state.data;

  if (!patient) {
    return (
      <div className="space-y-6">
        <PageHeader title="Patient Not Found" subtitle="This patient could not be located in this facility's registry." />
        <EmptyState
          icon={User}
          title="Patient record not found"
          description="This patient may not be admitted to this facility, or the record no longer exists."
          action={<Link to="/hospital/patients"><Button variant="primary">Back to Patients</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.motherName}
        subtitle={`${patient.id} • ${CARE_TYPE_LABELS[patient.careType]}`}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant={getPatientStatusBadgeVariant(patient.status)}>{PATIENT_STATUS_LABELS[patient.status]}</Badge>
            <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>{patient.riskLevel} Risk</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/hospital/patients">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Patients</Button>
            </Link>
            <Button size="sm" leftIcon={<ArrowRightLeft className="w-4 h-4" />} onClick={() => setReferralOpen(true)}>
              Create Referral
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card padding="lg" className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
            <User className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Basic Information</h3>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-warm-muted">Age</dt>
              <dd className="font-medium text-warm-brown">{patient.age}</dd>
            </div>
            <div>
              <dt className="text-xs text-warm-muted">Assigned Doctor</dt>
              <dd className="font-medium text-warm-brown">{patient.doctorName}</dd>
            </div>
            <div>
              <dt className="text-xs text-warm-muted">Admission Date</dt>
              <dd className="font-medium text-warm-brown">{formatDate(patient.admissionDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-warm-muted">Discharge Date</dt>
              <dd className="font-medium text-warm-brown">{patient.dischargeDate ? formatDate(patient.dischargeDate) : 'Not discharged'}</dd>
            </div>
            <div>
              <dt className="text-xs text-warm-muted">Ward</dt>
              <dd className="font-medium text-warm-brown">{patient.ward}</dd>
            </div>
            <div>
              <dt className="text-xs text-warm-muted">Bed</dt>
              <dd className="font-medium text-warm-brown">{patient.bedLabel || 'Not assigned'}</dd>
            </div>
          </dl>
        </Card>

        <Card padding="lg" className="space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
            <Stethoscope className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Care Status</h3>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100 text-sm">
            <span className="text-warm-muted">Care Type</span>
            <span className="font-semibold text-warm-brown">{CARE_TYPE_LABELS[patient.careType]}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100 text-sm">
            <span className="text-warm-muted">Facility</span>
            <span className="font-semibold text-warm-brown">{mockHospital.facilityName}</span>
          </div>
        </Card>
      </div>

      {/* Deliveries */}
      <Card padding="lg" className="space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <Baby className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Deliveries</h3>
        </div>
        {patient.deliveries.length === 0 ? (
          <p className="text-sm text-warm-muted py-2">No delivery records for this patient.</p>
        ) : (
          <div className="space-y-2.5">
            {patient.deliveries.map((d) => (
              <div key={d.id} className="p-3 rounded-xl bg-warm-ivory border border-sandal-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-warm-brown">{DELIVERY_TYPE_LABELS[d.deliveryType]}</span>
                    <Badge variant={getDeliveryStatusBadgeVariant(d.status)} size="sm">{DELIVERY_STATUS_LABELS[d.status]}</Badge>
                  </div>
                  <p className="text-xs text-warm-muted mt-1">{d.maternalOutcome}</p>
                </div>
                <div className="text-xs text-warm-muted sm:text-right shrink-0">
                  {formatDate(d.deliveryDate)} • {d.deliveryTime}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Neonatal */}
      <Card padding="lg" className="space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <HeartPulse className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Neonatal Information</h3>
        </div>
        {patient.neonatalRecords.length === 0 ? (
          <p className="text-sm text-warm-muted py-2">No neonatal records for this patient.</p>
        ) : (
          <div className="space-y-2.5">
            {patient.neonatalRecords.map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-warm-ivory border border-sandal-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-warm-brown">{NEONATAL_CARE_LEVEL_LABELS[n.careLevel]}</span>
                    <Badge variant={getNeonatalStatusBadgeVariant(n.status)} size="sm">{NEONATAL_STATUS_LABELS[n.status]}</Badge>
                  </div>
                  <p className="text-xs text-warm-muted mt-1">
                    Born {formatDate(n.dateOfBirth)} • {n.birthWeightKg} kg • {n.gestationalAge}w gestation
                  </p>
                </div>
                {n.bedId && (
                  <div className="flex items-center gap-1.5 text-xs text-warm-muted shrink-0">
                    <BedDouble className="w-3.5 h-3.5" />
                    {n.bedId}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Referrals */}
      <Card padding="lg" className="space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <ArrowRightLeft className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Referrals</h3>
        </div>
        {patient.referrals.length === 0 ? (
          <p className="text-sm text-warm-muted py-2">No referrals for this patient.</p>
        ) : (
          <div className="space-y-2.5">
            {patient.referrals.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-warm-ivory border border-sandal-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-warm-brown">{r.toHospitalName}</span>
                  <Badge variant={getReferralStatusBadgeVariant(r.status)} size="sm">{REFERRAL_STATUS_LABELS[r.status]}</Badge>
                </div>
                <p className="text-xs text-warm-muted mt-1">{r.reason}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Activity */}
      <Card padding="lg" className="space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <CalendarClock className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Recent Activity</h3>
        </div>
        {patient.activity.length === 0 ? (
          <p className="text-sm text-warm-muted py-2">No recent activity logged for this patient.</p>
        ) : (
          <div className="space-y-2">
            {patient.activity.map((a) => (
              <div key={a.id} className="flex items-start gap-2 text-sm">
                <ClipboardList className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <p className="text-warm-brown">{a.description}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ReferralFormModal
        isOpen={referralOpen}
        initialMotherId={patient.motherId}
        onClose={() => setReferralOpen(false)}
        onSubmit={handleCreateReferral}
      />
    </div>
  );
};
