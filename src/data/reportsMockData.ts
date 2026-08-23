import { Report, ReportSummary, ReportCategoryLabel } from '@/types';

export const REPORT_CATEGORIES: ReportCategoryLabel = {
  ULTRASOUND: 'Ultrasound / Scan',
  BLOOD_TEST: 'Blood & Lab Tests',
  PRESCRIPTION: 'Prescriptions',
  OTHER: 'Other Medical Documents',
};

export const mockReports: Report[] = [
  {
    id: 'R001',
    name: 'Second Trimester Ultrasound Scan',
    category: 'ULTRASOUND',
    date: '2026-02-14',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'COMPLETED',
    description: 'Detailed 20-week anatomy scan showing normal fetal development.',
    fileSize: '8.5 MB',
    fileType: 'PDF',
  },
  {
    id: 'R002',
    name: 'Complete Blood Count (CBC)',
    category: 'BLOOD_TEST',
    date: '2026-01-28',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'COMPLETED',
    description: 'Antenatal blood work - all values within normal range.',
    fileSize: '1.2 MB',
    fileType: 'PDF',
  },
  {
    id: 'R003',
    name: 'Glucose Tolerance Test (GTT)',
    category: 'BLOOD_TEST',
    date: '2026-03-10',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'COMPLETED',
    description: 'Gestational diabetes screening - normal result.',
    fileSize: '2.1 MB',
    fileType: 'PDF',
  },
  {
    id: 'R004',
    name: 'Prenatal Vitamins Prescription',
    category: 'PRESCRIPTION',
    date: '2026-01-24',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'COMPLETED',
    description: 'Iron supplements, folic acid, and prenatal multivitamins.',
    fileSize: '0.8 MB',
    fileType: 'PDF',
  },
  {
    id: 'R005',
    name: 'Third Trimester Ultrasound',
    category: 'ULTRASOUND',
    date: '2026-06-05',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'COMPLETED',
    description: 'Growth monitoring and fetal position assessment at 32 weeks.',
    fileSize: '9.2 MB',
    fileType: 'PDF',
  },
  {
    id: 'R006',
    name: 'Hospital Discharge Summary (Delivery)',
    category: 'OTHER',
    date: '2026-07-18',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'COMPLETED',
    description: 'Postpartum discharge summary following normal delivery of baby boy.',
    fileSize: '1.5 MB',
    fileType: 'PDF',
  },
  {
    id: 'R007',
    name: 'Postpartum Checkup Results',
    category: 'BLOOD_TEST',
    date: '2026-08-01',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'COMPLETED',
    description: 'Two-week postpartum checkup - mother recovering well.',
    fileSize: '1.8 MB',
    fileType: 'PDF',
  },
  {
    id: 'R008',
    name: 'Postpartum Medication Prescription',
    category: 'PRESCRIPTION',
    date: '2026-07-20',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'COMPLETED',
    description: 'Pain management and recovery medications.',
    fileSize: '0.6 MB',
    fileType: 'PDF',
  },
  {
    id: 'R009',
    name: 'Six-Week Postpartum Review',
    category: 'OTHER',
    date: '2026-08-29',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'UPCOMING',
    description: 'Scheduled comprehensive postpartum health review.',
    fileSize: undefined,
    fileType: undefined,
  },
  {
    id: 'R010',
    name: 'Breast Health Assessment',
    category: 'OTHER',
    date: '2026-08-25',
    doctor: 'Dr. Priya Menon',
    hospital: 'Sunrise Women & Children Hospital',
    status: 'PENDING',
    description: 'Lactation support and breast health screening.',
    fileSize: undefined,
    fileType: undefined,
  },
];

export const getReportSummary = (reports: Report[]): ReportSummary => {
  return {
    totalReports: reports.length,
    recentReports: reports.filter((r) => r.status === 'COMPLETED').length,
    pendingReports: reports.filter((r) => r.status === 'PENDING' || r.status === 'UPCOMING').length,
  };
};

export const filterReportsByCategory = (reports: Report[], category: string): Report[] => {
  if (category === 'ALL') return reports;
  return reports.filter((r) => r.category === category);
};

export const searchReports = (reports: Report[], query: string): Report[] => {
  const lowerQuery = query.toLowerCase();
  return reports.filter(
    (r) =>
      r.name.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.doctor.toLowerCase().includes(lowerQuery) ||
      r.hospital.toLowerCase().includes(lowerQuery)
  );
};
