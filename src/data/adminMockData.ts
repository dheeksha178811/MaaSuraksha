import { mockHospital } from '@/data/mockData';
import { doctorPatients } from '@/data/doctorPatientsMockData';
import { HOSPITAL_NOW_ISO, deliveryRecords, hospitalBeds, hospitalMotherDirectory } from '@/data/hospitalMockData';
import { AdminAlert, AdminSettings, Facility, HighRiskCase, ImmunizationCoverageStat } from '@/types';

export const ADMIN_ID = 'usr_admin_01';
export const ADMIN_NOW_ISO = HOSPITAL_NOW_ISO;

const hosp01Patients = doctorPatients.filter((p) => p.hospitalId === mockHospital.id);

// ---------------------------------------------------------------------------
// High-Risk Monitoring
// Reuses the SAME mothers/doctors/hospital already established for hosp_01
// (Kavya Reddy, Meera Iyer, Ritika Verma, Anjali Rao from Module 6/Doctor
// data); a few additional cases are introduced for the other facilities so
// district-wide monitoring isn't limited to a single hospital's roster.
// Declared before `facilities` below so hosp_01's facility-level
// `highRiskCases` count can be computed from these SAME records — keeping
// the Facility Detail page's stat card consistent with the case list it
// renders directly underneath it.
// ---------------------------------------------------------------------------

export const highRiskCases: HighRiskCase[] = [
  {
    id: 'hrc_01',
    motherId: 'usr_mother_04',
    motherName: 'Kavya Reddy',
    hospitalId: mockHospital.id,
    doctorId: 'doc_01',
    riskLevel: 'HIGH',
    riskFactors: ['Pre-eclampsia', 'Elevated blood pressure'],
    status: 'UNDER_REVIEW',
    flaggedAt: '2026-08-18',
    updatedAt: '2026-08-23',
    notes: 'Delivered via C-section on 2026-08-23; postnatal BP monitoring ongoing.',
  },
  {
    id: 'hrc_02',
    motherId: 'usr_mother_02',
    motherName: 'Meera Iyer',
    hospitalId: mockHospital.id,
    doctorId: 'doc_01',
    riskLevel: 'MODERATE',
    riskFactors: ['Gestational diabetes'],
    status: 'MONITORING',
    flaggedAt: '2026-08-10',
    updatedAt: '2026-08-21',
  },
  {
    id: 'hrc_03',
    motherId: 'usr_mother_07',
    motherName: 'Ritika Verma',
    hospitalId: mockHospital.id,
    doctorId: 'doc_01',
    riskLevel: 'MODERATE',
    riskFactors: ['Postpartum anemia'],
    status: 'FLAGGED',
    flaggedAt: '2026-08-21',
    updatedAt: '2026-08-21',
  },
  {
    id: 'hrc_04',
    motherId: 'usr_mother_13',
    motherName: 'Anjali Rao',
    hospitalId: mockHospital.id,
    doctorId: 'doc_01',
    riskLevel: 'HIGH',
    riskFactors: ['Preterm delivery', 'Low birth weight neonate'],
    status: 'UNDER_REVIEW',
    flaggedAt: '2026-08-22',
    updatedAt: '2026-08-23',
  },
  {
    id: 'hrc_05',
    motherId: 'usr_mother_20',
    motherName: 'Meenakshi Pillai',
    hospitalId: 'hosp_02',
    doctorId: 'doc_02',
    riskLevel: 'HIGH',
    riskFactors: ['Placenta previa'],
    status: 'FLAGGED',
    flaggedAt: '2026-08-19',
    updatedAt: '2026-08-19',
  },
  {
    id: 'hrc_06',
    motherId: 'usr_mother_21',
    motherName: 'Kavitha Shetty',
    hospitalId: 'hosp_03',
    doctorId: 'doc_03',
    riskLevel: 'HIGH',
    riskFactors: ['Twin pregnancy', 'Gestational hypertension'],
    status: 'MONITORING',
    flaggedAt: '2026-08-15',
    updatedAt: '2026-08-20',
  },
  {
    id: 'hrc_07',
    motherId: 'usr_mother_22',
    motherName: 'Farha Ansari',
    hospitalId: 'hosp_06',
    doctorId: 'doc_04',
    riskLevel: 'MODERATE',
    riskFactors: ['Anemia', 'Low BMI'],
    status: 'RESOLVED',
    flaggedAt: '2026-08-05',
    updatedAt: '2026-08-20',
  },
];

