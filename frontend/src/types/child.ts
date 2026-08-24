export type Gender = 'boy' | 'girl';

export interface ChildProfile {
  id: string;
  motherId: string;
  name: string;
  gender: Gender;
  dateOfBirth: string;
  ageDisplay: string; // e.g. "5 weeks"
  birthWeightKg: number;
  currentWeightKg: number;
  bloodGroup: string;
  birthHospital: string;
}
