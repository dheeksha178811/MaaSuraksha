import {
  Baby,
  Brain,
  HeartHandshake,
  HeartPulse,
  LucideIcon,
  MessageCircleHeart,
  PersonStanding,
} from 'lucide-react';
import { GrowthRecipientType, MilestoneCategory, MilestoneStatus } from '@/types';

type BadgeVariant = 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';

export const getMilestoneStatusBadgeVariant = (status: MilestoneStatus): BadgeVariant => {
  switch (status) {
    case 'achieved':
      return 'sage';
    case 'due_soon':
      return 'sandal';
    case 'upcoming':
      return 'warm';
    default:
      return 'outline';
  }
};

export const getMilestoneStatusLabel = (status: MilestoneStatus): string => {
  switch (status) {
    case 'achieved':
      return 'Achieved';
    case 'due_soon':
      return 'Due Soon';
    case 'upcoming':
      return 'Upcoming';
    default:
      return status;
  }
};

export const getMilestoneCategoryIcon = (category: MilestoneCategory): LucideIcon => {
  switch (category) {
    case 'MOTOR':
      return PersonStanding;
    case 'COGNITIVE':
      return Brain;
    case 'SOCIAL':
      return MessageCircleHeart;
    case 'LANGUAGE':
      return MessageCircleHeart;
    case 'MATERNAL_RECOVERY':
      return HeartHandshake;
    default:
      return Baby;
  }
};

export const getMilestoneCategoryLabel = (category: MilestoneCategory): string => {
  switch (category) {
    case 'MOTOR':
      return 'Motor Skills';
    case 'COGNITIVE':
      return 'Cognitive';
    case 'SOCIAL':
      return 'Social';
    case 'LANGUAGE':
      return 'Language';
    case 'MATERNAL_RECOVERY':
      return 'Maternal Recovery';
    default:
      return category;
  }
};

export const getRecipientIcon = (recipientType: GrowthRecipientType): LucideIcon =>
  recipientType === 'MOTHER' ? HeartPulse : Baby;

export const getRecipientLabel = (recipientType: GrowthRecipientType): string =>
  recipientType === 'MOTHER' ? 'Maternal' : 'Child';
