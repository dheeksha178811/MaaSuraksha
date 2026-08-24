import React, { useCallback, useMemo, useState } from 'react';
import { BedDouble, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { HospitalBedView, getHospitalBeds, getHospitalPatients, updateBedStatus } from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { BedStatusModal } from '@/pages/hospital/components/BedStatusModal';
import {
  BED_STATUS_LABELS,
  BED_TYPE_LABELS,
  getBedStatusBadgeVariant,
} from '@/pages/hospital/hospitalUi';
import { BedStatus, BedType } from '@/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...(Object.keys(BED_STATUS_LABELS) as BedStatus[]).map((value) => ({ value, label: BED_STATUS_LABELS[value] })),
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Bed Types' },
  ...(Object.keys(BED_TYPE_LABELS) as BedType[]).map((value) => ({ value, label: BED_TYPE_LABELS[value] })),
];

export const HospitalBedsPage: React.FC = () => {
  const [ward, setWard] = useState('ALL');
  const [bedType, setBedType] = useState<'ALL' | BedType>('ALL');
  const [status, setStatus] = useState<'ALL' | BedStatus>('ALL');
  const [selectedBed, setSelectedBed] = useState<HospitalBedView | null>(null);

  const fetcher = useCallback(async () => {
    const [beds, admittedPatients] = await Promise.all([
      getHospitalBeds({
        ward: ward === 'ALL' ? undefined : ward,
        bedType: bedType === 'ALL' ? undefined : bedType,
        status: status === 'ALL' ? undefined : status,
      }),
      getHospitalPatients({ status: 'ADMITTED' }),
    ]);
    return { beds, admittedPatients };
  }, [ward, bedType, status]);
  const [state, reload] = useAsyncData(fetcher, [ward, bedType, status]);

  const wardOptions = useMemo(() => {
    if (state.status !== 'success') return [{ value: 'ALL', label: 'All Wards' }];
    const wards = Array.from(new Set(state.data.beds.map((b) => b.ward)));
    return [{ value: 'ALL', label: 'All Wards' }, ...wards.map((w) => ({ value: w, label: w }))];
  }, [state]);

  const counts = useMemo(() => {
    if (state.status !== 'success') return null;
    const beds = state.data.beds;
    return {
      total: beds.length,
      available: beds.filter((b) => b.status === 'AVAILABLE').length,
      occupied: beds.filter((b) => b.status === 'OCCUPIED').length,
      reserved: beds.filter((b) => b.status === 'RESERVED').length,
      maintenance: beds.filter((b) => b.status === 'MAINTENANCE').length,
    };
  }, [state]);

  const handleUpdateBed = async (bedId: string, newStatus: BedStatus, patientId?: string) => {
    await updateBedStatus(bedId, newStatus, patientId);
    setSelectedBed(null);
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bed Management"
        subtitle="Live bed availability across wards at this facility."
        badge={<Badge variant="sandal">{counts ? counts.total : '—'} Beds</Badge>}
      />

      {counts && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Beds', value: counts.total },
            { label: 'Available', value: counts.available },
            { label: 'Occupied', value: counts.occupied },
            { label: 'Reserved', value: counts.reserved },
            { label: 'Maintenance', value: counts.maintenance },
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
            Filter Beds
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={ward} onChange={(e) => setWard(e.target.value)} options={wardOptions} />
            <Select value={bedType} onChange={(e) => setBedType(e.target.value as 'ALL' | BedType)} options={TYPE_OPTIONS} />
            <Select value={status} onChange={(e) => setStatus(e.target.value as 'ALL' | BedStatus)} options={STATUS_OPTIONS} />
          </div>
        </div>
      </Card>

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading beds…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.beds.length === 0 ? (
        <EmptyState icon={BedDouble} title="No beds found" description="No beds match this filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.data.beds.map((bed) => (
            <Card
              key={bed.id}
              variant="interactive"
              className="hover:shadow-warm-md space-y-2.5"
              onClick={() => setSelectedBed(bed)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-warm-brown">{bed.bedNumber}</h4>
                  <p className="text-xs text-warm-muted">{bed.ward} • {BED_TYPE_LABELS[bed.bedType]}</p>
                </div>
                <Badge variant={getBedStatusBadgeVariant(bed.status)} size="sm">{BED_STATUS_LABELS[bed.status]}</Badge>
              </div>
              {bed.patientName ? (
                <p className="text-xs text-warm-brown font-medium">Patient: {bed.patientName}</p>
              ) : (
                <p className="text-xs text-warm-muted">{bed.status === 'OCCUPIED' ? 'Patient not in your roster' : 'No patient assigned'}</p>
              )}
              <p className="text-[11px] text-warm-muted">Updated {formatDate(bed.lastUpdatedAt)}</p>
            </Card>
          ))}
        </div>
      )}

      <BedStatusModal
        isOpen={!!selectedBed}
        bed={selectedBed}
        assignablePatients={state.status === 'success' ? state.data.admittedPatients.filter((p) => !p.bedId || p.bedId === selectedBed?.id) : []}
        onClose={() => setSelectedBed(null)}
        onSubmit={handleUpdateBed}
      />
    </div>
  );
};
