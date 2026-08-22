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
