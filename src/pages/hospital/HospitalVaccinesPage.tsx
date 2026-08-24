import React, { useCallback, useMemo, useState } from 'react';
import { Filter, PackagePlus, Search, Syringe, Thermometer } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { HOSPITAL_TODAY_ISO } from '@/data/hospitalMockData';
import {
  ReceiveVaccineStockInput,
  adjustVaccineQuantity,
  getVaccineInventory,
  receiveVaccineStock,
  updateVaccineInventoryStatus,
} from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { VaccineReceiveStockModal } from '@/pages/hospital/components/VaccineReceiveStockModal';
import { VaccineAdjustQuantityModal } from '@/pages/hospital/components/VaccineAdjustQuantityModal';
import { VaccineBatchDetailsModal } from '@/pages/hospital/components/VaccineBatchDetailsModal';
import {
  TEMPERATURE_STATUS_LABELS,
  VACCINE_STATUS_LABELS,
  getTemperatureStatusBadgeVariant,
  getVaccineStatusBadgeVariant,
} from '@/pages/hospital/hospitalUi';
import { VaccineInventoryItem, VaccineInventoryStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...(Object.keys(VACCINE_STATUS_LABELS) as VaccineInventoryStatus[]).map((value) => ({ value, label: VACCINE_STATUS_LABELS[value] })),
];

const EXPIRING_SOON_DAYS = 30;

export const HospitalVaccinesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | VaccineInventoryStatus>('ALL');
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<VaccineInventoryItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<VaccineInventoryItem | null>(null);

  const fetcher = useCallback(
    () => getVaccineInventory({ search: search || undefined, status: status === 'ALL' ? undefined : status }),
    [search, status]
  );
  const [state, reload] = useAsyncData(fetcher, [search, status]);

  const summary = useMemo(() => {
    if (state.status !== 'success') return null;
    const items = state.data;
    const expiringSoonCutoff = new Date(HOSPITAL_TODAY_ISO);
    expiringSoonCutoff.setDate(expiringSoonCutoff.getDate() + EXPIRING_SOON_DAYS);
    return {
      totalBatches: items.length,
      totalDoses: items.reduce((sum, i) => sum + i.quantityAvailable, 0),
      expiringSoon: items.filter((i) => i.status !== 'EXPIRED' && new Date(i.expiryDate) <= expiringSoonCutoff).length,
      lowStock: items.filter((i) => i.status === 'LOW_STOCK').length,
      tempAlerts: items.filter((i) => i.temperatureStatus !== 'NORMAL').length,
    };
  }, [state]);

  const handleReceive = async (input: ReceiveVaccineStockInput) => {
    await receiveVaccineStock(input);
    setReceiveOpen(false);
    reload();
  };

  const handleAdjust = async (id: string, quantity: number) => {
    await adjustVaccineQuantity(id, quantity);
    setAdjustItem(null);
    reload();
  };

  const handleToggleQuarantine = async (item: VaccineInventoryItem) => {
    await updateVaccineInventoryStatus(item.id, item.status === 'QUARANTINED' ? 'AVAILABLE' : 'QUARANTINED');
    setDetailsItem(null);
    reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vaccines & Cold Chain"
        subtitle="Cold-chain vaccine batch and inventory management for this facility."
        badge={<Badge variant="sandal">{summary ? summary.totalBatches : '—'} Batches</Badge>}
        actions={
          <Button leftIcon={<PackagePlus className="w-4 h-4" />} onClick={() => setReceiveOpen(true)}>
            Receive Stock
          </Button>
        }
      />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Batches', value: summary.totalBatches },
            { label: 'Available Doses', value: summary.totalDoses },
            { label: 'Expiring Soon', value: summary.expiringSoon },
            { label: 'Low Stock', value: summary.lowStock },
            { label: 'Temperature Alerts', value: summary.tempAlerts },
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted" />
              <Input placeholder="Search by vaccine or batch..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value as 'ALL' | VaccineInventoryStatus)} options={STATUS_OPTIONS} />
          </div>
        </div>
      </Card>

      {state.status !== 'success' ? (
        <AsyncStateView status={state.status} loadingLabel="Loading vaccine inventory…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      ) : state.data.length === 0 ? (
        <EmptyState icon={Syringe} title="No vaccine batches found" description="No batches match this search or filter." />
      ) : (
        <div className="space-y-3">
          {state.data.map((item) => (
            <Card key={item.id} className="hover:shadow-warm-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-warm-brown">{item.vaccineName}</h4>
                    <span className="text-xs text-warm-muted">Batch {item.batchNumber}</span>
                    <Badge variant={getVaccineStatusBadgeVariant(item.status)} size="sm">{VACCINE_STATUS_LABELS[item.status]}</Badge>
                    {item.temperatureStatus !== 'NORMAL' && (
                      <Badge variant={getTemperatureStatusBadgeVariant(item.temperatureStatus)} size="sm" className="gap-1">
                        <Thermometer className="w-3 h-3" />
                        {TEMPERATURE_STATUS_LABELS[item.temperatureStatus]}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-warm-muted mt-1">
                    {item.manufacturer} • {item.quantityAvailable} of {item.quantityReceived} doses available
                  </p>
                  <p className="text-xs text-warm-muted mt-1">{item.storageLocation} • Expires {formatDate(item.expiryDate)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => setAdjustItem(item)}>Adjust Quantity</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDetailsItem(item)}>View Batch</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <VaccineReceiveStockModal isOpen={receiveOpen} onClose={() => setReceiveOpen(false)} onSubmit={handleReceive} />
      <VaccineAdjustQuantityModal isOpen={!!adjustItem} item={adjustItem} onClose={() => setAdjustItem(null)} onSubmit={handleAdjust} />
      <VaccineBatchDetailsModal isOpen={!!detailsItem} item={detailsItem} onClose={() => setDetailsItem(null)} onToggleQuarantine={handleToggleQuarantine} />
    </div>
  );
};
