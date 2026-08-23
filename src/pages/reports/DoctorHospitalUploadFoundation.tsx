import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

/**
 * DoctorHospitalUploadFoundation
 *
 * This is a frontend-only foundation UI for doctor and hospital staff to upload reports.
 * No actual file storage or backend processing is implemented.
 * This serves as a placeholder/demo interface for future backend integration.
 */

interface UploadFormState {
  patientName: string;
  reportType: string;
  reportDate: string;
  reportTitle: string;
  notes: string;
  selectedFile: File | null;
}

export const DoctorHospitalUploadFoundation: React.FC = () => {
  const [formState, setFormState] = useState<UploadFormState>({
    patientName: '',
    reportType: '',
    reportDate: '',
    reportTitle: '',
    notes: '',
    selectedFile: null,
  });

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormState((prev) => ({
        ...prev,
        selectedFile: file,
      }));
    }
  };

  const handleDragAndDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFormState((prev) => ({
        ...prev,
        selectedFile: file,
      }));
    }
  };

  const handleUpload = () => {
    // Frontend mock upload - no backend processing
    if (
      !formState.patientName ||
      !formState.reportType ||
      !formState.reportDate ||
      !formState.reportTitle ||
      !formState.selectedFile
    ) {
      alert('Please fill in all required fields and select a file.');
      return;
    }

    // Log mock upload
    console.log('Mock Report Upload:', {
      patientName: formState.patientName,
      reportType: formState.reportType,
      reportDate: formState.reportDate,
      reportTitle: formState.reportTitle,
      fileName: formState.selectedFile.name,
      fileSize: formState.selectedFile.size,
      notes: formState.notes,
    });

    // Add to mock uploaded list
    setUploadedFiles((prev) => [
      ...prev,
      `${formState.reportTitle} (${formState.selectedFile?.name})`,
    ]);

    // Reset form
    setFormState({
      patientName: '',
      reportType: '',
      reportDate: '',
      reportTitle: '',
      notes: '',
      selectedFile: null,
    });

    alert('Report uploaded successfully!\n\n(This is a frontend mock - no data was stored.)');
  };

  const handleClearFile = () => {
    setFormState((prev) => ({
      ...prev,
      selectedFile: null,
    }));
  };

  const handleRemoveUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Report Upload Foundation"
        subtitle="This is a frontend-only placeholder interface for uploading maternal and child care reports. In production, this would connect to secure backend storage and verification workflows."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-sandal-200">
            <h3 className="text-lg font-bold text-warm-brown mb-4">Upload New Report</h3>

            <form className="space-y-4">
              {/* Patient/Mother Selection */}
              <div>
                <label className="block text-sm font-medium text-warm-brown mb-1">
                  Patient / Mother Name *
                </label>
                <Input
                  type="text"
                  name="patientName"
                  placeholder="Enter patient/mother name"
                  value={formState.patientName}
                  onChange={handleInputChange}
                />
              </div>

              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-warm-brown mb-1">
                  Report Type *
                </label>
                <Select
                  name="reportType"
                  value={formState.reportType}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: '-- Select Report Type --' },
                    { value: 'ULTRASOUND', label: 'Ultrasound / Scan' },
                    { value: 'BLOOD_TEST', label: 'Blood & Lab Tests' },
                    { value: 'PRESCRIPTION', label: 'Prescriptions' },
                    { value: 'OTHER', label: 'Other Medical Documents' },
                  ]}
                />
              </div>

              {/* Report Date */}
              <div>
                <label className="block text-sm font-medium text-warm-brown mb-1">
                  Report Date *
                </label>
                <Input
                  type="date"
                  name="reportDate"
                  value={formState.reportDate}
                  onChange={handleInputChange}
                />
              </div>

              {/* Report Title */}
              <div>
                <label className="block text-sm font-medium text-warm-brown mb-1">
                  Report Title *
                </label>
                <Input
                  type="text"
                  name="reportTitle"
                  placeholder="e.g., Ultrasound Scan - 20 Week Assessment"
                  value={formState.reportTitle}
                  onChange={handleInputChange}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-warm-brown mb-1">
                  Clinical Notes / Description
                </label>
                <textarea
                  name="notes"
                  placeholder="Add any additional notes or observations..."
                  value={formState.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-sandal-200 rounded-lg text-warm-brown placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-sandal-500 focus:border-transparent font-sans text-sm"
                />
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-warm-brown mb-2">
                  Report File *
                </label>

                {formState.selectedFile ? (
                  /* File Selected Preview */
                  <Card className="bg-green-50 border-green-200">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-green-200 flex items-center justify-center text-lg">
                          ✓
                        </div>
                        <div>
                          <p className="font-medium text-warm-brown">
                            {formState.selectedFile.name}
                          </p>
                          <p className="text-xs text-warm-muted">
                            {(formState.selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="p-2 hover:bg-green-100 rounded transition-colors"
                      >
                        <X className="w-5 h-5 text-green-600" />
                      </button>
                    </div>
                  </Card>
                ) : (
                  /* Drag and Drop Area */
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDragAndDrop}
                    className="border-2 border-dashed border-sandal-300 rounded-lg p-8 text-center hover:bg-sandal-50 transition-colors cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-sandal-600 mx-auto mb-2" />
                    <p className="font-medium text-warm-brown mb-1">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-warm-muted mb-4">or</p>
                    <label>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <span className="px-4 py-2 bg-sandal-500 text-white rounded-lg font-medium hover:bg-sandal-600 transition-colors inline-block cursor-pointer">
                        Browse Files
                      </span>
                    </label>
                    <p className="text-xs text-warm-muted mt-4">
                      Supported: PDF, JPG, PNG, DOC, DOCX (Max 10 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
                <Button onClick={handleUpload} type="button">
                  Upload Report
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Side Panel - Upload History */}
        <div>
          <Card className="bg-warm-ivory border-sandal-100">
            <h3 className="text-lg font-bold text-warm-brown mb-4">Session Activity</h3>

            {uploadedFiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-warm-muted text-sm">No reports uploaded yet in this session.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 bg-white rounded-lg border border-sandal-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-warm-brown truncate">{file}</p>
                      <p className="text-xs text-warm-muted">Mock Upload</p>
                    </div>
                    <button
                      onClick={() => handleRemoveUploadedFile(index)}
                      className="ml-2 p-1 text-warm-muted hover:text-sandal-600 transition-colors"
                      aria-label="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900 font-medium mb-2">📋 Backend Integration Notice</p>
              <p className="text-xs text-blue-800">
                This is a frontend-only interface. To enable real uploads, connect to:
              </p>
              <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>File storage service (S3, GCS, etc.)</li>
                <li>Patient/report database</li>
                <li>User authentication</li>
                <li>Audit logging</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
