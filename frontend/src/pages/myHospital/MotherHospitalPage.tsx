import React, { useMemo, useState } from 'react';
import {
  Ambulance,
  Award,
  BedDouble,
  Building2,
  Clock,
  Filter,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { mockHospital } from '@/data/mockData';
import {
  getHospitalCareTeam,
  getHospitalExtras,
  getHospitalServices,
} from '@/data/motherHospitalMockData';
import { HospitalService, HospitalServiceCategory } from '@/types';
import { ServiceCard } from './components/ServiceCard';
import { ServiceDetailsModal } from './components/ServiceDetailsModal';
import { CareTeamMemberCard } from './components/CareTeamMemberCard';
import { HOSPITAL_SERVICE_CATEGORY_LABELS } from './myHospitalUi';

const SERVICE_FILTER_OPTIONS: { value: 'ALL' | HospitalServiceCategory; label: string }[] = [
  { value: 'ALL', label: 'All Services' },
  ...(Object.keys(HOSPITAL_SERVICE_CATEGORY_LABELS) as HospitalServiceCategory[]).map((value) => ({
    value,
    label: HOSPITAL_SERVICE_CATEGORY_LABELS[value],
  })),
];

export const MotherHospitalPage: React.FC = () => {
  const [serviceFilter, setServiceFilter] = useState<'ALL' | HospitalServiceCategory>('ALL');
  const [selectedService, setSelectedService] = useState<HospitalService | null>(null);

  const extras = useMemo(() => getHospitalExtras(mockHospital.id), []);
  const services = useMemo(() => getHospitalServices(mockHospital.id), []);
  const careTeam = useMemo(() => getHospitalCareTeam(mockHospital.id), []);

  const filteredServices = useMemo(
    () => (serviceFilter === 'ALL' ? services : services.filter((s) => s.category === serviceFilter)),
    [services, serviceFilter]
  );

  const primaryDoctor = careTeam.find((m) => m.isPrimaryDoctor);
  const otherTeamMembers = careTeam.filter((m) => !m.isPrimaryDoctor);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Hospital"
        subtitle="Your assigned facility, care team, and the services available to you."
        badge={<Badge variant="sandal">{mockHospital.facilityType}</Badge>}
      />

      {/* Facility Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card padding="lg" className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-sandal-100">
            <div className="w-12 h-12 rounded-xl bg-peach-verySoft text-sandal-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-warm-brown">{mockHospital.name}</h3>
              {extras?.tagline && <p className="text-xs text-warm-muted mt-0.5">{extras.tagline}</p>}
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Address</dt>
                <dd className="font-medium text-warm-brown">
                  {mockHospital.address}, {mockHospital.city}, {mockHospital.state}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Contact</dt>
                <dd className="font-medium text-warm-brown">{mockHospital.contactNumber}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">License Number</dt>
                <dd className="font-medium text-warm-brown">{mockHospital.licenseNumber}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <BedDouble className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Total Beds</dt>
                <dd className="font-medium text-warm-brown">{mockHospital.totalBeds}</dd>
              </div>
            </div>
            {extras && (
              <>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs text-warm-muted">Visiting Hours</dt>
                    <dd className="font-medium text-warm-brown">{extras.visitingHours}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Ambulance className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs text-warm-muted">Emergency Contact</dt>
                    <dd className="font-medium text-warm-brown">{extras.emergencyContactNumber}</dd>
                  </div>
                </div>
              </>
            )}
          </dl>

          {extras && extras.accreditations.length > 0 && (
            <div className="pt-4 border-t border-sandal-100">
              <p className="flex items-center gap-1.5 text-xs text-warm-muted mb-2">
                <Award className="w-3.5 h-3.5" />
                Accreditations
              </p>
              <div className="flex flex-wrap gap-2">
                {extras.accreditations.map((accreditation) => (
                  <Badge key={accreditation} variant="peach" size="sm">
                    {accreditation}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card padding="lg" className="space-y-3">
          <h3 className="font-display text-lg font-bold text-warm-brown">Facility Highlights</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Neonatal ICU</span>
              <Badge variant={mockHospital.neonatalICUAvailable ? 'sage' : 'outline'} size="sm">
                {mockHospital.neonatalICUAvailable ? 'Available' : 'Not Available'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
              <span className="text-warm-muted">Ambulance Service</span>
              <Badge variant={extras?.ambulanceAvailable ? 'sage' : 'outline'} size="sm">
                {extras?.ambulanceAvailable ? 'Available' : 'Not Available'}
              </Badge>
            </div>
            {extras && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
                <span className="text-warm-muted">Established</span>
                <span className="font-medium text-warm-brown">{extras.establishedYear}</span>
              </div>
            )}
            {primaryDoctor && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-warm-ivory border border-sandal-100">
                <span className="text-warm-muted">Your Doctor</span>
                <span className="font-medium text-warm-brown">{primaryDoctor.name}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Care Team */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-sandal-100">
          <Users className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">Your Care Team</h3>
          <Badge variant="sandal" size="sm">{careTeam.length} Members</Badge>
        </div>

        {careTeam.length === 0 ? (
          <EmptyState icon={Users} title="No care team assigned" description="Your care team will appear here once assigned." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {primaryDoctor && <CareTeamMemberCard key={primaryDoctor.memberId} member={primaryDoctor} />}
            {otherTeamMembers.map((member) => (
              <CareTeamMemberCard key={member.memberId} member={member} />
            ))}
          </div>
        )}
      </Card>

      {/* Services */}
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sandal-100">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-xl font-bold text-warm-brown">Hospital Services</h3>
            <Badge variant="sandal" size="sm">{filteredServices.length} Services</Badge>
          </div>
          <div className="w-full sm:w-60 flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600 shrink-0" />
            <Select
              aria-label="Filter services"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as 'ALL' | HospitalServiceCategory)}
              options={SERVICE_FILTER_OPTIONS}
            />
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No services found" description="No services match this filter yet." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <ServiceCard key={service.serviceId} service={service} onView={setSelectedService} />
            ))}
          </div>
        )}
      </Card>

      {selectedService && (
        <ServiceDetailsModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </div>
  );
};
