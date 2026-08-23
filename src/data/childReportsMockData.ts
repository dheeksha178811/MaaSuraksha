import { mockDoctor, mockHospital } from '@/data/mockData';
import { Report } from '@/types';

/**
 * Small, additive set of reports specific to Vihaan's newborn/pediatric care.
 * Kept separate from the Module 1B `mockReports` (which are all maternal
 * antenatal/postnatal records) so the existing Reports & Documents module is
 * left untouched. Reuses the same `Report` type/shape so it can plug into
 * the same UI (ReportDetailsModal, category labels, status badges) without
 * any redesign.
 */
export const childReports: Report[] = [
  {
    id: 'CR001',
    name: 'Newborn Metabolic Screening (NBS)',
    category: 'BLOOD_TEST',
    date: '2026-07-20',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'COMPLETED',
    description: 'Routine heel-prick screening for congenital metabolic conditions — all results within normal range.',
    fileSize: '0.4 MB',
    fileType: 'PDF',
  },
  {
    id: 'CR002',
    name: 'Newborn Hearing Screening',
    category: 'OTHER',
    date: '2026-07-19',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'COMPLETED',
    description: 'Otoacoustic emissions (OAE) test — both ears passed.',
    fileSize: '0.3 MB',
    fileType: 'PDF',
  },
  {
    id: 'CR003',
    name: '6-Week Growth & Development Summary',
    category: 'OTHER',
    date: '2026-08-29',
    doctor: mockDoctor.name,
    hospital: mockHospital.name,
    status: 'UPCOMING',
    description: 'Scheduled pediatric growth and development summary at the 6-week checkup.',
  },
];

export const getReportsForChild = (): Report[] => childReports;