// ---------------------------------------------------------------------------
// Facilities
// hosp_01 (Sunrise Women & Children Hospital) reuses the SAME record already
// defined for the Hospital portal (Module 6) — its operational figures are
// computed from the real Module 6 / Doctor mock data rather than duplicated
// by hand. The remaining facilities round out a believable district network;
// hosp_02–hosp_04 reuse hospitalIds already referenced elsewhere in the app
// (pat_09's hospital from the Doctor module, and the two Module 6 referral
// destinations) rather than inventing disconnected new ones.
// ---------------------------------------------------------------------------

const sunriseFacility: Facility = {
  id: mockHospital.id,
  name: mockHospital.facilityName,
  facilityType: mockHospital.facilityType,
  city: mockHospital.city,
  state: mockHospital.state,
  totalBeds: mockHospital.totalBeds,
  availableBeds: hospitalBeds.filter((b) => b.hospitalId === mockHospital.id && b.status === 'AVAILABLE').length,
  registeredMothers: hospitalMotherDirectory.length,
  activePregnancies: hosp01Patients.filter((p) => p.stage === 'ANTENATAL').length,
  deliveriesThisMonth: deliveryRecords.filter((d) => d.hospitalId === mockHospital.id && d.deliveryDate.startsWith('2026-08')).length,
  // Computed from the SAME `highRiskCases` records shown on the Facility
  // Detail page (not just `doctorPatients`' riskLevel==='HIGH' patients),
  // so the stat card here always matches the case list rendered under it.
  highRiskCases: highRiskCases.filter((c) => c.hospitalId === mockHospital.id).length,
  doctorCount: 6,
  neonatalICUAvailable: mockHospital.neonatalICUAvailable,
  status: mockHospital.status || 'ACTIVE',
  lastReportedAt: HOSPITAL_NOW_ISO,
};

export const facilities: Facility[] = [
  sunriseFacility,
  {
    id: 'hosp_02',
    name: "Andheri Maternity & Children's Hospital",
    facilityType: 'District Hospital',
    city: 'Mumbai',
    state: 'Maharashtra',
    totalBeds: 80,
    availableBeds: 22,
    registeredMothers: 340,
    activePregnancies: 210,
    deliveriesThisMonth: 38,
    highRiskCases: 14,
    doctorCount: 9,
    neonatalICUAvailable: true,
    status: 'ACTIVE',
    lastReportedAt: '2026-08-22T18:00:00',
  },
  {
    id: 'hosp_03',
    name: 'Manipal Hospital, Old Airport Road',
    facilityType: 'Private Maternity Center',
    city: 'Bengaluru',
    state: 'Karnataka',
    totalBeds: 200,
    availableBeds: 45,
    registeredMothers: 510,
    activePregnancies: 300,
    deliveriesThisMonth: 52,
    highRiskCases: 21,
    doctorCount: 14,
    neonatalICUAvailable: true,
    status: 'ACTIVE',
    lastReportedAt: '2026-08-23T06:00:00',
  },
  {
    id: 'hosp_04',
    name: 'Fortis La Femme, Bannerghatta Road',
    facilityType: 'Private Maternity Center',
    city: 'Bengaluru',
    state: 'Karnataka',
    totalBeds: 150,
    availableBeds: 12,
    registeredMothers: 420,
    activePregnancies: 260,
    deliveriesThisMonth: 44,
    highRiskCases: 18,
    doctorCount: 11,
    neonatalICUAvailable: true,
    status: 'ACTIVE',
    lastReportedAt: '2026-08-23T05:30:00',
  },
  {
    id: 'hosp_05',
    name: 'Community Health Centre, Devanahalli',
    facilityType: 'Government PHC',
    city: 'Devanahalli',
    state: 'Karnataka',
    totalBeds: 30,
    availableBeds: 3,
    registeredMothers: 95,
    activePregnancies: 58,
    deliveriesThisMonth: 6,
    highRiskCases: 4,
    doctorCount: 2,
    neonatalICUAvailable: false,
    status: 'UNDER_MAINTENANCE',
    lastReportedAt: '2026-08-18T10:00:00',
  },
  {
    id: 'hosp_06',
    name: 'District Hospital, Tumakuru',
    facilityType: 'District Hospital',
    city: 'Tumakuru',
    state: 'Karnataka',
    totalBeds: 60,
    availableBeds: 0,
    registeredMothers: 210,
    activePregnancies: 130,
    deliveriesThisMonth: 19,
    highRiskCases: 9,
    doctorCount: 5,
    neonatalICUAvailable: true,
    status: 'ACTIVE',
    lastReportedAt: '2026-08-23T07:00:00',
  },
];

export const getFacilityName = (facilityId?: string): string =>
  facilities.find((f) => f.id === facilityId)?.name || 'Unknown Facility';

