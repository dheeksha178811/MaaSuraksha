import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Baby, CalendarPlus, Filter, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { CreateDeliveryInput, createDeliveryRecord, getDeliveryRecords } from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { DeliveryFormModal } from '@/pages/hospital/components/DeliveryFormModal';
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_TYPE_LABELS,
  getDeliveryStatusBadgeVariant,
} from '@/pages/hospital/hospitalUi';
import { DeliveryStatus, DeliveryType } from '@/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...(Object.keys(DELIVERY_STATUS_LABELS) as DeliveryStatus[]).map((value) => ({ value, label: DELIVERY_STATUS_LABELS[value] })),
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Types' },
  ...(Object.keys(DELIVERY_TYPE_LABELS) as DeliveryType[]).map((value) => ({ value, label: DELIVERY_TYPE_LABELS[value] })),
];

export const HospitalDeliveriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | DeliveryStatus>('ALL');
  const [deliveryType, setDeliveryType] = useState<'ALL' | DeliveryType>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const fetcher = useCallback(
    () =>
      getDeliveryRecords({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        deliveryType: deliveryType === 'ALL' ? undefined : deliveryType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
    [search, status, deliveryType, dateFrom, dateTo]
  );
  const [state, reload] = useAsyncData(fetcher, [search, status, deliveryType, dateFrom, dateTo]);

  const handleCreate = async (input: CreateDeliveryInput) => {
    await createDeliveryRecord(input);
    setFormOpen(false);
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Registry"
        subtitle="Institutional delivery records for this facility."
        badge={<Badge variant="sandal">{state.status === 'success' ? state.data.length : '—'} Records</Badge>}
        actions={
          <Button leftIcon={<CalendarPlus className="w-4 h-4" />} onClick={() => setFormOpen(true)}>
            Record Delivery
          </Button>
        }
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
              <Input placeholder="Search by mother name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value as 'ALL' | DeliveryStatus)} options={STATUS_OPTIONS} />
            <Select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as 'ALL' | DeliveryType)} options={TYPE_OPTIONS} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" aria-label="From date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <Input type="date" aria-label="To date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>
      </Card>

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading deliveries…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={Baby} title="No deliveries found" description="No delivery records match this search or filter." />
      ) : (
        <div className="space-y-3">
          {state.data.map((d) => (
            <Card key={d.id} variant="interactive" className="hover:shadow-warm-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-warm-brown">{d.motherName}</h4>
                    <span className="text-xs text-warm-muted">{d.id}</span>
                    <Badge variant={getDeliveryStatusBadgeVariant(d.status)} size="sm">{DELIVERY_STATUS_LABELS[d.status]}</Badge>
                  </div>
                  <p className="text-sm text-warm-muted mt-1">
                    {DELIVERY_TYPE_LABELS[d.deliveryType]} • Dr. {d.doctorName} • {d.babyCount} {d.babyCount === 1 ? 'baby' : 'babies'} • {d.gestationalAge}w
                  </p>
                  <p className="text-xs text-sandal-700 italic mt-1">{d.maternalOutcome}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-warm-brown">{formatDate(d.deliveryDate)}</p>
                  <p className="text-xs text-warm-muted">{d.deliveryTime}</p>
                </div>
              </div>
              <div className="flex justify-end pt-2 mt-2 border-t border-sandal-100/60">
                <Button size="sm" variant="ghost" onClick={() => navigate(`/hospital/patients?search=${encodeURIComponent(d.motherName)}`)}>
                  View Mother
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DeliveryFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
    </div>
  );
};
