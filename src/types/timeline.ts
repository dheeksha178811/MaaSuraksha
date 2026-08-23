import { GrowthRecipientType } from './growth';

// ---------------------------------------------------------------------------
// Module 10: Health Timeline (surfaced as a tab within the My Care
// workspace at /mother/timeline, alongside Nutrition & Exercise).
// A TimelineEvent is a normalized, read-only projection built from the
// already-persisted records in the other completed modules (reports,
// appointments, medications, vaccinations, growth measurements, milestones,
// doctor consultation notes) — it is never stored directly. Each event's
// `sourceType` + `sourceId` trace back to the real record it was derived
// from, so nothing here needs its own separate migration path: once those
// source collections exist in MongoDB, the timeline can be rebuilt (or
// queried) directly from them.
// ---------------------------------------------------------------------------

export type TimelineEventCategory =
  | 'SCAN'
  | 'LAB_REPORT'
  | 'DOCUMENT'
  | 'VITALS'
  | 'APPOINTMENT'
  | 'MEDICATION'
  | 'VACCINATION'
  | 'DOCTOR_NOTE'
  | 'MILESTONE';

export type TimelineEventSourceType =
  | 'REPORT'
  | 'APPOINTMENT'
  | 'MEDICATION'
  | 'VACCINATION'
  | 'MEASUREMENT'
  | 'MILESTONE'
  | 'CONSULTATION_NOTE';

export interface TimelineEvent {
  eventId: string;
  motherId: string;
  childId?: string;
  category: TimelineEventCategory;
  recipient: GrowthRecipientType;
  recipientName: string;
  date: string;
  title: string;
  summary: string;
  doctorName?: string;
  hospitalName?: string;
  statusLabel?: string;
  statusVariant?: 'sandal' | 'sage' | 'peach' | 'warm' | 'danger' | 'outline';
  linkTo?: string;
  linkLabel?: string;
  sourceType: TimelineEventSourceType;
  sourceId: string;
}
