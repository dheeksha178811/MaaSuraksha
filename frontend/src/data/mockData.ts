import {
  MotherProfile,
  ChildProfile,
  DoctorProfile,
  HospitalProfile,
  Appointment,
  VaccinationRecord,
  NotificationItem,
  UserRole
} from '@/types';

export const mockMother: MotherProfile = {
  id: 'usr_mother_01',
  name: 'Ananya Kapoor',
  email: 'ananya.kapoor@example.com',
  phone: '+91 98765 43210',
  role: 'mother',
  age: 32,
  stage: 'postpartum',
  deliveryDate: '2026-07-18',
  bloodGroup: 'O+',
  location: 'Indiranagar, Bengaluru',
  assignedHospitalId: 'hosp_01',
  assignedHospitalName: 'Sunrise Women & Children Hospital',
  assignedDoctorId: 'doc_01',
  assignedDoctorName: 'Dr. Priya Menon',
  emergencyContact: {
    name: 'Rohit Kapoor',
    relation: 'Spouse',
    phone: '+91 98765 43211',
  },
  createdAt: '2026-01-10',
};

export const mockChild: ChildProfile = {
  id: 'child_01',
  motherId: 'usr_mother_01',
  name: 'Vihaan Kapoor',
  gender: 'boy',
  dateOfBirth: '2026-07-18',
  ageDisplay: '5 weeks',
  birthWeightKg: 3.2,
  currentWeightKg: 4.1,
  bloodGroup: 'O+',
  birthHospital: 'Sunrise Women & Children Hospital',
};

export const mockDoctor: DoctorProfile = {
  id: 'doc_01',
  name: 'Dr. Priya Menon',
  email: 'priya.menon@sunrisewch.org',
  role: 'doctor',
  specialization: 'Consultant Gynecologist & Obstetrician',
  qualification: 'MBBS, MS (OBG), DNB',
  hospitalId: 'hosp_01',
  hospitalName: 'Sunrise Women & Children Hospital',
  experienceYears: 14,
  availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  location: 'Indiranagar, Bengaluru',
  createdAt: '2025-06-01',
};

export const mockHospital: HospitalProfile = {
  id: 'hosp_01',
  name: 'Sunrise Women & Children Hospital',
  email: 'care@sunrisewch.org',
  role: 'hospital',
  facilityName: 'Sunrise Women & Children Hospital',
  facilityType: 'Private Maternity Center',
  licenseNumber: 'KA-MED-2024-8842',
  address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560038',
  contactNumber: '+91 80 2525 9000',
  totalBeds: 120,
  availableBeds: 14,
  neonatalICUAvailable: true,
  status: 'ACTIVE',
  createdAt: '2024-01-15',
};

export const mockAppointments: Appointment[] = [
  {
    id: 'apt_01',
    title: '6-Week Postpartum & Pediatric Checkup',
    type: 'postnatal_checkup',
    date: '2026-08-29',
    time: '10:30 AM',
    doctorName: 'Dr. Priya Menon',
    hospitalName: 'Sunrise Women & Children Hospital',
    location: 'OPD Block A, Room 204',
    status: 'upcoming',
    notes: 'Routine checkup for maternal recovery and baby Vihaan 6-week growth screening.',
  },
  {
    id: 'apt_02',
    title: 'Newborn 2-Week Neonatal Check',
    type: 'pediatric_vaccination',
    date: '2026-08-01',
    time: '11:00 AM',
    doctorName: 'Dr. Priya Menon',
    hospitalName: 'Sunrise Women & Children Hospital',
    location: 'Pediatric Wing',
    status: 'completed',
  },
];

