import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export const AdminDashboardPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Maternal Health Program Administration"
        subtitle="District Health Society & National Health Mission Oversight"
        badge={<Badge variant="sandal">Admin Role</Badge>}
        actions={
          <Link to="/auth/login">
            <Button variant="outline" size="sm">
              Switch Role
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={ShieldCheck}
        moduleBadge="Module 7 – Upcoming Admin Module"
        title="Your MaaSuraksha Administrator Workspace is being prepared"
        description="District immunization coverage analytics, maternal mortality reduction metrics, high-risk tracking alerts, and facility performance reports will be implemented in Module 7."
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
