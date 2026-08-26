import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ReportCategory } from '@/types';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
}

const REPORT_CATEGORY_OPTIONS: { value: ReportCategory; label: string }[] = [
  { value: 'ULTRASOUND', label: 'Ultrasound / Scan' },
  { value: 'BLOOD_TEST', label: 'Blood & Lab Tests' },
  { value: 'PRESCRIPTION', label: 'Prescriptions' },
  { value: 'OTHER', label: 'Other Medical Documents' },
];

export interface UploadReportModalProps extends BaseModalProps {
  onUpload: (data: { name: string; category: ReportCategory; file: File }) => Promise<void>;
}

export const UploadReportModal: React.FC<UploadReportModalProps> = ({
  isOpen,
  onClose,
  patientName,
  onUpload,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ReportCategory>('ULTRASOUND');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !file) {
      alert('Please provide a report title and select a file.');
      return;
    }
    setSubmitting(true);
    try {
      await onUpload({ name, category, file });
      setName('');
      setFile(null);
      setCategory('ULTRASOUND');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to upload report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Report" description={`For ${patientName}`} maxWidth="md">
      <div className="space-y-4">
        <Input
          label="Report Title"
          placeholder="e.g., 32-Week Growth Scan"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select
          label="Category"
          options={REPORT_CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value as ReportCategory)}
        />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            File
          </label>
          <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-sandal-300 hover:bg-sandal-50 transition-colors cursor-pointer text-sm text-warm-muted">
            <Upload className="w-4 h-4 text-sandal-600 shrink-0" />
            <span className="truncate">{file ? file.name : 'Choose a file to attach'}</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Uploading…' : 'Upload Report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export interface AddRecommendationModalProps extends BaseModalProps {
  onAdd: (data: { type: 'NUTRITION' | 'MEDICATION' | 'LIFESTYLE' | 'FOLLOW_UP' | 'GENERAL'; title: string; description: string }) => void;
}

const RECOMMENDATION_TYPE_OPTIONS = [
  { value: 'NUTRITION', label: 'Nutrition' },
  { value: 'MEDICATION', label: 'Medication' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
  { value: 'FOLLOW_UP', label: 'Follow-up Care' },
  { value: 'GENERAL', label: 'General' },
];

export const AddRecommendationModal: React.FC<AddRecommendationModalProps> = ({
  isOpen,
  onClose,
  patientName,
  onAdd,
}) => {
  const [type, setType] = useState<'NUTRITION' | 'MEDICATION' | 'LIFESTYLE' | 'FOLLOW_UP' | 'GENERAL'>('NUTRITION');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title || !description) {
      alert('Please provide a title and description for the recommendation.');
      return;
    }
    onAdd({ type, title, description });
    setTitle('');
    setDescription('');
    setType('NUTRITION');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Care Recommendation" description={`For ${patientName}`} maxWidth="md">
      <div className="space-y-4">
        <Select
          label="Type"
          options={RECOMMENDATION_TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
        />
        <Input
          label="Title"
          placeholder="e.g., Iron-rich postpartum diet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the recommendation for this patient..."
            className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Recommendation</Button>
        </div>
      </div>
    </Modal>
  );
};

export interface ScheduleFollowUpModalProps extends BaseModalProps {
  onSchedule: (data: { type: string; date: string; time: string; notes: string }) => void;
}

export const ScheduleFollowUpModal: React.FC<ScheduleFollowUpModalProps> = ({
  isOpen,
  onClose,
  patientName,
  onSchedule,
}) => {
  const [type, setType] = useState('Follow-up');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!date || !time) {
      alert('Please select a date and time for the follow-up.');
      return;
    }
    onSchedule({ type, date, time, notes });
    setDate('');
    setTime('');
    setNotes('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Follow-up" description={`For ${patientName}`} maxWidth="md">
      <div className="space-y-4">
        <Input
          label="Visit Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g., Follow-up Checkup"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <Input
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any preparation notes for this visit"
        />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Schedule Follow-up</Button>
        </div>
      </div>
    </Modal>
  );
};

export interface ConsultationNoteModalProps extends BaseModalProps {
  onAdd: (data: { title: string; note: string }) => void;
}

export const ConsultationNoteModal: React.FC<ConsultationNoteModalProps> = ({
  isOpen,
  onClose,
  patientName,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!title || !note) {
      alert('Please provide a title and note.');
      return;
    }
    onAdd({ title, note });
    setTitle('');
    setNote('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Consultation Note" description={`For ${patientName}`} maxWidth="md">
      <div className="space-y-4">
        <Input
          label="Note Title"
          placeholder="e.g., Routine antenatal visit"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-warm-muted mb-1.5">
            Consultation Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Clinical observations, discussion, and plan..."
            className="w-full px-3.5 py-2.5 border border-sandal-200 rounded-xl text-sm text-warm-brown placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sandal-200 focus:border-sandal-500 font-sans"
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Note</Button>
        </div>
      </div>
    </Modal>
  );
};
