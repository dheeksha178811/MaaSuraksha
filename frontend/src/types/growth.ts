// ---------------------------------------------------------------------------
// Module 4D: Growth & Milestones
// Growth measurement history and developmental/recovery milestone tracking
// for both mother and child. Carries explicit motherId / childId / doctorId
// / hospitalId / measurementId / milestoneId linkage so this mock shape can
// be swapped for backend/MongoDB data later without any UI changes.
// ---------------------------------------------------------------------------

export type GrowthRecipientType = 'MOTHER' | 'CHILD';

export interface GrowthMeasurement {
  measurementId: string;
  motherId: string;
  childId?: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  recipientType: GrowthRecipientType;
  recipientName: string;
  date: string;
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  context: string; // e.g. "First-trimester registration", "6-week checkup"
  notes?: string;
  loggedByMother?: boolean; // true for a mother-logged home measurement vs. a clinical visit
}

export type MilestoneStatus = 'achieved' | 'due_soon' | 'upcoming';
export type MilestoneCategory = 'MOTOR' | 'COGNITIVE' | 'SOCIAL' | 'LANGUAGE' | 'MATERNAL_RECOVERY';

export interface MilestoneRecord {
  milestoneId: string;
  motherId: string;
  childId?: string;
  recipientType: GrowthRecipientType;
  recipientName: string;
  category: MilestoneCategory;
  title: string;
  description: string;
  targetAgeRange: string; // e.g. "6-8 Weeks", "3-4 Months"
  status: MilestoneStatus;
  achievedDate?: string;
  notes?: string;
}
