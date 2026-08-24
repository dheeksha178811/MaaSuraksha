// ---------------------------------------------------------------------------
// Module 4B: Mother Medications
// Full medication record for the Mother-side Medications module. Carries
// explicit motherId / doctorId / hospitalId / medicationId linkage so this
// mock shape can be swapped for backend/MongoDB data later without any UI
// changes.
// ---------------------------------------------------------------------------

export type MedicationStatus = 'active' | 'completed';

export interface MotherMedication {
  medicationId: string;
  motherId: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  startDate: string;
  endDate?: string;
  status: MedicationStatus;
  instructions?: string;
  caution?: string;
  childId?: string;
  childName?: string;
}
