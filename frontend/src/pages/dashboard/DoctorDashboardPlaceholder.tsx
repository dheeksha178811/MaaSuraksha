import React from 'react';
import { Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { mockDoctor } from '@/data/mockData';

export const DoctorDashboardPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Doctor Workspace: ${mockDoctor.name}`}
        subtitle={`${mockDoctor.specialization} • ${mockDoctor.hospitalName}`}
        badge={<Badge variant="sandal">Doctor Role</Badge>}
        actions={
          <Link to="/auth/login">
            <Button variant="outline" size="sm">
              Switch Role
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={Stethoscope}
        moduleBadge="Module 5 – Upcoming Doctor Module"
        title="Your MaaSuraksha Doctor Workspace is being prepared"
        description="The clinical portal for high-risk pregnancy monitoring, patient encounter logging, antenatal visit tracking, and electronic prescriptions will be activated in Module 5."
        action={
          <Link to="/mother/dashboard">
            <Button variant="secondary" size="md">
              View Mother Dashboard Preview
            </Button>
          </Link>
        }
      />
    </div>
  );
};
