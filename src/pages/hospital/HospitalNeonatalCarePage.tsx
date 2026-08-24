import React, { useCallback, useMemo, useState } from 'react';
import { HeartPulse, Filter, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { getNeonatalRecords } from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import {
  NEONATAL_CARE_LEVEL_LABELS,
  NEONATAL_STATUS_LABELS,
  getNeonatalStatusBadgeVariant,
} from '@/pages/hospital/hospitalUi';
import { NeonatalCareLevel, NeonatalStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...(Object.keys(NEONATAL_STATUS_LABELS) as NeonatalStatus[]).map((value) => ({ value, label: NEONATAL_STATUS_LABELS[value] })),
];

const CARE_LEVEL_OPTIONS = [
  { value: 'ALL', label: 'All Care Levels' },
  ...(Object.keys(NEONATAL_CARE_LEVEL_LABELS) as NeonatalCareLevel[]).map((value) => ({ value, label: NEONATAL_CARE_LEVEL_LABELS[value] })),
];

export const HospitalNeonatalCarePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | NeonatalStatus>('ALL');
  const [careLevel, setCareLevel] = useState<'ALL' | NeonatalCareLevel>('ALL');

  const fetcher = useCallback(
    () =>
      getNeonatalRecords({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        careLevel: careLevel === 'ALL' ? undefined : careLevel,
      }),
    [search, status, careLevel]
  );
  const [state, reload] = useAsyncData(fetcher, [search, status, careLevel]);

  const summary = useMemo(() => {
    if (state.status !== 'success') return null;
    const records = state.data;
    return {
      admissions: records.length,
      nicu: records.filter((r) => r.careLevel === 'NICU').length,
      stable: records.filter((r) => r.status === 'STABLE').length,
      observation: records.filter((r) => r.status === 'OBSERVATION').length,
      critical: records.filter((r) => r.status === 'CRITICAL').length,
    };
  }, [state]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Neonatal Care"
        subtitle="Newborns receiving hospital care at this facility."
        badge={<Badge variant="sandal">{summary ? summary.admissions : '—'} Records</Badge>}
      />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Neonatal Admissions', value: summary.admissions },
            { label: 'NICU Occupancy', value: summary.nicu },
            { label: 'Stable', value: summary.stable },
            { label: 'Observation', value: summary.observation },
            { label: 'Critical', value: summary.critical },
          ].map((s) => (
            <Card key={s.label} className="bg-white text-center">
              <p className="text-2xl font-bold text-warm-brown">{s.value}</p>
              <p className="text-xs text-warm-muted mt-1">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Search & Filter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
              <Input placeholder="Search by mother or baby ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value as 'ALL' | NeonatalStatus)} options={STATUS_OPTIONS} />
            <Select value={careLevel} onChange={(e) => setCareLevel(e.target.value as 'ALL' | NeonatalCareLevel)} options={CARE_LEVEL_OPTIONS} />
          </div>
        </div>
      </Card>

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading neonatal records…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={HeartPulse} title="No neonatal records found" description="No newborns match this search or filter." />
      ) : (
        <div className="space-y-3">
          {state.data.map((record) => (
            <Card key={record.id} className="hover:shadow-warm-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-warm-brown">{record.id}</h4>
                    <span className="text-xs text-warm-muted">Mother: {record.motherName}</span>
                    <Badge variant={getNeonatalStatusBadgeVariant(record.status)} size="sm">{NEONATAL_STATUS_LABELS[record.status]}</Badge>
                    <Badge variant="outline" size="sm">{NEONATAL_CARE_LEVEL_LABELS[record.careLevel]}</Badge>
                  </div>
                  <p className="text-sm text-warm-muted mt-1 capitalize">
                    {record.gender} • {record.birthWeightKg} kg • {record.gestationalAge}w gestation
                  </p>
                  {record.bedLabel && <p className="text-xs text-warm-muted mt-1">Bed {record.bedLabel}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-warm-brown">Born {formatDate(record.dateOfBirth)}</p>
                  <p className="text-xs text-warm-muted">Admitted {formatDate(record.admissionDate)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
