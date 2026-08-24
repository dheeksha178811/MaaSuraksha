import React, { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { mockHospital } from '@/data/mockData';
import { HOSPITAL_TODAY_ISO } from '@/data/hospitalMockData';
import { getHospitalReportTypeLabel, getHospitalReports } from '@/services/hospitalService';
import { HospitalReport, HospitalReportType } from '@/types';

const REPORT_TYPES: HospitalReportType[] = [
  'DELIVERY',
  'MATERNAL_CARE',
  'NEONATAL',
  'BED_UTILIZATION',
  'VACCINE_INVENTORY',
  'REFERRAL',
];

const REPORT_TYPE_OPTIONS = REPORT_TYPES.map((value) => ({ value, label: getHospitalReportTypeLabel(value) }));

const defaultStartDate = () => {
  const d = new Date(HOSPITAL_TODAY_ISO);
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

export const HospitalReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<HospitalReportType>('DELIVERY');
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [endDate, setEndDate] = useState(HOSPITAL_TODAY_ISO);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<HospitalReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!startDate || !endDate || startDate > endDate) {
      setError('Choose a valid start and end date.');
      return;
    }
    setError(null);
    setIsGenerating(true);
    try {
      const result = await getHospitalReports({
        hospitalId: mockHospital.id,
        reportType,
        startDate,
        endDate,
      });
      setReport(result);
    } catch {
      setError('Unable to generate this report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Reports"
        subtitle="Generate facility-level maternal and child care reports."
        badge={<Badge variant="sandal">{mockHospital.facilityName}</Badge>}
      />

      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <FileText className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-lg font-bold text-warm-brown">Report Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Report Type"
            options={REPORT_TYPE_OPTIONS}
            value={reportType}
            onChange={(e) => setReportType(e.target.value as HospitalReportType)}
          />
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} error={error || undefined} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <div className="flex items-end">
            <Button fullWidth leftIcon={<Sparkles className="w-4 h-4" />} onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating…' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </Card>

      {!report ? (
        <EmptyState
          icon={FileText}
          title="No report generated yet"
          description="Choose a report type and date range, then generate a preview summary."
        />
      ) : (
        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-sandal-100 flex-wrap">
            <div>
              <h3 className="font-display text-xl font-bold text-warm-brown">{getHospitalReportTypeLabel(report.reportType)}</h3>
              <p className="text-xs text-warm-muted mt-0.5">{report.startDate} to {report.endDate} • Generated {report.generatedAt.replace('T', ' ')}</p>
            </div>
            <Badge variant="outline">{report.reportId}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {report.summary.map((metric) => (
              <div key={metric.label} className="p-3.5 rounded-xl bg-warm-ivory border border-sandal-100 text-center">
                <p className="text-xl font-bold text-warm-brown">{metric.value}</p>
                <p className="text-xs text-warm-muted mt-1">{metric.label}</p>
              </div>
            ))}
          </div>

          {report.data.length > 0 && (
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-sandal-100">
                    {Object.keys(report.data[0]).map((col) => (
                      <th key={col} className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wider text-warm-muted">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.data.map((row, idx) => (
                    <tr key={idx} className="border-b border-sandal-100/60 last:border-0">
                      {Object.values(row).map((value, colIdx) => (
                        <td key={colIdx} className="py-2 px-2 text-warm-brown">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-warm-muted pt-2 border-t border-sandal-100/70">
            This is a frontend preview. A future backend will generate and attach a downloadable file to this report.
          </p>
        </Card>
      )}
    </div>
  );
};
