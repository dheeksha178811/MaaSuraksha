import {
  LayoutDashboard,
  Baby,
  Bell,
  BriefcaseMedical,
  CalendarCheck,
  FileText,
  FolderHeart,
  HeartHandshake,
  Pill,
  QrCode,
  Stethoscope,
  Syringe,
  Sparkles,
  TrendingUp,
  Settings,
  LogOut,
  Users,
  ClipboardList,
  MessageCircle,
  Building2,
  UserCircle,
  HeartPulse,
  BedDouble,
  ArrowRightLeft,
  AlertTriangle,
  LayoutGrid
} from 'lucide-react';
import { NavItem, UserRole } from '@/types';

export const MOTHER_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/mother/dashboard',
    icon: LayoutDashboard,
    isPlaceholder: false,
  },
  {
    title: 'Pregnancy',
    href: '/mother/pregnancy',
    icon: HeartHandshake,
    isPlaceholder: false,
  },
  {
    title: 'Reports & Documents',
    href: '/mother/documents',
    icon: FileText,
    isPlaceholder: false,
  },
  {
    title: 'Appointments',
    href: '/mother/appointments',
    icon: CalendarCheck,
    badge: '1',
    isPlaceholder: false,
  },
  {
    title: 'Medications',
    href: '/mother/medications',
    icon: Pill,
    isPlaceholder: false,
  },
  {
    title: 'My Care',
    href: '/mother/timeline',
    icon: FolderHeart,
    isPlaceholder: false,
  },
  {
    title: 'My Child',
    href: '/mother/child',
    icon: Baby,
    isPlaceholder: false,
  },
  {
    title: 'Vaccinations',
    href: '/mother/vaccinations',
    icon: Syringe,
    badge: 'Due',
    isPlaceholder: false,
  },
  {
    title: 'Growth & Milestones',
    href: '/mother/growth-milestones',
    icon: TrendingUp,
    isPlaceholder: false,
  },
  {
    title: 'My Hospital',
    href: '/mother/hospital',
    icon: BriefcaseMedical,
    isPlaceholder: true,
  },
  {
    title: 'My Doctor',
    href: '/mother/doctor',
    icon: Stethoscope,
    isPlaceholder: true,
  },
  {
    title: 'Notifications',
    href: '/mother/notifications',
    icon: Bell,
    isPlaceholder: true,
  },
  {
    title: 'My MaaSuraksha QR',
    href: '/mother/qr',
    icon: QrCode,
    isPlaceholder: true,
  },
  {
    title: 'MaaSuraksha Assistant',
    href: '/mother/dashboard',
    icon: Sparkles,
    isPlaceholder: true,
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    title: 'Settings',
    href: '/mother/settings',
    icon: Settings,
    isPlaceholder: true,
  },
  {
    title: 'Logout',
    href: '/auth/login',
    icon: LogOut,
    isPlaceholder: false,
  },
];

export const DOCTOR_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/doctor/dashboard',
    icon: LayoutDashboard,
    isPlaceholder: false,
  },
  {
    title: 'My Patients',
    href: '/doctor/patients',
    icon: Users,
    isPlaceholder: false,
  },
  {
    title: 'Appointments',
    href: '/doctor/appointments',
    icon: CalendarCheck,
    isPlaceholder: false,
  },
  {
    title: 'Reports',
    href: '/doctor/reports',
    icon: FileText,
    isPlaceholder: false,
  },
  {
    title: 'Care Plans',
    href: '/doctor/care-plans',
    icon: ClipboardList,
    isPlaceholder: false,
  },
  {
    title: 'Messages',
    href: '/doctor/messages',
    icon: MessageCircle,
    isPlaceholder: true,
  },
  {
    title: 'Notifications',
    href: '/doctor/notifications',
    icon: Bell,
    isPlaceholder: true,
  },
  {
    title: 'My Hospital',
    href: '/doctor/hospital',
    icon: Building2,
    isPlaceholder: false,
  },
  {
    title: 'My Profile',
    href: '/doctor/profile',
    icon: UserCircle,
    isPlaceholder: false,
  },
];

export const DOCTOR_BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    title: 'Logout',
    href: '/auth/login',
    icon: LogOut,
    isPlaceholder: false,
  },
];

