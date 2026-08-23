import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Users,
  Baby,
  HeartPulse,
  BedDouble,
  Syringe,
  ArrowRightLeft,
  FileText,
  Building2,
  Settings,
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

const HOSPITAL_ROUTE_INFO_MAP: Record<string, RouteMetadata> = {
  '/hospital/patients': {
    title: 'Patients / Mothers',
    description: 'A facility-wide registry of admitted and outpatient mothers will be available here in Module 6.',
    icon: Users,
  },
  '/hospital/deliveries': {
    title: 'Deliveries',
    description: 'The institutional delivery registry will track admissions, delivery outcomes, and discharge records in Module 6.',
    icon: Baby,
  },
  '/hospital/neonatal-care': {
    title: 'Neonatal Care',
    description: 'Neonatal bed and NICU care tracking for newborns will be activated in Module 6.',
    icon: HeartPulse,
  },
  '/hospital/beds': {
    title: 'Beds',
    description: 'Maternity and neonatal bed availability management will be activated in Module 6.',
    icon: BedDouble,
  },
  '/hospital/vaccines': {
    title: 'Vaccines / Cold Chain',
    description: 'Cold-chain vaccine batch and inventory management will be activated in Module 6.',
    icon: Syringe,
  },
  '/hospital/referrals': {
    title: 'Referrals',
    description: 'The maternal referral coordination console will be activated in Module 6.',
    icon: ArrowRightLeft,
  },
  '/hospital/reports': {
    title: 'Reports',
    description: 'Facility-level maternal and child care reports will be activated in Module 6.',
    icon: FileText,
  },
  '/hospital/profile': {
    title: 'My Hospital',
    description: 'Detailed facility profile management will be activated in Module 6.',
    icon: Building2,
  },
  '/hospital/settings': {
    title: 'Settings',
    description: 'Facility account and notification settings will be activated in Module 6.',
    icon: Settings,
  },
};

export const HospitalPlaceholderPage: React.FC = () => {
  const location = useLocation();
  const info = HOSPITAL_ROUTE_INFO_MAP[location.pathname] || {
    title: 'Feature Under Construction',
    description: 'This area of the hospital workspace is scheduled for activation in Module 6.',
    icon: Building2,
  };

  const IconComponent = info.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title={info.title}
        subtitle="MaaSuraksha Facility Console"
        badge={<Badge variant="sage">Coming in Module 6</Badge>}
        actions={
          <Link to="/hospital/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={IconComponent}
        moduleBadge="Module 6 — Upcoming Hospital Module"
        title={`${info.title} is being prepared`}
        description={info.description}
        action={
          <Link to="/hospital/dashboard">
            <Button variant="primary" size="md">
              Back to Hospital Dashboard
            </Button>
          </Link>
        }
      />
    </div>
  );
};
