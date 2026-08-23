import React from 'react';
import { X, Download, Calendar, User, Building2, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Report } from '@/types';
import { REPORT_CATEGORIES } from '@/data/reportsMockData';

interface ReportDetailsModalProps {
  report: Report;
  onClose: () => void;
  onDownload: (report: Report) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  report,
  onClose,
  onDownload,
}) => {
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

  const formattedDate = new Date(report.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-warm-brown mb-2">{report.name}</h2>
            <p className="text-warm-muted">{report.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-warm-ivory rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-warm-muted" />
          </button>
        </div>

        {/* Status and Category */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="sandal" size="sm">
            {REPORT_CATEGORIES[report.category]}
          </Badge>
          <Badge variant={getStatusColor(report.status) as any} size="sm">
            {getStatusLabel(report.status)}
          </Badge>
        </div>

        {/* Report Metadata */}
        <Card className="bg-warm-ivory border-sandal-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warm-muted">Report Date</p>
                <p className="text-base font-semibold text-warm-brown">{formattedDate}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <User className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warm-muted">Physician</p>
                <p className="text-base font-semibold text-warm-brown">{report.doctor}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Building2 className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warm-muted">Medical Facility</p>
                <p className="text-base font-semibold text-warm-brown">{report.hospital}</p>
              </div>
            </div>

            {report.fileSize && (
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warm-muted">File Details</p>
                  <p className="text-base font-semibold text-warm-brown">
                    {report.fileSize} ({report.fileType})
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Document Preview Placeholder */}
        <Card className="bg-gray-50 border-gray-200 flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-center text-warm-muted mb-4">
            Document Preview
            <br />
            <span className="text-sm">(Placeholder for actual document display)</span>
          </p>
          <p className="text-center text-xs text-warm-muted max-w-xs">
            In production, the actual PDF or medical image would be displayed here. This is a frontend-only interface demonstrating the report management UI.
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {report.status === 'COMPLETED' && (
            <Button onClick={() => onDownload(report)} className="gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