// Hospital and Admin are placeholder/shell roles for future Module 6 and Module 7.
// Their nav items intentionally point to lightweight placeholder routes only.

export const HOSPITAL_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/hospital/dashboard',
    icon: LayoutDashboard,
    isPlaceholder: false,
  },
  {
    title: 'Patients / Mothers',
    href: '/hospital/patients',
    icon: Users,
    isPlaceholder: true,
  },
  {
    title: 'Deliveries',
    href: '/hospital/deliveries',
    icon: Baby,
    isPlaceholder: true,
  },
  {
    title: 'Neonatal Care',
    href: '/hospital/neonatal-care',
    icon: HeartPulse,
    isPlaceholder: true,
  },
  {
    title: 'Beds',
    href: '/hospital/beds',
    icon: BedDouble,
    isPlaceholder: true,
  },
  {
    title: 'Vaccines / Cold Chain',
    href: '/hospital/vaccines',
    icon: Syringe,
    isPlaceholder: true,
  },
  {
    title: 'Referrals',
    href: '/hospital/referrals',
    icon: ArrowRightLeft,
    isPlaceholder: true,
  },
  {
    title: 'Reports',
    href: '/hospital/reports',
    icon: FileText,
    isPlaceholder: true,
  },
  {
    title: 'My Hospital',
    href: '/hospital/profile',
    icon: Building2,
    isPlaceholder: true,
  },
  {
    title: 'Settings',
    href: '/hospital/settings',
    icon: Settings,
    isPlaceholder: true,
  },
];

export const HOSPITAL_BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    title: 'Logout',
    href: '/auth/login',
    icon: LogOut,
    isPlaceholder: false,
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    isPlaceholder: false,
  },
  {
    title: 'Program Overview',
    href: '/admin/program-overview',
    icon: LayoutGrid,
    isPlaceholder: true,
  },
  {
    title: 'Facilities',
    href: '/admin/facilities',
    icon: Building2,
    isPlaceholder: true,
  },
  {
    title: 'Maternal Analytics',
    href: '/admin/maternal-analytics',
    icon: TrendingUp,
    isPlaceholder: true,
  },
  {
    title: 'Immunization',
    href: '/admin/immunization',
    icon: Syringe,
    isPlaceholder: true,
  },
  {
    title: 'High-Risk Monitoring',
    href: '/admin/high-risk-monitoring',
    icon: AlertTriangle,
    isPlaceholder: true,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    isPlaceholder: true,
  },
  {
    title: 'Alerts',
    href: '/admin/alerts',
    icon: Bell,
    isPlaceholder: true,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    isPlaceholder: true,
  },
];

export const ADMIN_BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    title: 'Logout',
    href: '/auth/login',
    icon: LogOut,
    isPlaceholder: false,
  },
];

export interface RoleNavConfig {
  items: NavItem[];
  bottomItems: NavItem[];
  sectionLabel: string;
  mobileSectionLabel: string;
}

/**
 * Single source of truth for which nav set + section label a role renders.
 * Sidebar and MobileDrawer both read through this so role branching lives in one place.
 */
export const getNavConfigForRole = (role: UserRole): RoleNavConfig => {
  switch (role) {
    case 'doctor':
      return {
        items: DOCTOR_NAV_ITEMS,
        bottomItems: DOCTOR_BOTTOM_NAV_ITEMS,
        sectionLabel: 'Clinical Portal',
        mobileSectionLabel: 'Clinical Navigation',
      };
    case 'hospital':
      return {
        items: HOSPITAL_NAV_ITEMS,
        bottomItems: HOSPITAL_BOTTOM_NAV_ITEMS,
        sectionLabel: 'Facility Console',
        mobileSectionLabel: 'Facility Navigation',
      };
    case 'admin':
      return {
        items: ADMIN_NAV_ITEMS,
        bottomItems: ADMIN_BOTTOM_NAV_ITEMS,
        sectionLabel: 'Program Administration',
        mobileSectionLabel: 'Administration Navigation',
      };
    case 'mother':
    default:
      return {
        items: MOTHER_NAV_ITEMS,
        bottomItems: BOTTOM_NAV_ITEMS,
        sectionLabel: 'Care Space',
        mobileSectionLabel: 'Care Navigation',
      };
  }
};
