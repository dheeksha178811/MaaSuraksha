import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  TrendingUp,
  Syringe,
  AlertTriangle,
  FileText,
  Bell,
  Settings,
  UserCircle,
  ArrowLeft,
  LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface RouteMetadata {
  title: string;
  description: string;
  icon: LucideIcon;
}

const ADMIN_ROUTE_INFO_MAP: Record<string, RouteMetadata> = {
  '/admin/program-overview': {
    title: 'Program Overview',
    description: 'A district-wide summary of maternal and child health program activity will be activated in Module 7.',
    icon: LayoutGrid,
  },
  '/admin/facilities': {
    title: 'Facilities',
    description: 'A directory of registered hospitals and facility performance tracking will be activated in Module 7.',
    icon: Building2,
  },
  '/admin/maternal-analytics': {
    title: 'Maternal Analytics',
    description: 'Maternal mortality reduction metrics and outcome analytics will be activated in Module 7.',
    icon: TrendingUp,
  },
  '/admin/immunization': {
    title: 'Immunization',
    description: 'District immunization coverage analytics will be activated in Module 7.',
    icon: Syringe,
  },
  '/admin/high-risk-monitoring': {
    title: 'High-Risk Monitoring',
    description: 'High-risk pregnancy tracking and program-level alerts will be activated in Module 7.',
    icon: AlertTriangle,
  },
  '/admin/reports': {
    title: 'Reports',
    description: 'Facility performance and program oversight reports will be activated in Module 7.',
    icon: FileText,
  },
  '/admin/alerts': {
    title: 'Alerts',
    description: 'Program-level alerts and escalations will be activated in Module 7.',
    icon: Bell,
  },
  '/admin/settings': {
    title: 'Settings',
    description: 'Administrator account and program settings will be activated in Module 7.',
    icon: Settings,
  },
  '/admin/profile': {
    title: 'My Profile',
    description: 'Administrator profile details will be activated in Module 7.',
    icon: UserCircle,
  },
};

export const AdminPlaceholderPage: React.FC = () => {
  const location = useLocation();
  const info = ADMIN_ROUTE_INFO_MAP[location.pathname] || {
    title: 'Feature Under Construction',
    description: 'This area of the program administration workspace is scheduled for activation in Module 7.',
    icon: LayoutGrid,
  };

  const IconComponent = info.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title={info.title}
        subtitle="MaaSuraksha Program Administration"
        badge={<Badge variant="sandal">Coming in Module 7</Badge>}
        actions={
          <Link to="/admin/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={IconComponent}
        moduleBadge="Module 7 — Upcoming Admin Module"
        title={`${info.title} is being prepared`}
        description={info.description}
        action={
          <Link to="/admin/dashboard">
            <Button variant="primary" size="md">
              Back to Admin Dashboard
            </Button>
          </Link>
        }
      />
    </div>
  );
};
