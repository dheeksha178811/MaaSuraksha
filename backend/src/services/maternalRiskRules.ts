// ---------------------------------------------------------------------------
// Maternal risk review rules — pure functions, no database access.
//
// This is a transparent, rule-based *screening aid*, not a diagnosis and not
// AI. Every flag carries the rule that raised it, the exact data it used, and
// the published source of the rule. Every flag requires clinician review; the
// engine never changes a patient's recorded risk level or status.
//
// Only thresholds that are stated in a published guideline are used. Rules
// that are programme conventions rather than clinical guidance say so in
// their `source`. No threshold here was invented for this feature; where a
// guideline needs more than the data we hold (e.g. two BP readings >= 4 h
// apart for a diagnosis), the rule is worded as a prompt to review, and says so.
// ---------------------------------------------------------------------------

export type FlagPriority = 'HIGH' | 'MEDIUM';
export type RuleCode = 'BP_SEVERE' | 'BP_ELEVATED' | 'WARNING_SIGN' | 'MISSED_APPOINTMENT' | 'RECORDED_HIGH_RISK';
export type FollowUpStatus = 'overdue' | 'upcoming' | 'completed' | 'none';

export const WARNING_SIGN_LABELS: Record<string, string> = {
  SEVERE_HEADACHE: 'Severe headache that does not go away',
  VISION_CHANGES: 'Changes in vision',
  SEVERE_SWELLING: 'Severe swelling of face, hands or feet',
  VAGINAL_BLEEDING: 'Vaginal bleeding',
  REDUCED_FETAL_MOVEMENT: 'Baby moving less than usual',
  FEVER: 'Fever',
  CHEST_PAIN_OR_BREATHLESSNESS: 'Chest pain or difficulty breathing',
  SEVERE_ABDOMINAL_PAIN: 'Severe abdominal pain',
  SEIZURE_OR_FAINTING: 'Seizure or fainting',
};
export const WARNING_SIGN_CODES = Object.keys(WARNING_SIGN_LABELS);

/** Thresholds as published; kept as named constants so the docs and code can't drift. */
export const BP_THRESHOLDS = {
  elevatedSystolic: 140,
  elevatedDiastolic: 90,
  severeSystolic: 160,
  severeDiastolic: 110,
} as const;

export interface RuleDefinition {
  code: RuleCode;
  title: string;
  logic: string;
  priority: string;
  source: string;
  limitation: string;
}

export const RULE_DEFINITIONS: RuleDefinition[] = [
  {
    code: 'BP_SEVERE',
    title: 'Severe-range blood pressure',
    logic: `Latest recorded reading has systolic >= ${BP_THRESHOLDS.severeSystolic} mmHg or diastolic >= ${BP_THRESHOLDS.severeDiastolic} mmHg.`,
    priority: 'High',
    source:
      'ACOG Committee Opinion No. 767 (2019), Emergent Therapy for Acute-Onset, Severe Hypertension During Pregnancy and the Postpartum Period; WHO recommendations for prevention and treatment of pre-eclampsia and eclampsia (2011).',
    limitation: 'A single reading is a prompt for urgent review and re-measurement, not a diagnosis.',
  },
  {
    code: 'BP_ELEVATED',
    title: 'Elevated blood pressure',
    logic: `Latest recorded reading has systolic >= ${BP_THRESHOLDS.elevatedSystolic} mmHg or diastolic >= ${BP_THRESHOLDS.elevatedDiastolic} mmHg (below the severe range). Raised to High when the previous reading was also elevated.`,
    priority: 'Medium (High if the previous reading was also elevated)',
    source: 'ACOG Practice Bulletin No. 222 (2020), Gestational Hypertension and Preeclampsia.',
    limitation:
      'The guideline diagnoses hypertension from two readings at least 4 hours apart; reading times are not checked here, so this only prompts a clinician to confirm.',
  },
  {
    code: 'WARNING_SIGN',
    title: 'Recorded maternal warning sign',
    logic: 'A clinician recorded one of the listed urgent maternal warning signs for the patient.',
    priority: 'High',
    source:
      'CDC "Hear Her" urgent maternal warning signs; ACOG / AWHONN POST-BIRTH Warning Signs education programme.',
    limitation: 'Signs are only as complete as what has been recorded in MaaSuraksha.',
  },
  {
    code: 'MISSED_APPOINTMENT',
    title: 'Missed follow-up appointment',
    logic: 'An appointment is still "upcoming" or "rescheduled" although its date has passed.',
    priority: 'Medium (High if the patient\'s recorded risk level is High)',
    source: 'MaaSuraksha programme rule — not a clinical guideline.',
    limitation:
      'There is no "missed" status in the appointment record, so a visit that happened but was never marked completed will also appear here.',
  },
  {
    code: 'RECORDED_HIGH_RISK',
    title: 'Clinician-recorded high risk',
    logic: 'The patient\'s care record already has a risk level of High (set by a clinician).',
    priority: 'Medium',
    source: 'Existing clinician-entered care record; no threshold is applied by this system.',
    limitation: 'Surfaced so recorded high-risk patients are not missed in this view; it adds no new risk assessment.',
  },
];

