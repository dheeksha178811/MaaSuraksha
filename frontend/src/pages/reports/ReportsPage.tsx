import React, { useState, useMemo } from 'react';
import { Search, Download, Eye, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { mockReports, REPORT_CATEGORIES, getReportSummary, filterReportsByCategory, searchReports } from '@/data/reportsMockData';
import { Report } from '@/types';
import { ReportDetailsModal } from './ReportDetailsModal';

export const ReportsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const summary = useMemo(() => getReportSummary(mockReports), []);

  const filteredReports = useMemo(() => {
    let results = mockReports;
    results = filterReportsByCategory(results, selectedCategory);
    results = searchReports(results, searchQuery);
    return results;
  }, [searchQuery, selectedCategory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'orange';
      case 'UPCOMING':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'PENDING':
        return 'Pending';
      case 'UPCOMING':
        return 'Upcoming';
      default:
        return status;
    }
  };

  const handleDownload = (report: Report) => {
    // Frontend mock interaction - log to console and show feedback
    console.log('Mock download initiated for:', report.name);
    // In a real app, this would trigger a file download from the backend
    alert(`Downloading: ${report.name}\n\nIn production, this would download the actual file.`);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reports & Documents"
        subtitle="View and download your medical reports from the maternal care journey including ultrasounds, lab tests, prescriptions, and other clinical documents."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-sandal-50 to-sandal-100 border-sandal-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-warm-muted mb-1">Total Reports</p>
              <p className="text-3xl font-bold text-sandal-900">{summary.totalReports}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-sandal-200 text-sandal-600 flex items-center justify-center">
              📄
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-warm-muted mb-1">Completed Reports</p>
              <p className="text-3xl font-bold text-green-900">{summary.recentReports}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-200 text-green-600 flex items-center justify-center">
              ✓
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-warm-muted mb-1">Pending/Upcoming</p>
              <p className="text-3xl font-bold text-blue-900">{summary.pendingReports}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-200 text-blue-600 flex items-center justify-center">
              ⏳
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="bg-warm-cream border-sandal-200">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-warm-brown flex items-center gap-2">
            <Filter className="w-4 h-4 text-sandal-600" />
            Search & Filter
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-warm-muted" />
              <Input
                type="text"
                placeholder="Search reports by name, doctor, hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Categories' },
                { value: 'ULTRASOUND', label: 'Ultrasound / Scan' },
                { value: 'BLOOD_TEST', label: 'Blood & Lab Tests' },
                { value: 'PRESCRIPTION', label: 'Prescriptions' },
                { value: 'OTHER', label: 'Other Medical Documents' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Reports List or Empty State */}
      {filteredReports.length === 0 ? (
        <Card className="bg-warm-ivory border-sandal-100">
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-warm-brown mb-2">No Reports Found</h3>
            <p className="text-warm-muted mb-4">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'No medical reports are available yet.'}
            </p>
            {(searchQuery || selectedCategory !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-warm-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Report Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-sandal-100 flex items-center justify-center shrink-0 text-lg">
                      {report.category === 'ULTRASOUND' && '🖼️'}
                      {report.category === 'BLOOD_TEST' && '🩸'}
                      {report.category === 'PRESCRIPTION' && '💊'}
                      {report.category === 'OTHER' && '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-warm-brown truncate">{report.name}</h4>
                      <p className="text-sm text-warm-muted truncate">
                        {report.doctor} • {report.hospital}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="sandal" size="sm">
                      {REPORT_CATEGORIES[report.category]}
                    </Badge>
                    <Badge variant={getStatusColor(report.status) as any} size="sm">
                      {getStatusLabel(report.status)}
                    </Badge>
                    <span className="text-xs text-warm-muted">
                      {new Date(report.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-start md:justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewReport(report)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  {report.status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(report)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};
