import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sparkles,
  User,
  Baby,
  Activity,
  Syringe,
  CalendarDays,
  CalendarCheck,
  MessageCircle,
  Apple,
  Landmark,
  FileText,
  Stethoscope,
  Settings,
  ArrowLeft,
  LucideIcon
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface RouteMetadata {
  title: string;
  moduleName: string;
  description: string;
  icon: LucideIcon;
}

const ROUTE_INFO_MAP: Record<string, RouteMetadata> = {
  '/mother/profile': {
    title: 'My Profile & Medical Information',
    moduleName: 'Module 2: Mother Profile',
    description: 'Comprehensive maternal history, blood group, emergency contacts, obstetric background, and delivery notes will be manageable here.',
    icon: User,
  },
  '/mother/child': {
    title: 'My Child (Vihaan)',
    moduleName: 'Module 2: Child Profile',
    description: 'Newborn developmental milestones, growth chart centiles, weight/height progression, and birth certifications.',
    icon: Baby,
  },
  '/mother/timeline': {
    title: 'Health Timeline',
    moduleName: 'Module 10: Health Timeline',
    description: 'Chronological timeline of all pregnancy scans, laboratory reports, vitals tracking, and clinical doctor consult notes.',
    icon: Activity,
  },
  '/mother/vaccinations': {
    title: 'Vaccinations & Immunization Tracker',
    moduleName: 'Module 3: Schedule & Immunization',
    description: 'National Universal Immunization Programme (UIP) schedule, automated overdue alerts, digital vaccine card, and batch verification.',
    icon: Syringe,
  },
  '/mother/schedule': {
    title: 'Maternal Care Schedule',
    moduleName: 'Module 3: Schedule Management',
    description: 'Integrated master calendar organizing prenatal tests, postnatal checkups, vaccine appointments, and home health visits.',
    icon: CalendarDays,
  },
  '/mother/appointments': {
    title: 'Doctor Appointments',
    moduleName: 'Module 4: Appointments',
    description: 'Direct booking and schedule coordination with Dr. Priya Menon and Sunrise Women & Children Hospital.',
    icon: CalendarCheck,
  },
  '/mother/messages': {
    title: 'Care Messages & Consults',
    moduleName: 'Module 4: Notifications & Messages',
    description: 'Secure one-to-one communication channel with your assigned gynecologist and hospital maternity desk.',
    icon: MessageCircle,
  },
  '/mother/nutrition': {
    title: 'Nutrition & Exercise Guidance',
    moduleName: 'Module 9: Nutrition & Exercise',
    description: 'Expert-curated meal plans, lactation-friendly recipes, safe postpartum pelvic exercises, and hydration logs.',
    icon: Apple,
  },
  '/mother/schemes': {
    title: 'Government Maternity Schemes',
    moduleName: 'Module 8: Government Schemes',
    description: 'Information and eligibility assistance for PMMVY, JSY, Matru Vandana Yojana, and state-level conditional cash transfer schemes.',
    icon: Landmark,
  },
  '/mother/documents': {
    title: 'Medical Documents & Scans',
    moduleName: 'Module 10: Documents Vault',
    description: 'Secure digital vault for ultrasound scans, blood test lab PDFs, hospital discharge summaries, and birth certificates.',
    icon: FileText,
  },
  '/mother/doctor': {
    title: 'My Doctor (Dr. Priya Menon)',
    moduleName: 'Module 5: Doctor Connection',
    description: 'Consultant profiles, available clinic hours, hospital affiliations, direct contact guidelines, and consultation logs.',
    icon: Stethoscope,
  },
  '/mother/settings': {
    title: 'Account & Care Settings',
    moduleName: 'Settings & Preferences',
    description: 'Manage reminder notification channels (SMS / WhatsApp / App), language preferences, and privacy controls.',
    icon: Settings,
  },
};

export const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const info = ROUTE_INFO_MAP[location.pathname] || {
    title: 'Feature Under Construction',
    moduleName: 'Future Module',
    description: 'This area of the MaaSuraksha companion platform is scheduled for activation in subsequent development modules.',
    icon: Sparkles,
  };

  const IconComponent = info.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title={info.title}
        subtitle="MaaSuraksha digital maternal companion foundation."
        badge={<Badge variant="sandal">Module 0 Foundation</Badge>}
        actions={
          <Link to="/mother/dashboard">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      <EmptyState
        icon={IconComponent}
        moduleBadge={info.moduleName}
        title={`${info.title} is coming soon`}
        description={info.description}
        action={
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link to="/mother/dashboard">
              <Button variant="primary" size="md">
                Return to Mother Dashboard
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="secondary" size="md">
                Switch Role
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
};