// ---------------------------------------------------------------------------
// Immunization coverage (district-wide, reusing the same vaccine catalogue
// already introduced by the Hospital cold-chain inventory in Module 6).
// ---------------------------------------------------------------------------

export const immunizationCoverage: ImmunizationCoverageStat[] = [
  { id: 'imm_01', vaccineName: 'BCG', vaccineCode: 'BCG', targetPopulation: 4200, covered: 4100 },
  { id: 'imm_02', vaccineName: 'Oral Polio Vaccine (OPV)', vaccineCode: 'OPV', targetPopulation: 4200, covered: 3850 },
  { id: 'imm_03', vaccineName: 'Hepatitis B', vaccineCode: 'HEPB', targetPopulation: 4200, covered: 4020 },
  { id: 'imm_04', vaccineName: 'Pentavalent', vaccineCode: 'PENTA', targetPopulation: 4100, covered: 3200 },
  { id: 'imm_05', vaccineName: 'Rotavirus', vaccineCode: 'ROTA', targetPopulation: 4100, covered: 3400 },
  { id: 'imm_06', vaccineName: 'Pneumococcal Conjugate (PCV)', vaccineCode: 'PCV', targetPopulation: 4100, covered: 3550 },
  { id: 'imm_07', vaccineName: 'Tetanus Toxoid (TT)', vaccineCode: 'TT', targetPopulation: 5000, covered: 4650 },
  { id: 'imm_08', vaccineName: 'Measles-Rubella (MR)', vaccineCode: 'MR', targetPopulation: 3900, covered: 2900 },
];

// ---------------------------------------------------------------------------
// Program-level alerts
// ---------------------------------------------------------------------------

export const adminAlerts: AdminAlert[] = [
  {
    id: 'aa_01',
    type: 'FACILITY_CAPACITY',
    severity: 'CRITICAL',
    title: 'District Hospital, Tumakuru at Full Bed Capacity',
    description: 'This facility is reporting 0 available beds out of 60.',
    facilityId: 'hosp_06',
    createdAt: '2026-08-23T07:15:00',
    status: 'ACTIVE',
  },
  {
    id: 'aa_02',
    type: 'FACILITY_REPORTING_OVERDUE',
    severity: 'WARNING',
    title: 'Facility Reporting Overdue',
    description: 'Community Health Centre, Devanahalli has not submitted an updated report in over 5 days.',
    facilityId: 'hosp_05',
    createdAt: '2026-08-23T08:00:00',
    status: 'ACTIVE',
  },
  {
    id: 'aa_03',
    type: 'IMMUNIZATION_COVERAGE',
    severity: 'WARNING',
    title: 'MR Vaccine Coverage Below Target',
    description: 'District-wide Measles-Rubella coverage is at 74%, below the 85% program target.',
    createdAt: '2026-08-22T09:00:00',
    status: 'ACTIVE',
  },
  {
    id: 'aa_04',
    type: 'HIGH_RISK_CASE',
    severity: 'CRITICAL',
    title: 'New High-Risk Case Flagged',
    description: 'Meenakshi Pillai flagged with placenta previa at Andheri Maternity & Children’s Hospital.',
    facilityId: 'hosp_02',
    createdAt: '2026-08-19T11:00:00',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'aa_05',
    type: 'REFERRAL_ESCALATION',
    severity: 'WARNING',
    title: 'Emergency Referral In Transit',
    description: 'An emergency neonatal referral from Sunrise Women & Children Hospital to Fortis La Femme is in transit.',
    facilityId: mockHospital.id,
    createdAt: '2026-08-22T13:15:00',
    status: 'ACTIVE',
  },
  {
    id: 'aa_06',
    type: 'FACILITY_CAPACITY',
    severity: 'INFO',
    title: 'Sunrise Hospital Bed Availability Update',
    description: 'Sunrise Women & Children Hospital reports 14 of 120 beds available.',
    facilityId: mockHospital.id,
    createdAt: '2026-08-23T07:00:00',
    status: 'RESOLVED',
  },
];

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const defaultAdminSettings: AdminSettings = {
  adminId: ADMIN_ID,
  notifications: {
    facilityCapacityAlerts: true,
    immunizationCoverageAlerts: true,
    highRiskCaseAlerts: true,
    referralEscalationAlerts: true,
    weeklyDigest: true,
  },
  program: {
    defaultFacilityView: 'ALL',
    defaultAlertFilter: 'ACTIVE',
    highRiskReviewThresholdDays: 7,
  },
  privacy: {
    twoFactorEnabled: false,
    restrictDataExport: true,
  },
};
