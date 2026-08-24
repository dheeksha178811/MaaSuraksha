import React from 'react';
import { Stethoscope, Mail, Phone, GraduationCap, Building2, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { mockDoctor, mockHospital } from '@/data/mockData';
import { getPatientsForDoctor } from '@/data/doctorPatientsMockData';

export const DoctorProfilePage: React.FC = () => {
  const patientCount = getPatientsForDoctor(mockDoctor.id).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Your clinical profile as visible within MaaSuraksha."
        badge={<Badge variant="sandal">Doctor Role</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card padding="lg" className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-sandal-100">
            <Avatar name={mockDoctor.name} size="xl" />
            <div>
              <h3 className="font-display text-xl font-bold text-warm-brown">{mockDoctor.name}</h3>
              <p className="text-sm text-warm-muted">{mockDoctor.specialization}</p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Qualification</dt>
                <dd className="font-medium text-warm-brown">{mockDoctor.qualification}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Hospital</dt>
                <dd className="font-medium text-warm-brown">{mockHospital.name}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Email</dt>
                <dd className="font-medium text-warm-brown">{mockDoctor.email}</dd>
              </div>
            </div>
            {mockDoctor.phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-warm-muted">Phone</dt>
                  <dd className="font-medium text-warm-brown">{mockDoctor.phone}</dd>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <dt className="text-xs text-warm-muted">Available Days</dt>
                <dd className="font-medium text-warm-brown">{mockDoctor.availableDays.join(', ')}</dd>
              </div>
            </div>
          </dl>
        </Card>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
            <Stethoscope className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Practice Summary</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-warm-muted">Experience</span>
              <span className="font-semibold text-warm-brown">{mockDoctor.experienceYears} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-warm-muted">Assigned Patients</span>
              <span className="font-semibold text-warm-brown">{patientCount}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
