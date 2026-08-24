import React, { useCallback, useState } from 'react';
import { Ambulance, Award, Building2, Clock, Mail, MapPin, Phone, ShieldCheck, User, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getHospitalCareTeam, getHospitalExtras, getHospitalServices } from '@/data/motherHospitalMockData';
import { getHospital, HospitalProfileUpdate, updateHospitalProfile } from '@/services/hospitalService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { EditHospitalProfileModal } from '@/pages/hospital/components/EditHospitalProfileModal';

export const HospitalProfilePage: React.FC = () => {
  const fetcher = useCallback(() => getHospital(), []);
  const [state, reload] = useAsyncData(fetcher);
  const [editOpen, setEditOpen] = useState(false);

  const handleSave = async (patch: HospitalProfileUpdate) => {
    await updateHospitalProfile(patch);
    setEditOpen(false);
    reload();
  };

  if (state.status !== 'success') {
    return (
      <div className="space-y-6">
        <PageHeader title="My Hospital" subtitle="Your facility profile." />
        <AsyncStateView status={state.status} loadingLabel="Loading facility profile…" errorMessage={state.status === 'error' ? state.message : undefined} onRetry={reload} />
      </div>
    );
  }

  const hospital = state.data;
  const extras = getHospitalExtras(hospital.id);
  const services = getHospitalServices(hospital.id);
  const careTeam = getHospitalCareTeam(hospital.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Hospital"
        subtitle="Your facility's profile as visible across MaaSuraksha."
        badge={<Badge variant="sage">{hospital.facilityType}</Badge>}
        actions={<Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit Hospital Profile</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card padding="lg" className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-sandal-100">
            <div className="w-12 h-12 rounded-xl bg-peach-verySoft text-sandal-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-warm-brown">{hospital.facilityName}</h3>
              {extras?.tagline && <p className="text-xs text-warm-muted mt-0.5">{extras.tagline}</p>}
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">License Number</dt>
                <dd className="font-medium text-warm-brown">{hospital.licenseNumber}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Address</dt>
                <dd className="font-medium text-warm-brown">
                  {hospital.address}, {hospital.city}, {hospital.state} {hospital.postalCode}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Contact</dt>
                <dd className="font-medium text-warm-brown">{hospital.contactNumber}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Email</dt>
                <dd className="font-medium text-warm-brown">{hospital.email}</dd>
              </div>
            </div>
            {extras && (
              <>
                <div className="flex items-start gap-2">
                  <Ambulance className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs text-warm-muted">Emergency Contact</dt>
                    <dd className="font-medium text-warm-brown">{extras.emergencyContactNumber}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs text-warm-muted">Visiting Hours</dt>
                    <dd className="font-medium text-warm-brown">{extras.visitingHours}</dd>
                  </div>
                </div>
              </>
            )}
          </dl>

          <div className="pt-4 border-t border-sandal-100 text-sm">
            <p className="text-xs text-warm-muted mb-1">Operating Hours</p>
            <p className="font-medium text-warm-brown">
              {hospital.neonatalICUAvailable && extras?.ambulanceAvailable
                ? '24/7 for emergency & inpatient care'
                : 'See visiting hours above for outpatient services'}
            </p>
          </div>

          {extras && extras.accreditations.length > 0 && (
            <div className="pt-4 border-t border-sandal-100">
              <p className="flex items-center gap-1.5 text-xs text-warm-muted mb-2">
                <Award className="w-3.5 h-3.5" />
                Accreditations
              </p>
              <div className="flex flex-wrap gap-2">
                {extras.accreditations.map((accreditation) => (
                  <Badge key={accreditation} variant="peach" size="sm">{accreditation}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card padding="lg" className="space-y-3">
          <h3 className="font-display text-lg font-bold text-warm-brown">Facility Snapshot</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Total Beds</span>
              <span className="font-semibold text-warm-brown">{hospital.totalBeds}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Available Beds</span>
              <span className="font-semibold text-warm-brown">{hospital.availableBeds ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Neonatal ICU</span>
              <Badge variant={hospital.neonatalICUAvailable ? 'sage' : 'outline'} size="sm">
                {hospital.neonatalICUAvailable ? 'Available' : 'Not Available'}
              </Badge>
            </div>
            {extras && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
                <span className="text-warm-muted">Established</span>
                <span className="font-semibold text-warm-brown">{extras.establishedYear}</span>
              </div>
            )}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Status</span>
              <Badge variant={hospital.status === 'ACTIVE' ? 'sage' : 'outline'} size="sm">{hospital.status || 'ACTIVE'}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100">
            <ShieldCheck className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-xl font-bold text-warm-brown">Services</h3>
            <Badge variant="sandal" size="sm">{services.length} Services</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((service) => (
              <div key={service.serviceId} className="p-3 rounded-xl bg-warm-ivory border border-sandal-100">
                <p className="text-sm font-semibold text-warm-brown">{service.name}</p>
                <p className="text-xs text-warm-muted mt-1">{service.availability}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Staff */}
      {careTeam.length > 0 && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100">
            <Users className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-xl font-bold text-warm-brown">Facility Staff</h3>
            <Badge variant="sandal" size="sm">{careTeam.length} Members</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {careTeam.map((member) => (
              <div key={member.memberId} className="p-3 rounded-xl bg-warm-ivory border border-sandal-100 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-warm-brown">{member.name}</p>
                  <p className="text-xs text-warm-muted">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <EditHospitalProfileModal isOpen={editOpen} hospital={hospital} onClose={() => setEditOpen(false)} onSave={handleSave} />
    </div>
  );
};
