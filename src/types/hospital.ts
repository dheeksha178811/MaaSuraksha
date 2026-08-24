import { BaseUser } from './user';

export type HospitalOperationalStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';

export interface HospitalProfile extends BaseUser {
  role: 'hospital';
  facilityName: string;
  facilityType: 'Government PHC' | 'District Hospital' | 'Private Maternity Center';
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  contactNumber: string;
  totalBeds: number;
  availableBeds?: number;
  neonatalICUAvailable: boolean;
  status?: HospitalOperationalStatus;
}
