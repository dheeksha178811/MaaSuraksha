import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Filter, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { getFacilities } from '@/services/adminService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { FACILITY_STATUS_LABELS, FACILITY_TYPE_LABELS, getFacilityStatusBadgeVariant } from '@/pages/admin/adminUi';
import { FacilityType, HospitalOperationalStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...(Object.keys(FACILITY_STATUS_LABELS) as HospitalOperationalStatus[]).map((value) => ({ value, label: FACILITY_STATUS_LABELS[value] })),
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Facility Types' },
  ...(Object.keys(FACILITY_TYPE_LABELS) as FacilityType[]).map((value) => ({ value, label: FACILITY_TYPE_LABELS[value] })),
];

export const AdminFacilitiesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | HospitalOperationalStatus>('ALL');
  const [facilityType, setFacilityType] = useState<'ALL' | FacilityType>('ALL');

  const fetcher = useCallback(
    () =>
      getFacilities({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        facilityType: facilityType === 'ALL' ? undefined : facilityType,
      }),
    [search, status, facilityType]
  );
  const [state, reload] = useAsyncData(fetcher, [search, status, facilityType]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facilities"
        subtitle="Directory of registered hospitals and facility performance tracking."
        badge={<Badge variant="sandal">{state.status === 'success' ? state.data.length : '—'} Facilities</Badge>}
      />

      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Search & Filter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
              <Input placeholder="Search by name or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value as 'ALL' | HospitalOperationalStatus)} options={STATUS_OPTIONS} />
            <Select value={facilityType} onChange={(e) => setFacilityType(e.target.value as 'ALL' | FacilityType)} options={TYPE_OPTIONS} />
          </div>
        </div>
      </Card>

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading facilities…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={Building2} title="No facilities found" description="No facilities match this search or filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.data.map((facility) => (
            <Link key={facility.id} to={`/admin/facilities/${facility.id}`}>
              <Card variant="interactive" className="hover:shadow-warm-md h-full space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display font-semibold text-warm-brown truncate">{facility.name}</h4>
                      <p className="text-xs text-warm-muted truncate">{facility.city}, {facility.state}</p>
                    </div>
                  </div>
                  <Badge variant={getFacilityStatusBadgeVariant(facility.status)} size="sm">{FACILITY_STATUS_LABELS[facility.status]}</Badge>
                </div>
                <p className="text-xs text-warm-muted">{FACILITY_TYPE_LABELS[facility.facilityType]}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sandal-100/60 text-center">
                  <div>
                    <p className="text-sm font-bold text-warm-brown">{facility.registeredMothers}</p>
                    <p className="text-[10px] text-warm-muted">Mothers</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-warm-brown">{facility.availableBeds}/{facility.totalBeds}</p>
                    <p className="text-[10px] text-warm-muted">Beds Avail.</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-warm-brown">{facility.highRiskCases}</p>
                    <p className="text-[10px] text-warm-muted">High-Risk</p>
                  </div>
                </div>
                <p className="text-[11px] text-warm-muted">Last reported {formatDate(facility.lastReportedAt.slice(0, 10))}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
