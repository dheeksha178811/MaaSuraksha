import { mockChild, mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { doctorPatients, doctorPatientChildren } from '@/data/doctorPatientsMockData';
import {
  DeliveryRecord,
  HospitalActivityItem,
  HospitalAlert,
  HospitalBed,
  HospitalPatient,
  HospitalReferral,
  HospitalSettings,
  NeonatalRecord,
  VaccineInventoryItem,
} from '@/types';

/**
 * Fixed "now" reference for this mock dataset, matching DOCTOR_TODAY_ISO in
 * doctorPatientsMockData.ts so hospital-side records agree with the rest of
 * the app on what counts as "today".
 */
export const HOSPITAL_TODAY_ISO = '2026-08-23';
export const HOSPITAL_NOW_ISO = '2026-08-23T09:15:00';

// ---------------------------------------------------------------------------
// Mother directory
// The Hospital portal covers the whole facility, not just Dr. Priya Menon's
// personal patient panel — so a few additional mothers are introduced here
// beyond the 8 already defined in `doctorPatientsMockData.ts`. Every
// motherId referenced anywhere in this file resolves through this directory,
// so relationships stay internally consistent without inventing a second,
// disconnected patient universe.
// ---------------------------------------------------------------------------

export interface HospitalMotherDirectoryEntry {
  motherId: string;
  name: string;
  age: number;
}

const ADDITIONAL_HOSPITAL_MOTHERS: HospitalMotherDirectoryEntry[] = [
  { motherId: 'usr_mother_10', name: 'Lakshmi Pillai', age: 34 },
  { motherId: 'usr_mother_11', name: 'Nandini Rao', age: 26 },
  { motherId: 'usr_mother_12', name: 'Priya Bhatt', age: 29 },
  { motherId: 'usr_mother_13', name: 'Anjali Rao', age: 31 },
];

export const hospitalMotherDirectory: HospitalMotherDirectoryEntry[] = [
  { motherId: mockMother.id, name: mockMother.name, age: mockMother.age },
  ...doctorPatients
    .filter((p) => p.motherId !== mockMother.id && p.hospitalId === mockHospital.id)
    .map((p) => ({ motherId: p.motherId, name: p.name, age: p.age })),
  ...ADDITIONAL_HOSPITAL_MOTHERS,
];

export const getMotherName = (motherId: string): string =>
  hospitalMotherDirectory.find((m) => m.motherId === motherId)?.name || 'Unknown Mother';

export const getMotherAge = (motherId: string): number =>
  hospitalMotherDirectory.find((m) => m.motherId === motherId)?.age || 0;

// ---------------------------------------------------------------------------
// Beds
// ---------------------------------------------------------------------------

export const hospitalBeds: HospitalBed[] = [
  // Antenatal Ward
  { id: 'bed_01', hospitalId: mockHospital.id, ward: 'Antenatal Ward', bedNumber: 'AW-01', bedType: 'MATERNITY', status: 'AVAILABLE', lastUpdatedAt: '2026-08-20T08:00:00' },
  { id: 'bed_02', hospitalId: mockHospital.id, ward: 'Antenatal Ward', bedNumber: 'AW-02', bedType: 'MATERNITY', status: 'AVAILABLE', lastUpdatedAt: '2026-08-20T08:00:00' },
  { id: 'bed_03', hospitalId: mockHospital.id, ward: 'Antenatal Ward', bedNumber: 'AW-03', bedType: 'MATERNITY', status: 'OCCUPIED', lastUpdatedAt: '2026-08-21T09:00:00' },
  { id: 'bed_04', hospitalId: mockHospital.id, ward: 'Antenatal Ward', bedNumber: 'AW-04', bedType: 'MATERNITY', status: 'RESERVED', lastUpdatedAt: '2026-08-22T12:00:00' },
  { id: 'bed_05', hospitalId: mockHospital.id, ward: 'Antenatal Ward', bedNumber: 'AW-05', bedType: 'MATERNITY', status: 'OCCUPIED', patientId: 'hpat_04', lastUpdatedAt: '2026-08-18T09:30:00' },
  { id: 'bed_06', hospitalId: mockHospital.id, ward: 'Antenatal Ward', bedNumber: 'AW-06', bedType: 'MATERNITY', status: 'AVAILABLE', lastUpdatedAt: '2026-08-19T08:00:00' },
  // Labor & Delivery
  { id: 'bed_07', hospitalId: mockHospital.id, ward: 'Labor & Delivery', bedNumber: 'LD-01', bedType: 'MATERNITY', status: 'OCCUPIED', lastUpdatedAt: '2026-08-23T08:00:00' },
  { id: 'bed_08', hospitalId: mockHospital.id, ward: 'Labor & Delivery', bedNumber: 'LD-02', bedType: 'MATERNITY', status: 'AVAILABLE', lastUpdatedAt: '2026-08-21T08:00:00' },
  { id: 'bed_09', hospitalId: mockHospital.id, ward: 'Labor & Delivery', bedNumber: 'LD-03', bedType: 'MATERNITY', status: 'MAINTENANCE', lastUpdatedAt: '2026-08-20T07:00:00' },
  // Postnatal Ward
  { id: 'bed_10', hospitalId: mockHospital.id, ward: 'Postnatal Ward', bedNumber: 'PN-01', bedType: 'POSTNATAL', status: 'AVAILABLE', lastUpdatedAt: '2026-08-20T08:00:00' },
  { id: 'bed_11', hospitalId: mockHospital.id, ward: 'Postnatal Ward', bedNumber: 'PN-02', bedType: 'POSTNATAL', status: 'AVAILABLE', lastUpdatedAt: '2026-08-20T08:00:00' },
  { id: 'bed_12', hospitalId: mockHospital.id, ward: 'Postnatal Ward', bedNumber: 'PN-03', bedType: 'POSTNATAL', status: 'OCCUPIED', lastUpdatedAt: '2026-08-22T09:00:00' },
  { id: 'bed_13', hospitalId: mockHospital.id, ward: 'Postnatal Ward', bedNumber: 'PN-04', bedType: 'POSTNATAL', status: 'AVAILABLE', lastUpdatedAt: '2026-08-19T08:00:00' },
  { id: 'bed_14', hospitalId: mockHospital.id, ward: 'Postnatal Ward', bedNumber: 'PN-05', bedType: 'POSTNATAL', status: 'RESERVED', lastUpdatedAt: '2026-08-22T15:00:00' },
  { id: 'bed_15', hospitalId: mockHospital.id, ward: 'Postnatal Ward', bedNumber: 'PN-06', bedType: 'POSTNATAL', status: 'AVAILABLE', lastUpdatedAt: '2026-08-18T08:00:00' },
  // NICU
  { id: 'bed_16', hospitalId: mockHospital.id, ward: 'NICU', bedNumber: 'NICU-01', bedType: 'NICU', status: 'OCCUPIED', lastUpdatedAt: '2026-08-23T09:00:00' },
  { id: 'bed_17', hospitalId: mockHospital.id, ward: 'NICU', bedNumber: 'NICU-02', bedType: 'NICU', status: 'OCCUPIED', lastUpdatedAt: '2026-08-22T10:30:00' },
  { id: 'bed_18', hospitalId: mockHospital.id, ward: 'NICU', bedNumber: 'NICU-03', bedType: 'NICU', status: 'AVAILABLE', lastUpdatedAt: '2026-08-20T08:00:00' },
  { id: 'bed_19', hospitalId: mockHospital.id, ward: 'NICU', bedNumber: 'NICU-04', bedType: 'NICU', status: 'AVAILABLE', lastUpdatedAt: '2026-08-20T08:00:00' },
  { id: 'bed_20', hospitalId: mockHospital.id, ward: 'NICU', bedNumber: 'NICU-05', bedType: 'NICU', status: 'MAINTENANCE', lastUpdatedAt: '2026-08-17T08:00:00' },
  // General Ward
  { id: 'bed_21', hospitalId: mockHospital.id, ward: 'General Ward', bedNumber: 'GW-01', bedType: 'GENERAL', status: 'AVAILABLE', lastUpdatedAt: '2026-08-18T08:00:00' },
  { id: 'bed_22', hospitalId: mockHospital.id, ward: 'General Ward', bedNumber: 'GW-02', bedType: 'GENERAL', status: 'AVAILABLE', lastUpdatedAt: '2026-08-18T08:00:00' },
  { id: 'bed_23', hospitalId: mockHospital.id, ward: 'General Ward', bedNumber: 'GW-03', bedType: 'GENERAL', status: 'OCCUPIED', lastUpdatedAt: '2026-08-21T11:00:00' },
  { id: 'bed_24', hospitalId: mockHospital.id, ward: 'General Ward', bedNumber: 'GW-04', bedType: 'GENERAL', status: 'AVAILABLE', lastUpdatedAt: '2026-08-18T08:00:00' },
  // Emergency
  { id: 'bed_25', hospitalId: mockHospital.id, ward: 'Emergency', bedNumber: 'ER-01', bedType: 'EMERGENCY', status: 'AVAILABLE', lastUpdatedAt: '2026-08-18T08:00:00' },
  { id: 'bed_26', hospitalId: mockHospital.id, ward: 'Emergency', bedNumber: 'ER-02', bedType: 'EMERGENCY', status: 'RESERVED', lastUpdatedAt: '2026-08-22T16:00:00' },
];

// ---------------------------------------------------------------------------
// Hospital Patients (admissions)
// ---------------------------------------------------------------------------

export const hospitalPatients: HospitalPatient[] = [
  {
    id: 'hpat_01',
    hospitalId: mockHospital.id,
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    status: 'POSTPARTUM',
    riskLevel: 'LOW',
    admissionDate: '2026-07-18',
    dischargeDate: '2026-07-20',
    careType: 'POSTNATAL',
    ward: 'Postnatal Ward',
    createdAt: '2026-07-18T09:00:00',
    updatedAt: '2026-07-20T11:00:00',
  },
  {
    id: 'hpat_02',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_02',
    doctorId: mockDoctor.id,
    status: 'OUTPATIENT',
    riskLevel: 'MODERATE',
    admissionDate: '2026-08-23',
    careType: 'ANTENATAL',
    ward: 'Antenatal Ward',
    createdAt: '2026-08-23T08:00:00',
    updatedAt: '2026-08-23T08:00:00',
  },
  {
    id: 'hpat_03',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_03',
    doctorId: mockDoctor.id,
    status: 'OUTPATIENT',
    riskLevel: 'LOW',
    admissionDate: '2026-08-05',
    careType: 'ANTENATAL',
    ward: 'Antenatal Ward',
    createdAt: '2026-08-05T10:00:00',
    updatedAt: '2026-08-05T10:00:00',
  },
  {
    id: 'hpat_04',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_04',
    doctorId: mockDoctor.id,
    status: 'ADMITTED',
    riskLevel: 'HIGH',
    admissionDate: '2026-08-18',
    careType: 'ANTENATAL',
    ward: 'Antenatal Ward',
    bedId: 'bed_05',
    createdAt: '2026-08-18T09:30:00',
    updatedAt: '2026-08-23T08:00:00',
  },
  {
    id: 'hpat_05',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_05',
    doctorId: mockDoctor.id,
    status: 'DISCHARGED',
    riskLevel: 'LOW',
    admissionDate: '2026-06-02',
    dischargeDate: '2026-06-06',
    careType: 'POSTNATAL',
    ward: 'Postnatal Ward',
    createdAt: '2026-06-02T09:10:00',
    updatedAt: '2026-06-06T10:00:00',
  },
  {
    id: 'hpat_06',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_06',
    doctorId: mockDoctor.id,
    status: 'OUTPATIENT',
    riskLevel: 'LOW',
    admissionDate: '2026-08-12',
    careType: 'ANTENATAL',
    ward: 'Antenatal Ward',
    createdAt: '2026-08-12T10:00:00',
    updatedAt: '2026-08-12T10:00:00',
  },
  {
    id: 'hpat_07',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_07',
    doctorId: mockDoctor.id,
    status: 'POSTPARTUM',
    riskLevel: 'MODERATE',
    admissionDate: '2026-07-30',
    dischargeDate: '2026-08-01',
    careType: 'POSTNATAL',
    ward: 'Postnatal Ward',
    createdAt: '2026-07-30T22:45:00',
    updatedAt: '2026-08-01T10:00:00',
  },
  {
    id: 'hpat_08',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_08',
    doctorId: mockDoctor.id,
    status: 'OUTPATIENT',
    riskLevel: 'LOW',
    admissionDate: '2026-08-19',
    careType: 'ANTENATAL',
    ward: 'Antenatal Ward',
    createdAt: '2026-08-19T11:00:00',
    updatedAt: '2026-08-19T11:00:00',
  },
];

// ---------------------------------------------------------------------------
// Deliveries
// ---------------------------------------------------------------------------

export const deliveryRecords: DeliveryRecord[] = [
  {
    id: 'del_01',
    hospitalId: mockHospital.id,
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    admissionId: 'hpat_01',
    deliveryDate: '2026-07-18',
    deliveryTime: '14:20',
    deliveryType: 'VAGINAL',
    status: 'COMPLETED',
    gestationalAge: 39,
    babyCount: 1,
    maternalOutcome: 'Stable, normal recovery.',
    notes: 'Spontaneous vaginal delivery, no complications.',
    createdAt: '2026-07-18T14:20:00',
    updatedAt: '2026-07-18T16:00:00',
  },
  {
    id: 'del_02',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_05',
    doctorId: mockDoctor.id,
    admissionId: 'hpat_05',
    deliveryDate: '2026-06-02',
    deliveryTime: '09:10',
    deliveryType: 'C_SECTION',
    status: 'COMPLETED',
    gestationalAge: 38,
    babyCount: 1,
    maternalOutcome: 'Stable post-operative recovery.',
    notes: 'Planned C-section, breech presentation.',
    createdAt: '2026-06-02T09:10:00',
    updatedAt: '2026-06-02T12:00:00',
  },
  {
    id: 'del_03',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_07',
    doctorId: mockDoctor.id,
    admissionId: 'hpat_07',
    deliveryDate: '2026-07-30',
    deliveryTime: '22:45',
    deliveryType: 'VAGINAL',
    status: 'COMPLETED',
    gestationalAge: 39,
    babyCount: 1,
    maternalOutcome: 'Stable, mild postpartum fatigue.',
    createdAt: '2026-07-30T22:45:00',
    updatedAt: '2026-07-31T08:00:00',
  },
  {
    id: 'del_04',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_04',
    doctorId: mockDoctor.id,
    admissionId: 'hpat_04',
    deliveryDate: HOSPITAL_TODAY_ISO,
    deliveryTime: '08:00',
    deliveryType: 'C_SECTION',
    status: 'COMPLETED',
    gestationalAge: 37,
    babyCount: 1,
    maternalOutcome: 'Stable post-operative recovery, blood pressure controlled.',
    notes: 'Early delivery for pre-eclampsia management.',
    createdAt: '2026-08-23T08:00:00',
    updatedAt: '2026-08-23T09:00:00',
  },
  {
    id: 'del_05',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_10',
    doctorId: mockDoctor.id,
    deliveryDate: HOSPITAL_TODAY_ISO,
    deliveryTime: '16:00',
    deliveryType: 'VAGINAL',
    status: 'SCHEDULED',
    gestationalAge: 39,
    babyCount: 1,
    maternalOutcome: 'Pending',
    createdAt: '2026-08-20T10:00:00',
    updatedAt: '2026-08-20T10:00:00',
  },
  {
    id: 'del_06',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_11',
    doctorId: mockDoctor.id,
    deliveryDate: HOSPITAL_TODAY_ISO,
    deliveryTime: '11:30',
    deliveryType: 'VAGINAL',
    status: 'IN_PROGRESS',
    gestationalAge: 40,
    babyCount: 1,
    maternalOutcome: 'Pending',
    createdAt: '2026-08-23T11:30:00',
    updatedAt: '2026-08-23T11:30:00',
  },
  {
    id: 'del_07',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_12',
    doctorId: mockDoctor.id,
    deliveryDate: '2026-08-21',
    deliveryTime: '13:00',
    deliveryType: 'ASSISTED',
    status: 'CANCELLED',
    gestationalAge: 38,
    babyCount: 1,
    maternalOutcome: 'Cancelled — mother transferred to another facility before delivery.',
    notes: 'See referral ref_02.',
    createdAt: '2026-08-21T09:00:00',
    updatedAt: '2026-08-21T13:00:00',
  },
  {
    id: 'del_08',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_13',
    doctorId: mockDoctor.id,
    deliveryDate: '2026-08-22',
    deliveryTime: '10:00',
    deliveryType: 'C_SECTION',
    status: 'COMPLETED',
    gestationalAge: 34,
    babyCount: 1,
    maternalOutcome: 'Stable, preterm delivery due to early labor.',
    createdAt: '2026-08-22T10:00:00',
    updatedAt: '2026-08-22T12:00:00',
  },
];

// ---------------------------------------------------------------------------
// Neonatal Records
// Reuses the SAME child identities already established in mockData.ts /
// doctorPatientsMockData.ts (mockChild, child_05, child_07) where a delivery
// links back to one of those mothers, instead of re-describing the same baby
// with new numbers.
// ---------------------------------------------------------------------------

export const neonatalRecords: NeonatalRecord[] = [
  {
    id: 'neo_01',
    hospitalId: mockHospital.id,
    motherId: mockMother.id,
    deliveryId: 'del_01',
    doctorId: mockDoctor.id,
    dateOfBirth: mockChild.dateOfBirth,
    gender: mockChild.gender,
    birthWeightKg: mockChild.birthWeightKg,
    gestationalAge: 39,
    careLevel: 'ROUTINE',
    status: 'DISCHARGED',
    admissionDate: '2026-07-18',
    dischargeDate: '2026-07-20',
    createdAt: '2026-07-18T14:25:00',
    updatedAt: '2026-07-20T11:00:00',
  },
  {
    id: 'neo_02',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_05',
    deliveryId: 'del_02',
    doctorId: mockDoctor.id,
    dateOfBirth: doctorPatientChildren.find((c) => c.id === 'child_05')?.dateOfBirth || '2026-06-02',
    gender: doctorPatientChildren.find((c) => c.id === 'child_05')?.gender || 'boy',
    birthWeightKg: doctorPatientChildren.find((c) => c.id === 'child_05')?.birthWeightKg || 2.9,
    gestationalAge: 38,
    careLevel: 'OBSERVATION',
    status: 'DISCHARGED',
    admissionDate: '2026-06-02',
    dischargeDate: '2026-06-07',
    createdAt: '2026-06-02T09:15:00',
    updatedAt: '2026-06-07T10:00:00',
  },
  {
    id: 'neo_03',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_07',
    deliveryId: 'del_03',
    doctorId: mockDoctor.id,
    dateOfBirth: doctorPatientChildren.find((c) => c.id === 'child_07')?.dateOfBirth || '2026-07-30',
    gender: doctorPatientChildren.find((c) => c.id === 'child_07')?.gender || 'girl',
    birthWeightKg: doctorPatientChildren.find((c) => c.id === 'child_07')?.birthWeightKg || 3.0,
    gestationalAge: 39,
    careLevel: 'ROUTINE',
    status: 'DISCHARGED',
    admissionDate: '2026-07-30',
    dischargeDate: '2026-08-01',
    createdAt: '2026-07-30T22:50:00',
    updatedAt: '2026-08-01T10:00:00',
  },
  {
    id: 'neo_04',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_04',
    deliveryId: 'del_04',
    doctorId: mockDoctor.id,
    bedId: 'bed_16',
    dateOfBirth: HOSPITAL_TODAY_ISO,
    gender: 'girl',
    birthWeightKg: 2.4,
    gestationalAge: 37,
    careLevel: 'NICU',
    status: 'OBSERVATION',
    admissionDate: HOSPITAL_TODAY_ISO,
    notes: 'Admitted for observation following early delivery for maternal pre-eclampsia.',
    createdAt: '2026-08-23T09:00:00',
    updatedAt: '2026-08-23T09:00:00',
  },
  {
    id: 'neo_05',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_13',
    deliveryId: 'del_08',
    doctorId: mockDoctor.id,
    bedId: 'bed_17',
    dateOfBirth: '2026-08-22',
    gender: 'boy',
    birthWeightKg: 1.9,
    gestationalAge: 34,
    careLevel: 'NICU',
    status: 'CRITICAL',
    admissionDate: '2026-08-22',
    notes: 'Preterm, low birth weight — under close monitoring.',
    createdAt: '2026-08-22T10:10:00',
    updatedAt: '2026-08-23T06:00:00',
  },
];

// ---------------------------------------------------------------------------
// Vaccines / Cold Chain
// ---------------------------------------------------------------------------

export const vaccineInventory: VaccineInventoryItem[] = [
  {
    id: 'vinv_01',
    hospitalId: mockHospital.id,
    vaccineName: 'BCG',
    vaccineCode: 'BCG',
    batchNumber: 'BCG-2026-114',
    manufacturer: 'Serum Institute of India',
    quantityReceived: 500,
    quantityAvailable: 320,
    expiryDate: '2027-03-01',
    storageLocation: 'Cold Room A — Shelf 2',
    minTemperature: 2,
    maxTemperature: 8,
    currentTemperature: 5,
    temperatureStatus: 'NORMAL',
    receivedDate: '2026-07-01',
    status: 'AVAILABLE',
  },
  {
    id: 'vinv_02',
    hospitalId: mockHospital.id,
    vaccineName: 'Oral Polio Vaccine (OPV)',
    vaccineCode: 'OPV',
    batchNumber: 'OPV-2026-089',
    manufacturer: 'Bharat Biotech',
    quantityReceived: 400,
    quantityAvailable: 45,
    expiryDate: '2026-09-15',
    storageLocation: 'Cold Room A — Shelf 1',
    minTemperature: 2,
    maxTemperature: 8,
    currentTemperature: 6,
    temperatureStatus: 'NORMAL',
    receivedDate: '2026-06-10',
    status: 'LOW_STOCK',
  },
  {
    id: 'vinv_03',
    hospitalId: mockHospital.id,
    vaccineName: 'Hepatitis B',
    vaccineCode: 'HEPB',
    batchNumber: 'HEPB-2026-201',
    manufacturer: 'Bio-Med Pvt Ltd',
    quantityReceived: 300,
    quantityAvailable: 210,
    expiryDate: '2026-08-28',
    storageLocation: 'Cold Room B — Shelf 3',
    minTemperature: 2,
    maxTemperature: 8,
    currentTemperature: 7,
    temperatureStatus: 'NORMAL',
    receivedDate: '2026-05-20',
    status: 'AVAILABLE',
  },
  {
    id: 'vinv_04',
    hospitalId: mockHospital.id,
    vaccineName: 'Pentavalent',
    vaccineCode: 'PENTA',
    batchNumber: 'PENTA-2025-450',
    manufacturer: 'Serum Institute of India',
    quantityReceived: 350,
    quantityAvailable: 0,
    expiryDate: '2026-07-01',
    storageLocation: 'Cold Room A — Shelf 2',
    minTemperature: 2,
    maxTemperature: 8,
    currentTemperature: 5,
    temperatureStatus: 'NORMAL',
    receivedDate: '2025-12-01',
    status: 'EXPIRED',
  },
  {
    id: 'vinv_05',
    hospitalId: mockHospital.id,
    vaccineName: 'Rotavirus',
    vaccineCode: 'ROTA',
    batchNumber: 'ROTA-2026-077',
    manufacturer: 'Bharat Biotech',
    quantityReceived: 200,
    quantityAvailable: 150,
    expiryDate: '2027-01-10',
    storageLocation: 'Cold Room B — Shelf 1',
    minTemperature: 2,
    maxTemperature: 8,
    currentTemperature: 11,
    temperatureStatus: 'CRITICAL',
    receivedDate: '2026-06-15',
    status: 'QUARANTINED',
  },
  {
    id: 'vinv_06',
    hospitalId: mockHospital.id,
    vaccineName: 'Pneumococcal Conjugate (PCV)',
    vaccineCode: 'PCV',
    batchNumber: 'PCV-2026-033',
    manufacturer: 'Pfizer',
    quantityReceived: 250,
    quantityAvailable: 180,
    expiryDate: '2027-02-20',
    storageLocation: 'Cold Room A — Shelf 3',
    minTemperature: 2,
    maxTemperature: 8,
    currentTemperature: 8.5,
    temperatureStatus: 'WARNING',
    receivedDate: '2026-08-19',
    status: 'AVAILABLE',
  },
  {
    id: 'vinv_07',
    hospitalId: mockHospital.id,
    vaccineName: 'Tetanus Toxoid (TT)',
    vaccineCode: 'TT',
    batchNumber: 'TT-2026-019',
    manufacturer: 'Serum Institute of India',
    quantityReceived: 600,
    quantityAvailable: 480,
    expiryDate: '2027-06-01',
    storageLocation: 'Cold Room B — Shelf 2',
    minTemperature: 2,
    maxTemperature: 8,
    currentTemperature: 4,
    temperatureStatus: 'NORMAL',
    receivedDate: '2026-04-10',
    status: 'AVAILABLE',
  },
  {
    id: 'vinv_08',
    hospitalId: mockHospital.id,
    vaccineName: 'Measles-Rubella (MR)',
    vaccineCode: 'MR',
    batchNumber: 'MR-2026-058',
    manufacturer: 'Serum Institute of India',
    quantityReceived: 300,
    quantityAvailable: 25,
    expiryDate: '2026-10-05',
    storageLocation: 'Cold Room A — Shelf 1',
    minTemperature: 2,
    maxTemperature: 8,
    currentTemperature: 5,
    temperatureStatus: 'NORMAL',
    receivedDate: '2026-06-01',
    status: 'LOW_STOCK',
  },
];

// ---------------------------------------------------------------------------
// Referral destinations
// Lightweight stubs (not full HospitalProfile records) for facilities this
// hospital can refer mothers to. `hospitalId` is still the identity that
// `HospitalReferral.toHospitalId` stores — `name` is just resolved here for
// the referral form's destination picker.
// ---------------------------------------------------------------------------

export interface ReferralDestination {
  hospitalId: string;
  name: string;
}

export const referralDestinations: ReferralDestination[] = [
  { hospitalId: 'hosp_03', name: 'Manipal Hospital, Old Airport Road' },
  { hospitalId: 'hosp_04', name: 'Fortis La Femme, Bannerghatta Road' },
];

// ---------------------------------------------------------------------------
// Referrals
// toHospitalId values reference lightweight destination stubs (not every
// referral target needs a full HospitalProfile record — toHospitalName is a
// denormalized display cache, not the identity).
// ---------------------------------------------------------------------------

export const hospitalReferrals: HospitalReferral[] = [
  {
    id: 'ref_01',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_02',
    fromHospitalId: mockHospital.id,
    toHospitalId: 'hosp_03',
    toHospitalName: 'Manipal Hospital, Old Airport Road',
    referringDoctorId: mockDoctor.id,
    reason: 'Endocrinology-obstetric specialist review requested for gestational diabetes management.',
    priority: 'ROUTINE',
    status: 'PENDING',
    createdAt: '2026-08-20T09:00:00',
    updatedAt: '2026-08-20T09:00:00',
  },
  {
    id: 'ref_02',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_12',
    fromHospitalId: mockHospital.id,
    toHospitalId: 'hosp_04',
    toHospitalName: 'Fortis La Femme, Bannerghatta Road',
    referringDoctorId: mockDoctor.id,
    reason: 'Suspected placental abruption — required immediate tertiary NICU-equipped facility.',
    priority: 'EMERGENCY',
    status: 'COMPLETED',
    createdAt: '2026-08-21T12:30:00',
    updatedAt: '2026-08-21T14:00:00',
    notes: 'Mother and referral team confirmed safe transfer.',
  },
  {
    id: 'ref_03',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_07',
    fromHospitalId: mockHospital.id,
    toHospitalId: 'hosp_03',
    toHospitalName: 'Manipal Hospital, Old Airport Road',
    referringDoctorId: mockDoctor.id,
    reason: 'Persistent postpartum anemia — hematology consult requested.',
    priority: 'URGENT',
    status: 'ACCEPTED',
    createdAt: '2026-08-21T16:00:00',
    updatedAt: '2026-08-22T08:00:00',
  },
  {
    id: 'ref_04',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_13',
    fromHospitalId: mockHospital.id,
    toHospitalId: 'hosp_04',
    toHospitalName: 'Fortis La Femme, Bannerghatta Road',
    referringDoctorId: mockDoctor.id,
    reason: 'Neonate requires Level III NICU — current facility NICU near capacity.',
    priority: 'EMERGENCY',
    status: 'IN_TRANSIT',
    createdAt: '2026-08-22T11:00:00',
    updatedAt: '2026-08-22T13:00:00',
    notes: 'Neonatal transport team en route.',
  },
  {
    id: 'ref_05',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_06',
    fromHospitalId: mockHospital.id,
    toHospitalId: 'hosp_03',
    toHospitalName: 'Manipal Hospital, Old Airport Road',
    referringDoctorId: mockDoctor.id,
    reason: 'Routine high-risk obstetric second opinion requested by family.',
    priority: 'ROUTINE',
    status: 'REJECTED',
    createdAt: '2026-08-19T10:00:00',
    updatedAt: '2026-08-19T15:00:00',
    notes: 'Receiving facility at full capacity; patient continuing care at Sunrise.',
  },
  {
    id: 'ref_06',
    hospitalId: mockHospital.id,
    motherId: 'usr_mother_03',
    fromHospitalId: mockHospital.id,
    toHospitalId: 'hosp_03',
    toHospitalName: 'Manipal Hospital, Old Airport Road',
    referringDoctorId: mockDoctor.id,
    reason: 'Requested transfer for family convenience, closer to home.',
    priority: 'ROUTINE',
    status: 'CANCELLED',
    createdAt: '2026-08-15T09:00:00',
    updatedAt: '2026-08-15T09:30:00',
    notes: 'Mother decided to continue care at Sunrise; referral cancelled.',
  },
];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export const hospitalAlerts: HospitalAlert[] = [
  {
    id: 'alert_01',
    hospitalId: mockHospital.id,
    type: 'BED_CAPACITY',
    severity: 'WARNING',
    title: 'Bed Capacity Running Low',
    description: 'Only 14 of 26 tracked beds are currently available across the facility.',
    createdAt: '2026-08-23T07:00:00',
    status: 'ACTIVE',
  },
  {
    id: 'alert_02',
    hospitalId: mockHospital.id,
    type: 'VACCINE_STOCK',
    severity: 'WARNING',
    title: 'OPV Stock Running Low',
    description: 'Oral Polio Vaccine batch OPV-2026-089 has only 45 doses remaining.',
    createdAt: '2026-08-22T18:00:00',
    status: 'ACTIVE',
  },
  {
    id: 'alert_03',
    hospitalId: mockHospital.id,
    type: 'HIGH_RISK_REFERRAL',
    severity: 'CRITICAL',
    title: 'Emergency Referral In Transit',
    description: "Anjali Rao's newborn is in transit to Fortis La Femme — confirm receiving NICU bed.",
    createdAt: '2026-08-22T13:15:00',
    status: 'ACTIVE',
  },
  {
    id: 'alert_04',
    hospitalId: mockHospital.id,
    type: 'NEONATAL_BED_SHORTAGE',
    severity: 'CRITICAL',
    title: 'NICU Near Capacity',
    description: '3 of 5 NICU beds are occupied or under maintenance — monitor incoming admissions closely.',
    createdAt: '2026-08-23T06:30:00',
    status: 'ACTIVE',
  },
  {
    id: 'alert_05',
    hospitalId: mockHospital.id,
    type: 'FOLLOW_UP_REQUIRED',
    severity: 'INFO',
    title: 'Follow-up Required: Ritika Verma',
    description: 'Postpartum anemia follow-up is overdue; hematology referral accepted and pending transfer.',
    createdAt: '2026-08-21T09:00:00',
    status: 'ACKNOWLEDGED',
  },
];

// ---------------------------------------------------------------------------
// Recent Activity
// ---------------------------------------------------------------------------

export const hospitalActivity: HospitalActivityItem[] = [
  {
    id: 'act_01',
    hospitalId: mockHospital.id,
    type: 'DELIVERY_RECORDED',
    description: 'Delivery completed for Kavya Reddy (C-Section).',
    timestamp: '2026-08-23T08:45:00',
    relatedId: 'del_04',
  },
  {
    id: 'act_02',
    hospitalId: mockHospital.id,
    type: 'NEONATAL_ADMISSION',
    description: "Newborn admitted to NICU following Kavya Reddy's delivery.",
    timestamp: '2026-08-23T09:00:00',
    relatedId: 'neo_04',
  },
  {
    id: 'act_03',
    hospitalId: mockHospital.id,
    type: 'REFERRAL_CREATED',
    description: "Emergency referral created for Anjali Rao's newborn to Fortis La Femme.",
    timestamp: '2026-08-22T13:00:00',
    relatedId: 'ref_04',
  },
  {
    id: 'act_04',
    hospitalId: mockHospital.id,
    type: 'DELIVERY_RECORDED',
    description: 'Preterm delivery recorded for Anjali Rao (C-Section).',
    timestamp: '2026-08-22T10:00:00',
    relatedId: 'del_08',
  },
  {
    id: 'act_05',
    hospitalId: mockHospital.id,
    type: 'MOTHER_ADMITTED',
    description: 'Kavya Reddy admitted to Antenatal Ward, Bed AW-05 for high-risk monitoring.',
    timestamp: '2026-08-18T09:30:00',
    relatedId: 'hpat_04',
  },
  {
    id: 'act_06',
    hospitalId: mockHospital.id,
    type: 'BED_STATUS_CHANGED',
    description: 'Bed LD-03 (Labor & Delivery) marked Under Maintenance.',
    timestamp: '2026-08-20T07:00:00',
    relatedId: 'bed_09',
  },
  {
    id: 'act_07',
    hospitalId: mockHospital.id,
    type: 'VACCINE_BATCH_RECEIVED',
    description: 'Received 250 doses of PCV vaccine, batch PCV-2026-033.',
    timestamp: '2026-08-19T10:00:00',
    relatedId: 'vinv_06',
  },
  {
    id: 'act_08',
    hospitalId: mockHospital.id,
    type: 'REFERRAL_CREATED',
    description: 'Referral created for Priya Bhatt — suspected placental abruption.',
    timestamp: '2026-08-21T12:30:00',
    relatedId: 'ref_02',
  },
];

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const defaultHospitalSettings: HospitalSettings = {
  hospitalId: mockHospital.id,
  facility: {
    autoAssignBeds: false,
    showBedAvailabilityWidget: true,
  },
  notifications: {
    criticalBedAlerts: true,
    vaccineStockAlerts: true,
    temperatureAlerts: true,
    referralAlerts: true,
    deliveryNotifications: true,
    reportNotifications: false,
  },
  operational: {
    defaultPatientListView: 'ALL',
    defaultReferralView: 'PENDING',
    lowStockThreshold: 50,
  },
  privacy: {
    twoFactorEnabled: false,
    restrictPatientDataExport: true,
  },
};
