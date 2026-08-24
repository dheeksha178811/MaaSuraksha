import { BaseUser } from './user';

export type MaternalStage = 'pregnancy' | 'postpartum' | 'infant_care';

export interface MotherProfile extends BaseUser {
  role: 'mother';
  age: number;
  stage: MaternalStage;
  pregnancyWeek?: number;
  deliveryDate?: string;
  assignedHospitalId: string;
  assignedHospitalName: string;
  assignedDoctorId: string;
  assignedDoctorName: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  bloodGroup: string;
  location: string;
}
