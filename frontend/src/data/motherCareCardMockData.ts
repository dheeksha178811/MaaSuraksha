import { mockChild, mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { MaternalCareCard } from '@/types';

/**
 * Realistic issued care-identity card for Ananya Kapoor, reusing the same
 * motherId as the core `mockMother` record so this can later be joined
 * directly against a real `careCards` collection.
 */
export const maternalCareCard: MaternalCareCard = {
  cardId: 'card_01',
  motherId: mockMother.id,
  maaSurakshaId: 'MS-KA-2026-048213',
  issuedDate: mockMother.createdAt,
  validThrough: '2029-01-10',
};

export const getCareCardForMother = (motherId: string): MaternalCareCard | undefined =>
  maternalCareCard.motherId === motherId ? maternalCareCard : undefined;

export interface CareCardQrPayload {
  type: 'MAASURAKSHA_CARE_CARD';
  version: 1;
  maaSurakshaId: string;
  motherId: string;
  name: string;
  bloodGroup: string;
  stage: string;
  emergencyContact: { name: string; relation: string; phone: string };
  assignedHospitalId: string;
  assignedHospitalName: string;
  assignedDoctorId: string;
  assignedDoctorName: string;
  childId?: string;
  childName?: string;
  childBloodGroup?: string;
}

/**
 * Builds the compact identity payload encoded into the QR code. Assembled
 * from the already-persisted mother/child/doctor/hospital records rather
 * than stored on the card itself, so it always reflects current data.
 */
export const buildCareCardQrPayload = (card: MaternalCareCard): CareCardQrPayload => ({
  type: 'MAASURAKSHA_CARE_CARD',
  version: 1,
  maaSurakshaId: card.maaSurakshaId,
  motherId: mockMother.id,
  name: mockMother.name,
  bloodGroup: mockMother.bloodGroup,
  stage: mockMother.stage,
  emergencyContact: mockMother.emergencyContact,
  assignedHospitalId: mockHospital.id,
  assignedHospitalName: mockHospital.name,
  assignedDoctorId: mockDoctor.id,
  assignedDoctorName: mockDoctor.name,
  childId: mockChild.id,
  childName: mockChild.name,
  childBloodGroup: mockChild.bloodGroup,
});

export const getCareCardQrValue = (card: MaternalCareCard): string =>
  JSON.stringify(buildCareCardQrPayload(card));
