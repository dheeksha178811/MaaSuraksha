import { BaseUser } from './user';

export interface DoctorProfile extends BaseUser {
  role: 'doctor';
  specialization: string; // e.g. "Consultant Gynecologist & Obstetrician"
  qualification: string; // e.g. "MBBS, MD (OBG)"
  hospitalId: string;
  hospitalName: string;
  experienceYears: number;
  availableDays: string[];
  location?: string;
}
