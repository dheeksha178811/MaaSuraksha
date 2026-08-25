import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Baby,
  FileText,
  Pill,
  ClipboardList,
  CalendarCheck,
  Upload,
  NotebookPen,
  CalendarPlus,
  ShieldAlert,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import { mockDoctor, mockHospital, mockVaccinations, mockChild } from '@/data/mockData';
import {
  getAppointmentsForPatient,
  getConsultationNotesForPatient,
  getMedicationsForPatient,
  getRecommendationsForPatient,
  getReportsForPatient,
  DOCTOR_TODAY_ISO,
} from '@/data/doctorPatientsMockData';
import { REPORT_CATEGORIES } from '@/data/reportsMockData';
import * as doctorService from '@/services/doctorService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { CareRecommendation, ConsultationNote, DoctorAppointment, Report } from '@/types';
import { ReportDetailsModal } from '@/pages/reports/ReportDetailsModal';
import {
  getAppointmentStatusBadgeVariant,
  getPatientStageSummary,
  getReportStatusBadgeVariant,
  getRiskBadgeVariant,
  getStatusBadgeVariant,
  getStatusLabel,
} from '@/pages/doctor/doctorUi';
import {
  AddRecommendationModal,
  ConsultationNoteModal,
  ScheduleFollowUpModal,
  UploadReportModal,
} from '@/pages/doctor/components/DoctorActionModals';

type TabId = 'overview' | 'stage' | 'reports' | 'medications' | 'careplan' | 'appointments';

