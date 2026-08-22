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
