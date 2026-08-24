import { mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { getUpcomingAppointmentsForMother } from '@/data/motherAppointmentsMockData';
import { getHospitalCareTeam } from '@/data/motherHospitalMockData';
import {
  CareTeamMember,
  ConsultationLogEntry,
  DoctorContactOption,
  DoctorProfileExtras,
  MotherAppointment,
} from '@/types';

/**
 * Realistic supplementary profile detail for Dr. Priya Menon, reusing the
 * same doctorId as the core `mockDoctor` record so this can later be joined
 * directly against a real doctor/staff collection.
 */
export const doctorProfileExtras: DoctorProfileExtras = {
  doctorId: mockDoctor.id,
  bio: 'Dr. Priya Menon is a consultant gynecologist and obstetrician with 14 years of experience across antenatal, delivery, and postnatal care. She specializes in high-risk pregnancy management and postpartum lactation support.',
  languagesSpoken: ['English', 'Hindi', 'Kannada', 'Malayalam'],
  consultationModes: ['In-Person Consultation', 'Video Consultation', 'Phone Follow-up'],
  clinicTimings: [
    { day: 'Monday', hours: '9:00 AM - 1:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM - 1:00 PM' },
    { day: 'Friday', hours: '9:00 AM - 1:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 2:00 PM' },
  ],
  achievements: [
    '14+ years in Obstetrics & Gynecology',
    'Specialist in High-Risk Pregnancy Management',
    'Certified Lactation Support Provider',
    'Faculty, Sunrise Maternal Care Program',
  ],
};

export const doctorContactOptions: DoctorContactOption[] = [
  {
    contactId: 'doc_contact_01',
    doctorId: mockDoctor.id,
    type: 'CALL',
    label: 'Call Clinic Reception',
    value: mockHospital.contactNumber,
    description: "Speak with the OPD desk to reach Dr. Menon's care team directly.",
    available: true,
  },
  {
    contactId: 'doc_contact_02',
    doctorId: mockDoctor.id,
    type: 'MESSAGE',
    label: 'Send a Message',
    description: 'Send a non-urgent message to your care team — replies typically within 24 hours.',
    available: true,
  },
  {
    contactId: 'doc_contact_03',
    doctorId: mockDoctor.id,
    type: 'VIDEO_CONSULT',
    label: 'Request Video Consultation',
    description: `Available for eligible follow-ups on ${mockDoctor.availableDays.join(', ')}.`,
    available: true,
  },
  {
    contactId: 'doc_contact_04',
    doctorId: mockDoctor.id,
    type: 'EMERGENCY',
    label: 'Emergency Hotline',
    value: '+91 80 2525 9111',
    description: 'For urgent maternal or newborn concerns, call the 24/7 emergency line.',
    available: true,
  },
];

/**
 * Consultation history as logged from the mother's perspective, cross-linked
 * to past appointments in `motherAppointmentsMockData` via
 * `relatedAppointmentId`.
 */
export const consultationLogs: ConsultationLogEntry[] = [
  {
    logId: 'clog_01',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    date: '2026-08-01',
    title: 'Newborn 2-Week Neonatal Check — Notes',
    summary: "Baby Vihaan's weight gain and feeding are on track. Continue exclusive breastfeeding; next review at the 6-week visit.",
    relatedAppointmentId: 'mapt_05',
  },
  {
    logId: 'clog_02',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    date: '2026-07-14',
    title: '38-Week Antenatal Review — Notes',
    summary: 'Cervix favorable, fetal head engaged. Discussed birth plan and signs of labor to watch for.',
    relatedAppointmentId: 'mapt_07',
  },
  {
    logId: 'clog_03',
    motherId: mockMother.id,
    doctorId: mockDoctor.id,
    date: '2026-06-10',
    title: 'Glucose Tolerance Test — Notes',
    summary: 'GTT results within normal range. No gestational diabetes concerns; continue current diet plan.',
    relatedAppointmentId: 'mapt_09',
  },
];

export const getDoctorProfileExtras = (doctorId: string): DoctorProfileExtras | undefined =>
  doctorProfileExtras.doctorId === doctorId ? doctorProfileExtras : undefined;

export const getDoctorContactOptions = (doctorId: string): DoctorContactOption[] =>
  doctorContactOptions.filter((option) => option.doctorId === doctorId);

export const getConsultationLogsForMother = (motherId: string): ConsultationLogEntry[] =>
  consultationLogs
    .filter((log) => log.motherId === motherId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

export const getCareTeamForDoctorHospital = (hospitalId: string): CareTeamMember[] =>
  getHospitalCareTeam(hospitalId);

export const getNextAppointmentWithDoctor = (
  motherId: string,
  doctorId: string
): MotherAppointment | undefined =>
  getUpcomingAppointmentsForMother(motherId).find((a) => a.doctorId === doctorId);

export const isAssignedDoctor = (motherId: string, doctorId: string): boolean =>
  mockMother.id === motherId && mockMother.assignedDoctorId === doctorId;
