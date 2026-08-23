import React, { useMemo, useState } from 'react';
import { Search, FileText, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockDoctor } from '@/data/mockData';
import { getPatientsForDoctor, getReportsForDoctorPatients } from '@/data/doctorPatientsMockData';
import { REPORT_CATEGORIES } from '@/data/reportsMockData';
import { ReportDetailsModal } from '@/pages/reports/ReportDetailsModal';
import { getReportStatusBadgeVariant } from '@/pages/doctor/doctorUi';
import { Report, ReportCategory } from '@/types';

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'ULTRASOUND', label: 'Ultrasound / Scan' },
  { value: 'BLOOD_TEST', label: 'Blood & Lab Tests' },
  { value: 'PRESCRIPTION', label: 'Prescriptions' },
  { value: 'OTHER', label: 'Other Medical Documents' },
];

export const DoctorReportsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ReportCategory>('ALL');
  const [patientFilter, setPatientFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const patients = useMemo(() => getPatientsForDoctor(mockDoctor.id), []);
  const allReports = useMemo(() => getReportsForDoctorPatients(mockDoctor.id), []);

  const patientOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All Patients' },
      ...patients.map((p) => ({ value: p.patientId, label: p.name })),
    ],
    [patients]
  );

  const patientNameById = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((p) => map.set(p.patientId, p.name));
    return map;
  }, [patients]);

  const filteredReports = useMemo(() => {
    let results = allReports;
    if (patientFilter !== 'ALL') {
      results = results.filter((r) => r.patientId === patientFilter);
    }
    if (categoryFilter !== 'ALL') {
      results = results.filter((r) => r.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.patientId && patientNameById.get(r.patientId)?.toLowerCase().includes(q))
      );
    }
    return results.slice().sort((a, b) => b.date.localeCompare(a.date));
  }, [allReports, patientFilter, categoryFilter, searchQuery, patientNameById]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Medical reports across your assigned patients."
        badge={<Badge variant="sandal">{allReports.length} Reports</Badge>}
      />

      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Search & Filter
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-warm-muted" />
              <Input
                type="text"
                placeholder="Search reports or patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)} options={patientOptions} />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | ReportCategory)}
              options={CATEGORY_OPTIONS}
            />
          </div>
        </div>
      </Card>

      {filteredReports.length === 0 ? (
        <Card className="bg-warm-ivory border-sandal-100">
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-sandal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-warm-brown mb-2">No Reports Found</h3>
            <p className="text-warm-muted">Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <Card key={report.id} variant="interactive" className="hover:shadow-warm-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sandal-100 flex items-center justify-center shrink-0 text-lg">
                      {report.category === 'ULTRASOUND' && '🖼️'}
                      {report.category === 'BLOOD_TEST' && '🩸'}
                      {report.category === 'PRESCRIPTION' && '💊'}
                      {report.category === 'OTHER' && '📋'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-warm-brown truncate">{report.name}</h4>
                      <p className="text-sm text-warm-muted truncate">
                        {report.patientId ? patientNameById.get(report.patientId) : 'Unknown patient'} • {REPORT_CATEGORIES[report.category]}
                      </p>
                      <div className="flex flex-wrap gap-2 items-center mt-2">
                        <Badge variant={getReportStatusBadgeVariant(report.status)} size="sm">{report.status}</Badge>
                        <span className="text-xs text-warm-muted">{report.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDownload={(report) => alert(`Downloading: ${report.name}\n\nIn production, this would download the actual file.`)}
        />
      )}
    </div>
  );
};
