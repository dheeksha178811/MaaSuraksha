// ---------------------------------------------------------------------------
// Mother-side "My Hospital" module.
// Supplementary hospital detail — services, care team roster, and extended
// facility info — kept separate from the core `HospitalProfile` type (used
// by the Hospital role workspace and Doctor's "My Hospital" page) so those
// are left untouched. Everything here carries a stable hospitalId and its
// own per-item ID so it can migrate directly to MongoDB/backend APIs later.
// ---------------------------------------------------------------------------

export type HospitalServiceCategory =
  | 'ANTENATAL'
  | 'DELIVERY'
  | 'POSTNATAL'
  | 'PEDIATRIC'
  | 'DIAGNOSTIC'
  | 'EMERGENCY';

export interface HospitalService {
  serviceId: string;
  hospitalId: string;
  name: string;
  category: HospitalServiceCategory;
  description: string;
  availability: string; // e.g. "24/7", "Mon-Sat, 9:00 AM - 6:00 PM"
}

export interface CareTeamMember {
  memberId: string;
  hospitalId: string;
  doctorId?: string;
  name: string;
  role: string; // e.g. "Consultant Gynecologist & Obstetrician", "Staff Nurse - Maternity Ward"
  department: string;
  isPrimaryDoctor: boolean;
  contactNote?: string;
}

export interface HospitalProfileExtras {
  hospitalId: string;
  tagline: string;
  establishedYear: number;
  accreditations: string[];
  visitingHours: string;
  emergencyContactNumber: string;
  ambulanceAvailable: boolean;
}