export const mockVaccinations: VaccinationRecord[] = [
  {
    id: 'vac_01',
    childId: 'child_01',
    vaccineName: 'BCG, OPV-0, Hepatitis B-1',
    targetAgeDescription: 'At Birth',
    recommendedDate: '2026-07-18',
    givenDate: '2026-07-19',
    status: 'completed',
    administeredBy: 'Sunrise Hospital Care Team',
  },
  {
    id: 'vac_02',
    childId: 'child_01',
    vaccineName: 'Pentavalent-1, OPV-1, Rotavirus-1, PCV-1',
    targetAgeDescription: '6 Weeks',
    recommendedDate: '2026-08-29',
    status: 'due_soon',
    notes: 'Scheduled for upcoming Saturday visit at Sunrise Hospital.',
  },
  {
    id: 'vac_03',
    childId: 'child_01',
    vaccineName: 'Pentavalent-2, OPV-2, Rotavirus-2',
    targetAgeDescription: '10 Weeks',
    recommendedDate: '2026-09-26',
    status: 'upcoming',
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_01',
    motherId: 'usr_mother_01',
    title: 'Upcoming 6-Week Immunization Due',
    message: 'Vihaan is due for Pentavalent-1 and OPV-1 on August 29.',
    type: 'vaccination_reminder',
    timestamp: '2 hours ago',
    isRead: false,
    actionUrl: '/mother/vaccinations',
  },
  {
    id: 'notif_02',
    motherId: 'usr_mother_01',
    title: 'Postnatal Wellness Tip',
    message: 'Stay hydrated with warm fluids and light postpartum stretches.',
    type: 'health_tip',
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: 'notif_03',
    motherId: 'usr_mother_01',
    title: 'Evening Medication Reminder',
    message: 'It’s time for your Iron & Folic Acid + Calcium tablet.',
    type: 'medication_reminder',
    timestamp: '3 hours ago',
    isRead: false,
    actionUrl: '/mother/medications',
  },
  {
    id: 'notif_04',
    motherId: 'usr_mother_01',
    title: 'Appointment Tomorrow',
    message: '6-Week Postpartum & Pediatric Checkup with Dr. Priya Menon at 10:30 AM.',
    type: 'appointment_reminder',
    timestamp: '5 hours ago',
    isRead: false,
    actionUrl: '/mother/appointments',
  },
  {
    id: 'notif_05',
    motherId: 'usr_mother_01',
    title: 'Care Plan Updated',
    message: 'Dr. Priya Menon added new notes to your care timeline after your last review.',
    type: 'care_plan_update',
    timestamp: 'Yesterday',
    isRead: true,
    actionUrl: '/mother/timeline',
  },
  {
    id: 'notif_06',
    motherId: 'usr_mother_01',
    title: 'PMMVY Installment Processed',
    message: 'Your installment under Pradhan Mantri Matru Vandana Yojana has been credited.',
    type: 'scheme_update',
    timestamp: '2 days ago',
    isRead: true,
    actionUrl: '/mother/schemes',
  },
  {
    id: 'notif_07',
    motherId: 'usr_mother_01',
    title: 'Vaccination Due Soon',
    message: 'Vihaan’s 10-week vaccines (Pentavalent-2, OPV-2, Rotavirus-2) are due on September 26.',
    type: 'vaccination_reminder',
    timestamp: '2 days ago',
    isRead: false,
    actionUrl: '/mother/vaccinations',
  },
  {
    id: 'notif_08',
    motherId: 'usr_mother_01',
    title: 'Lactation Support Tip',
    message: 'Feeling engorged? Warm compresses before feeds and cool compresses after can help with comfort.',
    type: 'health_tip',
    timestamp: '3 days ago',
    isRead: true,
  },
  {
    id: 'notif_09',
    motherId: 'usr_mother_01',
    title: "Vihaan's Vitamin D3 Drops",
    message: 'Don’t forget baby’s daily Vitamin D3 drops with his morning feed.',
    type: 'medication_reminder',
    timestamp: '4 days ago',
    isRead: false,
    actionUrl: '/mother/medications',
  },
];

export interface RoleConfig {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  defaultPath: string;
  iconName: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  mother: {
    role: 'mother',
    title: 'Mother / Beneficiary',
    subtitle: 'Nurture & Care Companion',
    description: 'Track maternal health milestones, baby vaccinations, doctor appointments, and personalized care guidance.',
    defaultPath: '/mother/dashboard',
    iconName: 'HeartHandshake',
  },
  doctor: {
    role: 'doctor',
    title: 'Doctor / Gynecologist',
    subtitle: 'Clinical Care Portal',
    description: 'Monitor high-risk pregnancies, review clinical milestones, manage beneficiary consultations and schedules.',
    defaultPath: '/doctor/dashboard',
    iconName: 'Stethoscope',
  },
  hospital: {
    role: 'hospital',
    title: 'Hospital / Facility',
    subtitle: 'Institutional Center',
    description: 'Coordinate institutional deliveries, bed allotments, vaccine inventory distribution, and outreach records.',
    defaultPath: '/hospital/dashboard',
    iconName: 'Building2',
  },
  admin: {
    role: 'admin',
    title: 'Program Administrator',
    subtitle: 'Health Oversight',
    description: 'District and state level maternal-child scheme tracking, immunization coverage analytics, and resource management.',
    defaultPath: '/admin/dashboard',
    iconName: 'ShieldCheck',
  },
};