export interface BpReadingInput { id: string; date: string; systolic: number; diastolic: number }
export interface WarningSignInput { id: string; code: string; date: string; notes: string | null }
export interface AppointmentInput { id: string; date: string; status: string | null; title: string | null }

export interface PatientInput {
  patientId: string;
  name: string;
  riskLevel: string | null;
  highRiskFactors: string[];
  /** Newest first. */
  readings: BpReadingInput[];
  signs: WarningSignInput[];
  appointments: AppointmentInput[];
}

export interface RiskFlag {
  /** Deterministic key — a clinician's review is stored against it. */
  flagKey: string;
  ruleCode: RuleCode;
  patientId: string;
  patientName: string;
  priority: FlagPriority;
  title: string;
  /** Plain-language explanation of why this was flagged, with the data used. */
  reason: string;
  eventDate: string | null;
  followUpStatus: FollowUpStatus;
}

const OPEN_STATUSES = ['upcoming', 'rescheduled'];

export const isElevated = (r: { systolic: number; diastolic: number }) =>
  r.systolic >= BP_THRESHOLDS.elevatedSystolic || r.diastolic >= BP_THRESHOLDS.elevatedDiastolic;
export const isSevere = (r: { systolic: number; diastolic: number }) =>
  r.systolic >= BP_THRESHOLDS.severeSystolic || r.diastolic >= BP_THRESHOLDS.severeDiastolic;

export const isOverdueAppointment = (a: AppointmentInput, today: string) =>
  OPEN_STATUSES.includes(a.status ?? '') && a.date < today;
export const isUpcomingAppointment = (a: AppointmentInput, today: string) =>
  OPEN_STATUSES.includes(a.status ?? '') && a.date >= today;

/** Overdue wins; otherwise upcoming; otherwise completed; otherwise none scheduled. */
export function followUpStatusFor(appointments: AppointmentInput[], today: string): FollowUpStatus {
  if (appointments.some((a) => isOverdueAppointment(a, today))) return 'overdue';
  if (appointments.some((a) => isUpcomingAppointment(a, today))) return 'upcoming';
  if (appointments.some((a) => a.status === 'completed')) return 'completed';
  return 'none';
}

const reading = (r: BpReadingInput) => `${r.systolic}/${r.diastolic} mmHg on ${r.date}`;

/** Flags for one patient, using only events dated on/after `windowStart`. */
export function evaluatePatient(p: PatientInput, windowStart: string, today: string): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const followUpStatus = followUpStatusFor(p.appointments, today);
  const base = { patientId: p.patientId, patientName: p.name, followUpStatus };

  // BP — latest reading only (current status); older readings feed the weekly chart.
  const inWindow = p.readings.filter((r) => r.date >= windowStart);
  const latest = inWindow[0];
  if (latest && isElevated(latest)) {
    if (isSevere(latest)) {
      flags.push({
        ...base,
        flagKey: `BP_SEVERE:${latest.id}`,
        ruleCode: 'BP_SEVERE',
        priority: 'HIGH',
        title: 'Severe-range blood pressure',
        reason: `Latest reading ${reading(latest)} is at or above ${BP_THRESHOLDS.severeSystolic}/${BP_THRESHOLDS.severeDiastolic} mmHg (severe range). Please re-measure and review.`,
        eventDate: latest.date,
      });
    } else {
      const previous = p.readings[1];
      const persistent = !!previous && isElevated(previous);
      flags.push({
        ...base,
        flagKey: `BP_ELEVATED:${latest.id}`,
        ruleCode: 'BP_ELEVATED',
        priority: persistent ? 'HIGH' : 'MEDIUM',
        title: persistent ? 'Persistently elevated blood pressure' : 'Elevated blood pressure',
        reason:
          `Latest reading ${reading(latest)} is at or above ${BP_THRESHOLDS.elevatedSystolic}/${BP_THRESHOLDS.elevatedDiastolic} mmHg.` +
          (persistent ? ` The previous reading (${reading(previous)}) was also elevated.` : '') +
          ' Please confirm with repeat measurement; this is not a diagnosis.',
        eventDate: latest.date,
      });
    }
  }

  for (const s of p.signs) {
    if (s.date < windowStart) continue;
    const label = WARNING_SIGN_LABELS[s.code] ?? s.code;
    flags.push({
      ...base,
      flagKey: `WARNING_SIGN:${s.id}`,
      ruleCode: 'WARNING_SIGN',
      priority: 'HIGH',
      title: 'Warning sign recorded',
      reason: `"${label}" was recorded on ${s.date}${s.notes ? ` (${s.notes})` : ''}. Listed as an urgent maternal warning sign.`,
      eventDate: s.date,
    });
  }

  for (const a of p.appointments) {
    if (!isOverdueAppointment(a, today) || a.date < windowStart) continue;
    flags.push({
      ...base,
      flagKey: `MISSED_APPOINTMENT:${a.id}`,
      ruleCode: 'MISSED_APPOINTMENT',
      priority: p.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      title: 'Missed follow-up appointment',
      reason:
        `${a.title || 'Appointment'} on ${a.date} is still "${a.status}" and the date has passed.` +
        (p.riskLevel === 'HIGH' ? ' Priority raised because the recorded risk level is High.' : ''),
      eventDate: a.date,
    });
  }

  if (p.riskLevel === 'HIGH') {
    flags.push({
      ...base,
      flagKey: 'RECORDED_HIGH_RISK:HIGH',
      ruleCode: 'RECORDED_HIGH_RISK',
      priority: 'MEDIUM',
      title: 'Recorded high-risk patient',
      reason:
        'The care record lists this patient as High risk' +
        (p.highRiskFactors.length ? ` (recorded factors: ${p.highRiskFactors.join('; ')})` : '') +
        '. No new assessment was made by this system.',
      eventDate: null,
    });
  }

  return flags;
}

