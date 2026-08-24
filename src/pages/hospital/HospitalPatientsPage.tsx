import React, { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRightLeft, Filter, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { CreateReferralInput, createReferral, getHospitalPatients } from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { ReferralFormModal } from '@/pages/hospital/components/ReferralFormModal';
import {
  CARE_TYPE_LABELS,
  PATIENT_STATUS_LABELS,
  getPatientStatusBadgeVariant,
  getRiskBadgeVariant,
} from '@/pages/hospital/hospitalUi';
import { HospitalCareType, PatientCareStatus, PatientRiskLevel } from '@/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...(Object.keys(PATIENT_STATUS_LABELS) as PatientCareStatus[]).map((value) => ({ value, label: PATIENT_STATUS_LABELS[value] })),
];

const CARE_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Care Types' },
  ...(Object.keys(CARE_TYPE_LABELS) as HospitalCareType[]).map((value) => ({ value, label: CARE_TYPE_LABELS[value] })),
];

const RISK_OPTIONS = [
  { value: 'ALL', label: 'All Risk Levels' },
  { value: 'LOW', label: 'Low' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'HIGH', label: 'High' },
];

export const HospitalPatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [status, setStatus] = useState<'ALL' | PatientCareStatus>('ALL');
  const [careType, setCareType] = useState<'ALL' | HospitalCareType>('ALL');
  const [riskLevel, setRiskLevel] = useState<'ALL' | PatientRiskLevel>('ALL');
  const [referralMotherId, setReferralMotherId] = useState<string | null>(null);

  const fetcher = useCallback(
    () =>
      getHospitalPatients({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        careType: careType === 'ALL' ? undefined : careType,
        riskLevel: riskLevel === 'ALL' ? undefined : riskLevel,
      }),
    [search, status, careType, riskLevel]
  );
  const [state, reload] = useAsyncData(fetcher, [search, status, careType, riskLevel]);

  const handleCreateReferral = async (input: CreateReferralInput) => {
    await createReferral(input);
    setReferralMotherId(null);
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients & Mothers"
        subtitle="Manage mothers receiving care at this facility."
        badge={<Badge variant="sandal">{state.status === 'success' ? state.data.length : '—'} Patients</Badge>}
      />

      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Search & Filter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
              <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value as 'ALL' | PatientCareStatus)} options={STATUS_OPTIONS} />
            <Select value={careType} onChange={(e) => setCareType(e.target.value as 'ALL' | HospitalCareType)} options={CARE_TYPE_OPTIONS} />
            <Select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as 'ALL' | PatientRiskLevel)} options={RISK_OPTIONS} />
          </div>
        </div>
      </Card>

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading patients…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={Users} title="No patients found" description="No patients match this search or filter." />
      ) : (
        <div className="space-y-3">
          {state.data.map((patient) => (
            <Card key={patient.id} variant="interactive" className="hover:shadow-warm-md">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-warm-brown">{patient.motherName}</h4>
                    <span className="text-xs text-warm-muted">{patient.id}</span>
                    <Badge variant={getPatientStatusBadgeVariant(patient.status)} size="sm">{PATIENT_STATUS_LABELS[patient.status]}</Badge>
                    <Badge variant={getRiskBadgeVariant(patient.riskLevel)} size="sm">{patient.riskLevel} Risk</Badge>
                  </div>
                  <p className="text-sm text-warm-muted mt-1">
                    Age {patient.age} • {CARE_TYPE_LABELS[patient.careType]} • Dr. {patient.doctorName}
                  </p>
                  <p className="text-xs text-warm-muted mt-1">
                    Admitted {formatDate(patient.admissionDate)}
                    {patient.bedLabel ? ` • Bed ${patient.bedLabel}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/hospital/patients/${patient.id}`)}>
                    View Record
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                    onClick={() => setReferralMotherId(patient.motherId)}
                  >
                    Create Referral
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ReferralFormModal
        isOpen={!!referralMotherId}
        initialMotherId={referralMotherId || undefined}
        onClose={() => setReferralMotherId(null)}
        onSubmit={handleCreateReferral}
      />
    </div>
  );
};
