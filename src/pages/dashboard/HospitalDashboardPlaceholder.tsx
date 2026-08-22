import React from 'react';
import { Building2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { mockHospital } from '@/data/mockData';

export const HospitalDashboardPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hospital Facility: ${mockHospital.facilityName}`}
        subtitle={`${mockHospital.facilityType} • License: ${mockHospital.licenseNumber}`}
        badge={<Badge variant="sage">Hospital Role</Badge>}
        actions={
          <Link to="/auth/login">
            <Button variant="outline" size="sm">
              Switch Role
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={Building2}
        moduleBadge="Module 6 – Upcoming Hospital Module"
        title="Your MaaSuraksha Hospital Workspace is being prepared"
        description="The institutional delivery registry, neonatal bed management, cold-chain vaccine batch inventory, and maternal referral console will be implemented in Module 6."
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
