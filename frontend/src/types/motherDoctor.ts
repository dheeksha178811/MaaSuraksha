// ---------------------------------------------------------------------------
// Mother-side "My Doctor" module.
// Supplementary doctor detail — extended profile, contact/communication
// options, and consultation history — kept separate from the core
// `DoctorProfile` type (used by the Doctor role workspace) so that is left
// untouched. Everything here carries a stable doctorId/motherId plus its own
// per-item ID so it can migrate directly to MongoDB/backend APIs later.
// ---------------------------------------------------------------------------

export interface DoctorClinicTiming {
  day: string;
  hours: string;
}

export interface DoctorProfileExtras {
  doctorId: string;
  bio: string;
  languagesSpoken: string[];
  consultationModes: string[]; // e.g. "In-Person Consultation", "Video Consultation"
  clinicTimings: DoctorClinicTiming[];
  achievements: string[];
}

export type DoctorContactType = 'CALL' | 'MESSAGE' | 'VIDEO_CONSULT' | 'EMERGENCY';

export interface DoctorContactOption {
  contactId: string;
  doctorId: string;
  type: DoctorContactType;
  label: string;
  value?: string; // phone number or other reachable value, when applicable
  description: string;
  available: boolean;
}

export interface ConsultationLogEntry {
  logId: string;
  motherId: string;
  doctorId: string;
  date: string;
  title: string;
  summary: string;
  relatedAppointmentId?: string;
}
