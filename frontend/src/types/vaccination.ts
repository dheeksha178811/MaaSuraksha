export type VaccineStatus = 'completed' | 'due_soon' | 'upcoming' | 'overdue';

export interface VaccinationRecord {
  id: string;
  childId: string;
  vaccineName: string;
  targetAgeDescription: string; // e.g. "6 Weeks"
  recommendedDate: string;
  givenDate?: string;
  status: VaccineStatus;
  notes?: string;
  administeredBy?: string;
}

// ---------------------------------------------------------------------------
// Module 4C: Mother Vaccinations
// Full immunization record for the Mother-side Vaccinations module, covering
// both maternal (e.g. TT/Td, antenatal flu) and child (National Immunization
// Schedule) doses. Carries explicit motherId / childId / doctorId / hospitalId
// / vaccinationId linkage so this mock shape can be swapped for backend/
// MongoDB data later without any UI changes. Reuses the existing VaccineStatus
// type above so status semantics stay consistent across the app.
// ---------------------------------------------------------------------------

export type VaccineRecipientType = 'MOTHER' | 'CHILD';

export interface MotherVaccinationRecord {
  vaccinationId: string;
  motherId: string;
  childId?: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  recipientType: VaccineRecipientType;
  recipientName: string;
  vaccineName: string;
  doseLabel: string; // e.g. "Dose 1 of 2", "Birth Dose", "6 Weeks"
  recommendedDate: string;
  givenDate?: string;
  status: VaccineStatus;
  location: string;
  notes?: string;
  administeredBy?: string;
  reminderEnabled?: boolean;
}
