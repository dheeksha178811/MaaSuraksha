import { UserRole, BaseUser } from './user';
import { MotherProfile } from './mother';
import { DoctorProfile } from './doctor';
import { HospitalProfile } from './hospital';

export type AssistantSender = 'user' | 'assistant' | 'system';

export interface AssistantAction {
  label: string;
  href: string;
  iconName?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface AssistantMessage {
  id: string;
  sender: AssistantSender;
  text: string;
  timestamp: string;
  actions?: AssistantAction[];
  isTyping?: boolean;
  category?: 'general' | 'vaccination' | 'appointment' | 'doctor' | 'schemes' | 'safety' | 'stats';
}

export interface AssistantQuickAction {
  id: string;
  label: string;
  query: string;
  role: UserRole;
  iconName?: string;
  description?: string;
}

export interface AssistantContext {
  role: UserRole;
  currentRoute: string;
  user?: BaseUser | MotherProfile | DoctorProfile | HospitalProfile;
  contextType?: string;
}

export interface AssistantResponse {
  text: string;
  actions?: AssistantAction[];
  suggestedFollowUps?: string[];
}
