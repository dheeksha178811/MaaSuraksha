import { mockDoctor, mockHospital } from '@/data/mockData';
import { CareTeamMember, HospitalProfileExtras, HospitalService } from '@/types';

/**
 * Realistic supplementary hospital detail for Sunrise Women & Children
 * Hospital, reusing the same hospitalId/doctorId as the core
 * `mockHospital`/`mockDoctor` records so this can later be joined directly
 * against real hospital and staff collections.
 */
export const hospitalProfileExtras: HospitalProfileExtras = {
  hospitalId: mockHospital.id,
  tagline: 'Comprehensive maternal and child healthcare, close to home.',
  establishedYear: 2004,
  accreditations: ['NABH Accredited', 'Baby-Friendly Hospital Initiative (BFHI) Certified'],
  visitingHours: '10:00 AM - 12:00 PM & 5:00 PM - 7:00 PM (Daily)',
  emergencyContactNumber: '+91 80 2525 9111',
  ambulanceAvailable: true,
};

export const hospitalServices: HospitalService[] = [
  {
    serviceId: 'svc_01',
    hospitalId: mockHospital.id,
    name: 'Antenatal Care & High-Risk Pregnancy Clinic',
    category: 'ANTENATAL',
    description: 'Regular antenatal check-ups, screening tests, and specialized monitoring for high-risk pregnancies.',
    availability: 'Mon-Sat, 9:00 AM - 6:00 PM',
  },
  {
    serviceId: 'svc_02',
    hospitalId: mockHospital.id,
    name: 'Labor & Delivery Suite',
    category: 'DELIVERY',
    description: 'Modern labor rooms with continuous fetal monitoring, supporting both normal and assisted deliveries.',
    availability: '24/7',
  },
  {
    serviceId: 'svc_03',
    hospitalId: mockHospital.id,
    name: 'Emergency Obstetric Care',
    category: 'EMERGENCY',
    description: 'Round-the-clock emergency care for pregnancy complications and urgent maternal needs.',
    availability: '24/7',
  },
  {
    serviceId: 'svc_04',
    hospitalId: mockHospital.id,
    name: 'Neonatal Intensive Care Unit (NICU)',
    category: 'PEDIATRIC',
    description: 'Specialized care for newborns needing extra medical attention after birth.',
    availability: '24/7',
  },
  {
    serviceId: 'svc_05',
    hospitalId: mockHospital.id,
    name: 'Postnatal & Recovery Ward',
    category: 'POSTNATAL',
    description: 'Comfortable recovery rooms with rooming-in support for mother and baby after delivery.',
    availability: '24/7',
  },
  {
    serviceId: 'svc_06',
    hospitalId: mockHospital.id,
    name: 'Lactation & Breastfeeding Support',
    category: 'POSTNATAL',
    description: 'One-on-one lactation counseling to support a healthy breastfeeding journey.',
    availability: 'Mon-Sat, 10:00 AM - 4:00 PM',
  },
  {
    serviceId: 'svc_07',
    hospitalId: mockHospital.id,
    name: 'Immunization Clinic',
    category: 'PEDIATRIC',
    description: 'On-site newborn and infant immunizations following the National Immunization Schedule.',
    availability: 'Mon-Sat, 9:00 AM - 1:00 PM',
  },
  {
    serviceId: 'svc_08',
    hospitalId: mockHospital.id,
    name: 'Diagnostics & Ultrasound',
    category: 'DIAGNOSTIC',
    description: 'In-house lab and ultrasound services for antenatal screening and routine tests.',
    availability: 'Mon-Sat, 8:00 AM - 8:00 PM',
  },
];

export const hospitalCareTeam: CareTeamMember[] = [
  {
    memberId: 'team_01',
    hospitalId: mockHospital.id,
    doctorId: mockDoctor.id,
    name: mockDoctor.name,
    role: mockDoctor.specialization,
    department: 'Obstetrics & Gynecology',
    isPrimaryDoctor: true,
    contactNote: `Available ${mockDoctor.availableDays.join(', ')}`,
  },
  {
    memberId: 'team_02',
    hospitalId: mockHospital.id,
    name: 'Kavitha Ramesh',
    role: 'Staff Nurse — Maternity Ward',
    department: 'Nursing',
    isPrimaryDoctor: false,
  },
  {
    memberId: 'team_03',
    hospitalId: mockHospital.id,
    name: 'Anjali Suresh',
    role: 'Lactation Consultant',
    department: 'Postnatal Care',
    isPrimaryDoctor: false,
    contactNote: 'Available for consultations Mon-Sat',
  },
  {
    memberId: 'team_04',
    hospitalId: mockHospital.id,
    name: 'Dr. Ravi Kumar',
    role: 'Consultant Pediatrician — On Call',
    department: 'Pediatrics',
    isPrimaryDoctor: false,
  },
];

export const getHospitalExtras = (hospitalId: string): HospitalProfileExtras | undefined =>
  hospitalProfileExtras.hospitalId === hospitalId ? hospitalProfileExtras : undefined;

export const getHospitalServices = (hospitalId: string): HospitalService[] =>
  hospitalServices.filter((s) => s.hospitalId === hospitalId);

export const getHospitalCareTeam = (hospitalId: string): CareTeamMember[] =>
  hospitalCareTeam.filter((m) => m.hospitalId === hospitalId);