export const PatientCareWorkspacePage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();

  const [patientState] = useAsyncData(
    () => (patientId ? doctorService.getPatientDetail(patientId) : Promise.reject(new Error('No patient id in the URL.'))),
    [patientId]
  );
  const patient = patientState.status === 'success' ? patientState.data : undefined;

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [reports, setReports] = useState<Report[]>(() => (patientId ? getReportsForPatient(patientId) : []));
  const [recommendations, setRecommendations] = useState<CareRecommendation[]>(() =>
    patientId ? getRecommendationsForPatient(patientId) : []
  );
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(() =>
    patientId ? getAppointmentsForPatient(patientId) : []
  );
  const [notes, setNotes] = useState<ConsultationNote[]>(() =>
    patientId ? getConsultationNotesForPatient(patientId) : []
  );

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const child = patient?.child;
  const medications = useMemo(() => (patientId ? getMedicationsForPatient(patientId) : []), [patientId]);

  const nextFollowUp = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'upcoming')
        .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0],
    [appointments]
  );

  if (patientState.status === 'loading') {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading Patient…" subtitle="Fetching this patient's care record." />
        <AsyncStateView status="loading" loadingLabel="Loading patient…" />
      </div>
    );
  }

  if (!patient) {
    // Covers both a genuine 404 (patient not found, or found but assigned to
    // a different doctor — the backend's WHERE doctor_id = $2 makes those
    // indistinguishable by design) and any other fetch failure; either way
    // this doctor can't proceed to view a patient, so the same existing
    // empty state applies.
    return (
      <div className="space-y-6">
        <PageHeader
          title="Patient Not Found"
          subtitle="This patient could not be located in your care workspace."
        />
        <EmptyState
          icon={ShieldAlert}
          moduleBadge="Access Restricted"
          title="This patient is not assigned to you"
          description="For patient privacy, doctors can only view mothers currently assigned to their own care panel. Return to My Patients to see the mothers assigned to you."
          action={
            <Link to="/doctor/patients">
              <Button variant="primary" size="md">Back to My Patients</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stage', label: patient.stage === 'ANTENATAL' ? 'Antenatal Care' : 'Postnatal Care' },
    { id: 'reports', label: 'Reports' },
    { id: 'medications', label: 'Medications' },
    { id: 'careplan', label: 'Care Plan' },
    { id: 'appointments', label: 'Appointments' },
  ];

  const handleUploadReport = (data: { name: string; category: Report['category']; fileName: string }) => {
    const newReport: Report = {
      id: `R_${patient.patientId}_${Date.now()}`,
      name: data.name,
      category: data.category,
      date: DOCTOR_TODAY_ISO,
      doctor: mockDoctor.name,
      hospital: mockHospital.name,
      status: 'COMPLETED',
      description: `Uploaded by ${mockDoctor.name} • ${data.fileName}`,
      fileSize: '1.0 MB',
      fileType: 'PDF',
      patientId: patient.patientId,
    };
    setReports((prev) => [newReport, ...prev]);
    setUploadOpen(false);
    alert(`Report uploaded for ${patient.name}. It will also appear in the mother's Reports & Documents.`);
  };

  const handleAddRecommendation = (data: { type: CareRecommendation['type']; title: string; description: string }) => {
    const newRecommendation: CareRecommendation = {
      recommendationId: `rec_${patient.patientId}_${Date.now()}`,
      patientId: patient.patientId,
      doctorId: mockDoctor.id,
      type: data.type,
      title: data.title,
      description: data.description,
      date: DOCTOR_TODAY_ISO,
      active: true,
    };
    setRecommendations((prev) => [newRecommendation, ...prev]);
    setRecommendOpen(false);
    alert(`Care recommendation added for ${patient.name}.`);
  };

  const handleScheduleFollowUp = (data: { type: string; date: string; time: string; notes: string }) => {
    const newAppointment: DoctorAppointment = {
      appointmentId: `apt_${patient.patientId}_${Date.now()}`,
      patientId: patient.patientId,
      patientName: patient.name,
      doctorId: mockDoctor.id,
      hospitalId: mockHospital.id,
      type: (data.type as DoctorAppointment['type']) || 'Follow-up',
      date: data.date,
      time: data.time,
      status: 'upcoming',
      location: `${mockHospital.name} - OPD`,
      notes: data.notes || undefined,
    };
    setAppointments((prev) =>
      [newAppointment, ...prev].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    );
    setScheduleOpen(false);
    alert(`Follow-up scheduled for ${patient.name} on ${data.date} at ${data.time}.`);
  };

  const handleAddNote = (data: { title: string; note: string }) => {
    const newNote: ConsultationNote = {
      noteId: `note_${patient.patientId}_${Date.now()}`,
      patientId: patient.patientId,
      doctorId: mockDoctor.id,
      date: DOCTOR_TODAY_ISO,
      title: data.title,
      note: data.note,
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteOpen(false);
    alert(`Consultation note saved for ${patient.name}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.name}
        subtitle={getPatientStageSummary(patient)}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(patient.status)}>{getStatusLabel(patient.status)}</Badge>
            <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>{patient.riskLevel} Risk</Badge>
          </div>
        }
        actions={
          <Link to="/doctor/patients">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to My Patients
            </Button>
          </Link>
        }
      />

      {/* Doctor Actions */}
      <Card className="bg-warm-cream border-sandal-200">
        <div className="flex flex-wrap gap-3">
          <Button size="sm" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setUploadOpen(true)}>
            Upload Report
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ClipboardList className="w-4 h-4" />}
            onClick={() => setRecommendOpen(true)}
          >
            Add Recommendation
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<CalendarPlus className="w-4 h-4" />}
            onClick={() => setScheduleOpen(true)}
          >
            Schedule Follow-up
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<NotebookPen className="w-4 h-4" />}
            onClick={() => setNoteOpen(true)}
          >
            Add Consultation Note
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-sandal-100 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-sandal-500 text-white shadow-sm'
                : 'text-warm-muted hover:bg-warm-cream hover:text-sandal-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card padding="md" className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
                <User className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-lg font-bold text-warm-brown">Mother Information</h3>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-warm-muted">Age</dt><dd className="font-semibold text-warm-brown">{patient.age} years</dd></div>
                <div><dt className="text-xs text-warm-muted">Blood Group</dt><dd className="font-semibold text-warm-brown">{patient.bloodGroup}</dd></div>
                <div><dt className="text-xs text-warm-muted">Phone</dt><dd className="font-semibold text-warm-brown">{patient.phone}</dd></div>
                <div><dt className="text-xs text-warm-muted">Location</dt><dd className="font-semibold text-warm-brown">{patient.location}</dd></div>
                <div><dt className="text-xs text-warm-muted">Registered On</dt><dd className="font-semibold text-warm-brown">{patient.registeredOn}</dd></div>
                <div><dt className="text-xs text-warm-muted">Last Visit</dt><dd className="font-semibold text-warm-brown">{patient.lastVisitDate || '—'}</dd></div>
              </dl>
            </Card>

            <Card padding="md" className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
                <Baby className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-lg font-bold text-warm-brown">Child Information</h3>
              </div>
              {child ? (
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-xs text-warm-muted">Name</dt><dd className="font-semibold text-warm-brown">{child.name}</dd></div>
                  <div><dt className="text-xs text-warm-muted">Age</dt><dd className="font-semibold text-warm-brown">{child.ageDisplay}</dd></div>
                  <div><dt className="text-xs text-warm-muted">Birth Weight</dt><dd className="font-semibold text-warm-brown">{child.birthWeightKg} kg</dd></div>
                  <div><dt className="text-xs text-warm-muted">Current Weight</dt><dd className="font-semibold text-warm-brown">{child.currentWeightKg} kg</dd></div>
                  <div><dt className="text-xs text-warm-muted">Blood Group</dt><dd className="font-semibold text-warm-brown">{child.bloodGroup}</dd></div>
                  <div><dt className="text-xs text-warm-muted">Birth Hospital</dt><dd className="font-semibold text-warm-brown truncate">{child.birthHospital}</dd></div>
                </dl>
              ) : (
                <p className="text-sm text-warm-muted py-2">No child record yet — this will populate after delivery.</p>
              )}
            </Card>
          </div>

          <Card padding="md" className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
              <CalendarCheck className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Next Follow-up</h3>
            </div>
            {nextFollowUp ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-warm-brown">{nextFollowUp.type}</p>
                  <p className="text-xs text-warm-muted">{nextFollowUp.location}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-semibold text-warm-brown">{nextFollowUp.date}</p>
                  <p className="text-xs text-warm-muted">{nextFollowUp.time}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-warm-muted">No follow-up scheduled yet.</p>
            )}
          </Card>

          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-sandal-100">
              <div className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-sandal-600" />
                <h3 className="font-display text-lg font-bold text-warm-brown">Consultation Notes</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setNoteOpen(true)}>Add Note</Button>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-warm-muted">No consultation notes recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n.noteId} className="p-3 rounded-xl bg-warm-ivory border border-sandal-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-warm-brown">{n.title}</p>
                      <span className="text-[11px] text-warm-muted">{n.date}</span>
                    </div>
                    <p className="text-xs text-warm-muted mt-1 leading-relaxed">{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Stage-specific Tab */}
      {activeTab === 'stage' && patient.stage === 'ANTENATAL' && patient.antenatal && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card padding="md" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-warm-muted uppercase tracking-wider font-semibold">Pregnancy progress</p>
                <h3 className="font-display text-xl font-bold text-warm-brown mt-1">Week {patient.antenatal.pregnancyWeek} of Pregnancy</h3>
              </div>
              <Badge variant="warm">{patient.antenatal.gravida}</Badge>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-warm-muted mb-1.5">
                <span>ANC Visits</span>
                <span>{patient.antenatal.ancVisitsCompleted} / {patient.antenatal.ancVisitsPlanned} completed</span>
              </div>
              <div className="h-2 rounded-full bg-sandal-100 overflow-hidden">
                <div
                  className="h-full bg-sandal-500 rounded-full"
                  style={{ width: `${Math.min(100, (patient.antenatal.ancVisitsCompleted / patient.antenatal.ancVisitsPlanned) * 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-sandal-100">
              <p className="text-xs text-warm-muted mb-1">Expected Delivery Date</p>
              <p className="text-base font-semibold text-warm-brown">{patient.antenatal.expectedDeliveryDate}</p>
            </div>
            <div className="pt-2 border-t border-sandal-100">
              <p className="text-xs text-warm-muted mb-2">Pregnancy care information</p>
              <ul className="text-xs text-warm-brown space-y-1.5 list-disc list-inside">
                <li>Maintain scheduled antenatal visits and screening tests.</li>
                <li>Balanced nutrition with iron, calcium, and folic acid supplementation.</li>
                <li>Monitor for warning signs: severe headache, swelling, reduced fetal movement.</li>
              </ul>
            </div>
          </Card>

          <Card padding="md" className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Risk Factors</h3>
            </div>
            {patient.antenatal.highRiskFactors.length === 0 ? (
              <p className="text-sm text-warm-muted">No high-risk factors flagged.</p>
            ) : (
              <ul className="space-y-2">
                {patient.antenatal.highRiskFactors.map((factor, i) => (
                  <li key={i} className="text-xs text-rose-800 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-2">
                    {factor}
                  </li>
                ))}
              </ul>
            )}

            <div className="pt-3 border-t border-sandal-100">
              <p className="text-xs text-warm-muted mb-2">Ultrasound & Lab Reports</p>
              <div className="space-y-2">
                {reports.filter((r) => r.category === 'ULTRASOUND' || r.category === 'BLOOD_TEST').length === 0 ? (
                  <p className="text-xs text-warm-muted">No scan or lab reports yet.</p>
                ) : (
                  reports
                    .filter((r) => r.category === 'ULTRASOUND' || r.category === 'BLOOD_TEST')
                    .map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedReport(r)}
                        className="w-full text-left text-xs p-2 rounded-lg bg-warm-ivory border border-sandal-100 hover:border-sandal-300 transition-colors truncate"
                      >
                        {r.name}
                      </button>
                    ))
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'stage' && patient.stage === 'POSTNATAL' && patient.postnatal && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card padding="md" className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
              <Stethoscope className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Delivery & Recovery</h3>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-warm-muted">Delivery Date</dt><dd className="font-semibold text-warm-brown">{patient.postnatal.deliveryDate}</dd></div>
              <div><dt className="text-xs text-warm-muted">Delivery Type</dt><dd className="font-semibold text-warm-brown">{patient.postnatal.deliveryType}</dd></div>
              <div><dt className="text-xs text-warm-muted">Postpartum Stage</dt><dd className="font-semibold text-warm-brown">{patient.postnatal.postpartumWeeks} weeks</dd></div>
              <div><dt className="text-xs text-warm-muted">Breastfeeding</dt><dd className="font-semibold text-warm-brown">{patient.postnatal.breastfeedingStatus}</dd></div>
            </dl>
            <div className="pt-2 border-t border-sandal-100">
              <p className="text-xs text-warm-muted mb-1">Recovery Status</p>
              <p className="text-sm text-warm-brown leading-relaxed">{patient.postnatal.recoveryStatus}</p>
            </div>
            <div className="pt-2 border-t border-sandal-100">
              <p className="text-xs text-warm-muted mb-2">Postnatal care information</p>
              <ul className="text-xs text-warm-brown space-y-1.5 list-disc list-inside">
                <li>Watch for signs of infection, excessive bleeding, or fever.</li>
                <li>Encourage rest, hydration, and nutrient-dense meals to support recovery.</li>
                <li>Continue iron and calcium supplementation through the postpartum period.</li>
              </ul>
            </div>
          </Card>

          <Card padding="md" className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
              <Syringe className="w-5 h-5 text-sage-text" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Vaccination & Growth</h3>
            </div>
            {child ? (
              <>
                <div className="text-xs text-warm-muted">
                  <span className="font-semibold text-warm-brown">{child.name}</span> • {child.ageDisplay} • {child.currentWeightKg} kg
                </div>
                {child.id === mockChild.id ? (
                  <div className="space-y-2 pt-2 border-t border-sandal-100">
                    {mockVaccinations.map((v) => (
                      <div key={v.id} className="text-xs p-2 rounded-lg bg-warm-ivory border border-sandal-100">
                        <p className="font-semibold text-warm-brown">{v.vaccineName}</p>
                        <p className="text-warm-muted">{v.targetAgeDescription} • {v.status.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-warm-muted pt-2 border-t border-sandal-100">
                    Immunization schedule to be tracked from the next pediatric visit.
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-warm-muted">No child record on file.</p>
            )}
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sandal-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Patient Reports</h3>
            </div>
            <Button size="sm" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setUploadOpen(true)}>
              Upload Report
            </Button>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-warm-muted py-4 text-center">No reports on file for this patient yet.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="w-full text-left p-3.5 rounded-xl bg-warm-ivory border border-sandal-100 hover:border-sandal-300 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-warm-brown truncate">{report.name}</p>
                    <p className="text-xs text-warm-muted">{REPORT_CATEGORIES[report.category]} • {report.date}</p>
                  </div>
                  <Badge variant={getReportStatusBadgeVariant(report.status)} size="sm">{report.status}</Badge>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Medications Tab */}
      {activeTab === 'medications' && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
            <Pill className="w-5 h-5 text-sandal-600" />
            <h3 className="font-display text-lg font-bold text-warm-brown">Medications</h3>
          </div>
          {medications.length === 0 ? (
            <p className="text-sm text-warm-muted py-4 text-center">No medications currently prescribed.</p>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => (
                <div key={med.medicationId} className="p-3.5 rounded-xl bg-warm-ivory border border-sandal-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-warm-brown">{med.name}</p>
                    <Badge variant={med.status === 'active' ? 'sage' : 'outline'} size="sm">{med.status}</Badge>
                  </div>
                  <p className="text-xs text-warm-muted mt-1">{med.dosage} • {med.frequency}</p>
                  <p className="text-xs text-warm-muted">Prescribed by {med.prescribedBy} • Since {med.startDate}</p>
                  {med.notes && <p className="text-xs text-sandal-700 italic mt-1">{med.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Care Plan Tab */}
      {activeTab === 'careplan' && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sandal-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Care Recommendations</h3>
            </div>
            <Button size="sm" onClick={() => setRecommendOpen(true)}>Add Recommendation</Button>
          </div>
          {recommendations.length === 0 ? (
            <p className="text-sm text-warm-muted py-4 text-center">No care recommendations added yet.</p>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.recommendationId} className="p-3.5 rounded-xl bg-warm-ivory border border-sandal-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-warm-brown">{rec.title}</p>
                    <Badge variant="peach" size="sm">{rec.type.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-warm-muted mt-1 leading-relaxed">{rec.description}</p>
                  <p className="text-[11px] text-sandal-600/80 mt-1">{rec.date}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sandal-100">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Appointments</h3>
            </div>
            <Button size="sm" leftIcon={<CalendarPlus className="w-4 h-4" />} onClick={() => setScheduleOpen(true)}>
              Schedule Follow-up
            </Button>
          </div>
          {appointments.length === 0 ? (
            <p className="text-sm text-warm-muted py-4 text-center">No appointments on record for this patient.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.appointmentId}
                  className="p-3.5 rounded-xl bg-warm-ivory border border-sandal-100 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-warm-brown">{apt.type}</p>
                      <Badge variant={getAppointmentStatusBadgeVariant(apt.status)} size="sm">{apt.status}</Badge>
                    </div>
                    <p className="text-xs text-warm-muted">{apt.location}</p>
                    {apt.notes && <p className="text-xs text-sandal-700 italic mt-1">{apt.notes}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-warm-brown">{apt.date}</p>
                    <p className="text-xs text-warm-muted">{apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDownload={(report) => alert(`Downloading: ${report.name}\n\nIn production, this would download the actual file.`)}
        />
      )}

      <UploadReportModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        patientName={patient.name}
        onUpload={handleUploadReport}
      />
      <AddRecommendationModal
        isOpen={recommendOpen}
        onClose={() => setRecommendOpen(false)}
        patientName={patient.name}
        onAdd={handleAddRecommendation}
      />
      <ScheduleFollowUpModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        patientName={patient.name}
        onSchedule={handleScheduleFollowUp}
      />
      <ConsultationNoteModal
        isOpen={noteOpen}
        onClose={() => setNoteOpen(false)}
        patientName={patient.name}
        onAdd={handleAddNote}
      />
    </div>
  );
};