export function evaluateFlags(patients: PatientInput[], windowStart: string, today: string): RiskFlag[] {
  const order: Record<FlagPriority, number> = { HIGH: 0, MEDIUM: 1 };
  return patients
    .flatMap((p) => evaluatePatient(p, windowStart, today))
    .sort(
      (a, b) =>
        order[a.priority] - order[b.priority] ||
        (b.eventDate ?? '').localeCompare(a.eventDate ?? '') ||
        a.patientName.localeCompare(b.patientName)
    );
}

// --- date helpers (YYYY-MM-DD strings, UTC math so no timezone drift) --------

const DAY = 86_400_000;
const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`);
const toStr = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function addDays(d: string, n: number): string {
  return toStr(toMs(d) + n * DAY);
}

/** Monday of the week containing `d`. */
export function weekStart(d: string): string {
  const dow = (new Date(toMs(d)).getUTCDay() + 6) % 7; // Mon=0
  return addDays(d, -dow);
}

/** First day of the oldest bucket when showing `weeks` weeks ending with this one. */
export function windowStartFor(today: string, weeks: number): string {
  return addDays(weekStart(today), -7 * (weeks - 1));
}

export interface WeeklyFlagPoint {
  weekStart: string;
  bloodPressure: number;
  warningSigns: number;
  missedAppointments: number;
  total: number;
}

/**
 * Weekly count of dated risk *events* (elevated BP readings, recorded warning
 * signs, missed appointments), bucketed by the week the event occurred. This
 * is derived from real dated records — flags are not stored, so there is no
 * historical "flag raised" timestamp to count instead. "Recorded high risk"
 * has no event date and is not part of this series.
 */
export function weeklyEventCounts(patients: PatientInput[], weeks: number, today: string): WeeklyFlagPoint[] {
  const first = windowStartFor(today, weeks);
  const points: WeeklyFlagPoint[] = Array.from({ length: weeks }, (_, i) => ({
    weekStart: addDays(first, 7 * i),
    bloodPressure: 0,
    warningSigns: 0,
    missedAppointments: 0,
    total: 0,
  }));
  const bucket = (date: string) => points[Math.floor((toMs(weekStart(date)) - toMs(first)) / (7 * DAY))];

  for (const p of patients) {
    for (const r of p.readings) {
      if (r.date >= first && r.date <= today && isElevated(r)) {
        const b = bucket(r.date);
        if (b) b.bloodPressure++;
      }
    }
    for (const s of p.signs) {
      if (s.date >= first && s.date <= today) {
        const b = bucket(s.date);
        if (b) b.warningSigns++;
      }
    }
    for (const a of p.appointments) {
      if (a.date >= first && isOverdueAppointment(a, today)) {
        const b = bucket(a.date);
        if (b) b.missedAppointments++;
      }
    }
  }
  for (const b of points) b.total = b.bloodPressure + b.warningSigns + b.missedAppointments;
  return points;
}
