export type AppointmentType = 'antenatal_checkup' | 'postnatal_checkup' | 'pediatric_vaccination' | 'routine_scan';
export type AppointmentStatus = 'upcoming' | 'completed' | 'rescheduled' | 'cancelled';

export interface Appointment {
  id: string;
  title: string;
  type: AppointmentType;
  date: string;
  time: string;
  doctorName: string;
  hospitalName: string;
  location: string;
  status: AppointmentStatus;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Module 4: Mother Appointments
// Full appointment record for the Mother-side Appointments module. Carries
// explicit motherId / doctorId / hospitalId / appointmentId linkage so this
// mock shape can be swapped for backend/MongoDB data later without any UI
// changes.
// ---------------------------------------------------------------------------

export type AppointmentCategory =
  | 'ANTENATAL_CHECKUP'
  | 'ULTRASOUND_SCAN'
  | 'LAB_TEST'
  | 'POSTNATAL_CHECKUP'
  | 'PEDIATRIC_CHECKUP'
  | 'VACCINATION';

export type MotherAppointmentStatus = 'upcoming' | 'completed' | 'cancelled' | 'rescheduled' | 'requested';

export interface MotherAppointment {
  appointmentId: string;
  motherId: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  category: AppointmentCategory;
  title: string;
  date: string;
  time: string;
  location: string;
  reason: string;
  status: MotherAppointmentStatus;
  notes?: string;
  childId?: string;
  childName?: string;
}
