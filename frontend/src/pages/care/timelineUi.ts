import {
  Activity,
  CalendarCheck,
  FileText,
  FlaskConical,
  LucideIcon,
  NotebookPen,
  Pill,
  ScanLine,
  Sparkles,
  Syringe,
} from 'lucide-react';
import { TimelineEventCategory } from '@/types';

export const TIMELINE_CATEGORY_LABELS: Record<TimelineEventCategory, string> = {
  SCAN: 'Scans',
  LAB_REPORT: 'Lab Reports',
  DOCUMENT: 'Documents',
  VITALS: 'Vitals & Measurements',
  APPOINTMENT: 'Appointments',
  MEDICATION: 'Medications',
  VACCINATION: 'Vaccinations',
  DOCTOR_NOTE: 'Doctor Notes',
  MILESTONE: 'Milestones',
};

export const getTimelineCategoryIcon = (category: TimelineEventCategory): LucideIcon => {
  switch (category) {
    case 'SCAN':
      return ScanLine;
    case 'LAB_REPORT':
      return FlaskConical;
    case 'DOCUMENT':
      return FileText;
    case 'VITALS':
      return Activity;
    case 'APPOINTMENT':
      return CalendarCheck;
    case 'MEDICATION':
      return Pill;
    case 'VACCINATION':
      return Syringe;
    case 'DOCTOR_NOTE':
      return NotebookPen;
    case 'MILESTONE':
      return Sparkles;
    default:
      return Activity;
  }
};

export const getTimelineCategoryDotClass = (category: TimelineEventCategory): string => {
  switch (category) {
    case 'SCAN':
      return 'bg-sandal-500';
    case 'LAB_REPORT':
      return 'bg-rose-400';
    case 'DOCUMENT':
      return 'bg-warm-muted';
    case 'VITALS':
      return 'bg-sage';
    case 'APPOINTMENT':
      return 'bg-sandal-600';
    case 'MEDICATION':
      return 'bg-peach-soft';
    case 'VACCINATION':
      return 'bg-sage-text';
    case 'DOCTOR_NOTE':
      return 'bg-sandal-300';
    case 'MILESTONE':
      return 'bg-sandal-700';
    default:
      return 'bg-sandal-400';
  }
};
