export type ReportCategory = 'ULTRASOUND' | 'BLOOD_TEST' | 'PRESCRIPTION' | 'OTHER';
export type ReportStatus = 'COMPLETED' | 'PENDING' | 'UPCOMING';

export interface Report {
  id: string;
  name: string;
  category: ReportCategory;
  date: string; // ISO date string
  doctor: string;
  hospital: string;
  status: ReportStatus;
  description?: string;
  fileSize?: string;
  fileType?: string; // e.g., 'PDF', 'IMAGE'
  patientId?: string; // links a report to an AssignedPatient for doctor-side views
}

export interface ReportSummary {
  totalReports: number;
  recentReports: number;
  pendingReports: number;
}

export type ReportCategoryLabel = {
  [key in ReportCategory]: string;
};
