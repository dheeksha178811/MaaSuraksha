// Shapes returned by the /api/doctor maternal-risk endpoints
// (backend/src/services/maternalRiskService.ts). The API already responds in
// camelCase, so these map 1:1 to the JSON.

export type RiskFlagPriority = 'HIGH' | 'MEDIUM';
export type RiskFollowUpStatus = 'overdue' | 'upcoming' | 'completed' | 'none';
export type RiskRuleCode = 'BP_SEVERE' | 'BP_ELEVATED' | 'WARNING_SIGN' | 'MISSED_APPOINTMENT' | 'RECORDED_HIGH_RISK';
export type RiskReviewDecision = 'CONFIRMED' | 'DISMISSED';

export interface RiskFlagReview {
  decision: RiskReviewDecision;
  note: string | null;
  reviewedAt: string;
}

export interface MaternalRiskFlag {
  flagKey: string;
  ruleCode: RiskRuleCode;
  patientId: string;
  patientName: string;
  priority: RiskFlagPriority;
  title: string;
  reason: string;
  eventDate: string | null;
  followUpStatus: RiskFollowUpStatus;
  review: RiskFlagReview | null;
}

export interface WeeklyFlagPoint {
  weekStart: string;
  bloodPressure: number;
  warningSigns: number;
  missedAppointments: number;
  total: number;
}

export interface RiskRuleDefinition {
  code: RiskRuleCode;
  title: string;
  logic: string;
  priority: string;
  source: string;
  limitation: string;
}

export interface MaternalRiskAnalytics {
  generatedAt: string;
  today: string;
  weeks: number;
  windowStart: string;
  summary: {
    patientsMonitored: number;
    patientsFlagged: number;
    overdueFollowUps: number;
    completedFollowUps: number;
  };
  weeklyFlags: WeeklyFlagPoint[];
  followUpStatus: { completed: number; upcoming: number; overdue: number };
  patients: { patientId: string; name: string }[];
  flags: MaternalRiskFlag[];
  rules: RiskRuleDefinition[];
}

export interface PatientHealthTrends {
  patientId: string;
  bloodPressure: { id: string; date: string; systolic: number; diastolic: number }[];
  weight: { id: string; date: string; weightKg: number }[];
}

export const WARNING_SIGN_OPTIONS: { value: string; label: string }[] = [
  { value: 'SEVERE_HEADACHE', label: 'Severe headache that does not go away' },
  { value: 'VISION_CHANGES', label: 'Changes in vision' },
  { value: 'SEVERE_SWELLING', label: 'Severe swelling of face, hands or feet' },
  { value: 'VAGINAL_BLEEDING', label: 'Vaginal bleeding' },
  { value: 'REDUCED_FETAL_MOVEMENT', label: 'Baby moving less than usual' },
  { value: 'FEVER', label: 'Fever' },
  { value: 'CHEST_PAIN_OR_BREATHLESSNESS', label: 'Chest pain or difficulty breathing' },
  { value: 'SEVERE_ABDOMINAL_PAIN', label: 'Severe abdominal pain' },
  { value: 'SEIZURE_OR_FAINTING', label: 'Seizure or fainting' },
];
