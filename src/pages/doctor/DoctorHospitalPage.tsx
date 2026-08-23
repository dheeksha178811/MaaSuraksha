import React from 'react';
import { Building2, Phone, MapPin, BedDouble, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { mockDoctor, mockHospital } from '@/data/mockData';

export const DoctorHospitalPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Hospital"
        subtitle="Facility details for your primary place of practice."
        badge={<Badge variant="sandal">{mockHospital.facilityType}</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card padding="lg" className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-sandal-100">
            <div className="w-12 h-12 rounded-xl bg-peach-verySoft text-sandal-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-warm-brown">{mockHospital.name}</h3>
              <p className="text-xs text-warm-muted">{mockHospital.facilityType}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Address</dt>
                <dd className="font-medium text-warm-brown">{mockHospital.address}, {mockHospital.city}, {mockHospital.state}</dd>
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
          </dl>
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
              <span className="text-warm-muted">Your Role</span>
              <span className="font-medium text-warm-brown">{mockDoctor.specialization.split('&')[0].trim()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
