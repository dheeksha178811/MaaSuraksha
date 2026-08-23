import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MessageCircle, Bell, ArrowLeft, LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface RouteMetadata {
  title: string;
  description: string;
  icon: LucideIcon;
}

const DOCTOR_ROUTE_INFO_MAP: Record<string, RouteMetadata> = {
  '/doctor/messages': {
    title: 'Care Messages & Consults',
    description: 'Secure messaging with your assigned mothers and hospital care team will be activated in a future module.',
    icon: MessageCircle,
  },
  '/doctor/notifications': {
    title: 'Clinical Notifications',
    description: 'A dedicated feed of patient alerts, report submissions, and scheduling updates will be activated in a future module.',
    icon: Bell,
  },
};

export const DoctorPlaceholderPage: React.FC = () => {
  const location = useLocation();
  const info = DOCTOR_ROUTE_INFO_MAP[location.pathname] || {
    title: 'Feature Under Construction',
    description: 'This area of the doctor workspace is scheduled for activation in a future module.',
    icon: MessageCircle,
  };

  const IconComponent = info.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title={info.title}
        subtitle="MaaSuraksha Clinical Portal"
        badge={<Badge variant="sandal">Coming Soon</Badge>}
        actions={
          <Link to="/doctor/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={IconComponent}
        moduleBadge="Doctor Workspace"
        title={`${info.title} is coming soon`}
        description={info.description}
        action={
          <Link to="/doctor/patients">
            <Button variant="primary" size="md">
              Go to My Patients
            </Button>
          </Link>
        }
      />
    </div>
  );
};
