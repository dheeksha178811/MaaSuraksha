import React, { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Baby, BedDouble, Building2, HeartPulse, ShieldAlert, Stethoscope, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/formatters';
import { getFacilityById, getHighRiskCases } from '@/services/adminService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import {
  FACILITY_STATUS_LABELS,
  FACILITY_TYPE_LABELS,
  HIGH_RISK_STATUS_LABELS,
  getFacilityStatusBadgeVariant,
  getHighRiskStatusBadgeVariant,
  getRiskBadgeVariant,
} from '@/pages/admin/adminUi';

export const AdminFacilityDetailPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();

  const fetcher = useCallback(
    () =>
      Promise.all([
        facilityId ? getFacilityById(facilityId) : Promise.resolve(undefined),
        facilityId ? getHighRiskCases({ facilityId }) : Promise.resolve([]),
      ]),
    [facilityId]
  );
  const [state, reload] = useAsyncData(fetcher, [facilityId]);

  if (state.status !== 'success') {
    return (
      <div className="space-y-6">
        <PageHeader title="Facility Profile" subtitle="Program Administration" />
        <AsyncStateView status={state.status} loadingLabel="Loading facility profile…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      </div>
    );
  }

  const [facility, highRiskCases] = state.data;

  if (!facility) {
    return (
      <div className="space-y-6">
        <PageHeader title="Facility Not Found" subtitle="This facility could not be located in the program directory." />
        <EmptyState
          icon={Building2}
          title="Facility not found"
          description="This facility may have been removed from the directory."
          action={<Link to="/admin/facilities"><Button variant="primary">Back to Facilities</Button></Link>}
        />
      </div>
    );
  }

  const occupancyPercent = facility.totalBeds ? Math.round(((facility.totalBeds - facility.availableBeds) / facility.totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={facility.name}
        subtitle={`${facility.city}, ${facility.state} • ${FACILITY_TYPE_LABELS[facility.facilityType]}`}
        badge={<Badge variant={getFacilityStatusBadgeVariant(facility.status)}>{FACILITY_STATUS_LABELS[facility.status]}</Badge>}
        actions={
          <Link to="/admin/facilities">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Facilities</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Registered Mothers', value: facility.registeredMothers, icon: Users },
          { label: 'Active Pregnancies', value: facility.activePregnancies, icon: HeartPulse },
          { label: 'Deliveries This Month', value: facility.deliveriesThisMonth, icon: Baby },
          { label: 'High-Risk Cases', value: facility.highRiskCases, icon: ShieldAlert },
          { label: 'Doctors', value: facility.doctorCount, icon: Stethoscope },
          { label: 'Bed Occupancy', value: `${occupancyPercent}%`, icon: BedDouble },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-warm-muted mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-warm-brown">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-peach-verySoft text-sandal-700 flex items-center justify-center">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <BedDouble className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Facility Details</h3>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs text-warm-muted">Total Beds</dt>
            <dd className="font-medium text-warm-brown">{facility.totalBeds}</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Available Beds</dt>
            <dd className="font-medium text-warm-brown">{facility.availableBeds}</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Neonatal ICU</dt>
            <dd className="font-medium text-warm-brown">{facility.neonatalICUAvailable ? 'Available' : 'Not Available'}</dd>
          </div>
          <div>
            <dt className="text-xs text-warm-muted">Last Reported</dt>
            <dd className="font-medium text-warm-brown">{formatDate(facility.lastReportedAt.slice(0, 10))}</dd>
          </div>
        </dl>
      </Card>

      <Card padding="lg" className="space-y-3">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <ShieldAlert className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">High-Risk Cases at This Facility</h3>
        </div>
        {highRiskCases.length === 0 ? (
          <p className="text-sm text-warm-muted py-2">No high-risk cases currently tracked at this facility.</p>
        ) : (
          <div className="space-y-2.5">
            {highRiskCases.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-warm-ivory border border-sandal-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-warm-brown">{c.motherName}</p>
                  <p className="text-xs text-warm-muted">{c.riskFactors.join(', ')}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={getRiskBadgeVariant(c.riskLevel)} size="sm">{c.riskLevel}</Badge>
                  <Badge variant={getHighRiskStatusBadgeVariant(c.status)} size="sm">{HIGH_RISK_STATUS_LABELS[c.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
