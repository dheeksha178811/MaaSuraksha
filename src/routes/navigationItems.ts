import {
  LayoutDashboard,
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
  LogOut
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
    title: 'My Profile',
    href: '/mother/profile',
    icon: User,
    isPlaceholder: true,
  },
  {
    title: 'My Child',
    href: '/mother/child',
    icon: Baby,
    isPlaceholder: true,
  },
  {
    title: 'Health Timeline',
    href: '/mother/timeline',
    icon: Activity,
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
    title: 'Schedule',
    href: '/mother/schedule',
    icon: CalendarDays,
    isPlaceholder: true,
  },
  {
    title: 'Appointments',
    href: '/mother/appointments',
    icon: CalendarCheck,
    badge: '1',
    isPlaceholder: true,
  },
  {
    title: 'Messages',
    href: '/mother/messages',
    icon: MessageCircle,
    isPlaceholder: true,
  },
  {
    title: 'Nutrition & Exercise',
    href: '/mother/nutrition',
    icon: Apple,
    isPlaceholder: true,
  },
  {
    title: 'Government Schemes',
    href: '/mother/schemes',
    icon: Landmark,
    isPlaceholder: true,
  },
  {
    title: 'Documents',
    href: '/mother/documents',
    icon: FileText,
    isPlaceholder: true,
  },
  {
    title: 'My Doctor',
    href: '/mother/doctor',
    icon: Stethoscope,
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
