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
  UserCircle
} from 'lucide-react';
import { NavItem } from '@/types';

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
    isPlaceholder: true,
  },
  {
    title: 'Medications',
    href: '/mother/medications',
    icon: Pill,
    isPlaceholder: true,
  },
  {
    title: 'My Care',
    href: '/mother/timeline',
    icon: FolderHeart,
    isPlaceholder: true,
  },
  {
    title: 'My Child',
    href: '/mother/child',
    icon: Baby,
    isPlaceholder: true,
  },
  {
    title: 'Vaccinations',
    href: '/mother/vaccinations',
    icon: Syringe,
    badge: 'Due',
    isPlaceholder: true,
  },
  {
    title: 'Growth & Milestones',
    href: '/mother/growth',
    icon: TrendingUp,
    isPlaceholder: true,
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
