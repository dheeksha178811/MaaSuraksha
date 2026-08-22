import { BaseUser } from './user';

export interface HospitalProfile extends BaseUser {
  role: 'hospital';
  facilityName: string;
  facilityType: 'Government PHC' | 'District Hospital' | 'Private Maternity Center';
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  contactNumber: string;
  totalBeds: number;
  neonatalICUAvailable: boolean;
}
