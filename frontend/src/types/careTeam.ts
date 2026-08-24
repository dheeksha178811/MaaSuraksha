export type PatientStage = 'ANTENATAL' | 'POSTNATAL';
export type PatientRiskLevel = 'LOW' | 'MODERATE' | 'HIGH';
export type PatientStatus = 'STABLE' | 'FOLLOW_UP_DUE' | 'REPORT_PENDING' | 'NEW';

export interface AntenatalDetails {
  pregnancyWeek: number;
  expectedDeliveryDate: string;
  gravida: string;
  ancVisitsCompleted: number;
  ancVisitsPlanned: number;
  highRiskFactors: string[];
}

export interface PostnatalDetails {
  deliveryDate: string;
  deliveryType: 'Normal' | 'C-Section' | 'Assisted';
  postpartumWeeks: number;
  recoveryStatus: string;
  breastfeedingStatus: string;
}

export interface AssignedPatient {
  patientId: string;
  motherId: string;
  doctorId: string;
  hospitalId: string;
  childId?: string;
  name: string;
  age: number;
  phone: string;
  bloodGroup: string;
  location: string;
  stage: PatientStage;
  status: PatientStatus;
  riskLevel: PatientRiskLevel;
  antenatal?: AntenatalDetails;
  postnatal?: PostnatalDetails;
  lastVisitDate?: string;
  registeredOn: string;
}

export type DoctorAppointmentType =
  | 'Antenatal Checkup'
  | 'Postnatal Checkup'
  | 'Follow-up'
  | 'Ultrasound'
  | 'Lab Review'
  | 'Vaccination'
  | 'Registration Visit';

export type DoctorAppointmentStatus = 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';

export interface DoctorAppointment {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  hospitalId: string;
  type: DoctorAppointmentType;
  date: string;
  time: string;
  status: DoctorAppointmentStatus;
  location: string;
  notes?: string;
}

export type RecommendationType = 'NUTRITION' | 'MEDICATION' | 'LIFESTYLE' | 'FOLLOW_UP' | 'GENERAL';

export interface CareRecommendation {
  recommendationId: string;
  patientId: string;
  doctorId: string;
  type: RecommendationType;
  title: string;
  description: string;
  date: string;
  active: boolean;
}

export interface ConsultationNote {
  noteId: string;
  patientId: string;
  doctorId: string;
  date: string;
  title: string;
  note: string;
}

export interface PatientMedication {
  medicationId: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed';
  notes?: string;
}

export interface DoctorAlert {
  id: string;
  patientId: string;
  patientName: string;
  severity: 'high' | 'moderate' | 'info';
  message: string;
}

export interface DoctorDashboardSummary {
  totalPatients: number;
  todaysAppointmentsCount: number;
  followUpsDueCount: number;
  reportsAwaitingReviewCount: number;
}
