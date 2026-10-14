import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  HeartPulse,
  Info,
  Plus,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import * as doctorService from '@/services/doctorService';
import { useAsyncData } from '@/hooks/useAsyncData';
import { AsyncStateView } from '@/pages/hospital/components/AsyncStateView';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/formatters';
import { MaternalRiskAnalytics, MaternalRiskFlag, RiskFollowUpStatus } from '@/types';
import { CHART_COLORS, FollowUpStatusChart, TrendChart, WeeklyFlagsChart } from './maternalRisk/charts';
import { RecordBloodPressureModal, RecordWarningSignModal, ReviewFlagModal } from './maternalRisk/MaternalRiskModals';

const WEEK_OPTIONS = [
  { value: '4', label: 'Last 4 weeks' },
  { value: '8', label: 'Last 8 weeks' },
  { value: '12', label: 'Last 12 weeks' },
  { value: '26', label: 'Last 26 weeks' },
];

const FOLLOW_UP_LABEL: Record<RiskFollowUpStatus, string> = {
  overdue: 'Overdue',
  upcoming: 'Upcoming',
  completed: 'Completed',
  none: 'None scheduled',
};
const FOLLOW_UP_VARIANT: Record<RiskFollowUpStatus, 'danger' | 'peach' | 'sage' | 'outline'> = {
  overdue: 'danger',
  upcoming: 'peach',
  completed: 'sage',
  none: 'outline',
};

const STAT_CARDS = (s: MaternalRiskAnalytics['summary']) => [
  { label: 'Patients Monitored', value: s.patientsMonitored, icon: Users, tone: 'from-sandal-50 to-sandal-100 border-sandal-200 text-sandal-900' },
  { label: 'Flagged for Review', value: s.patientsFlagged, icon: AlertTriangle, tone: 'from-rose-50 to-rose-100 border-rose-200 text-rose-900' },
  { label: 'Overdue Follow-ups', value: s.overdueFollowUps, icon: CalendarClock, tone: 'from-peach-light to-peach-verySoft border-peach-soft text-sandal-900' },
  { label: 'Completed Follow-ups', value: s.completedFollowUps, icon: CheckCircle2, tone: 'from-sage-light to-sage-soft border-sage/40 text-sage-dark' },
];

export const MaternalRiskPage: React.FC = () => {
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState(8);
  const [state, reload] = useAsyncData(() => doctorService.getMaternalRiskAnalytics(weeks), [weeks]);

  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [followUpFilter, setFollowUpFilter] = useState<'ALL' | RiskFollowUpStatus>('ALL');
  const [showReviewed, setShowReviewed] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<MaternalRiskFlag | null>(null);

  const [trendPatientId, setTrendPatientId] = useState('');
  const [bpOpen, setBpOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);

  const analytics = state.status === 'success' ? state.data : null;

  // Default the trend selector to the first patient once the roster is known.
  useEffect(() => {
    if (analytics && analytics.patients.length > 0 && !analytics.patients.some((p) => p.patientId === trendPatientId)) {
      setTrendPatientId(analytics.patients[0].patientId);
    }
  }, [analytics, trendPatientId]);

  const [trendsState, reloadTrends] = useAsyncData(
    () => (trendPatientId ? doctorService.getPatientHealthTrends(trendPatientId) : Promise.resolve(null)),
    [trendPatientId]
  );

  const visibleFlags = useMemo(() => {
    if (!analytics) return [];
    return analytics.flags.filter(
      (f) =>
        (showReviewed || !f.review) &&
        (priorityFilter === 'ALL' || f.priority === priorityFilter) &&
        (followUpFilter === 'ALL' || f.followUpStatus === followUpFilter)
    );
  }, [analytics, priorityFilter, followUpFilter, showReviewed]);

  const header = (
    <PageHeader
      title="Maternal Risk & Progress"
      subtitle="Rule-based screening prompts and follow-up progress across your assigned patients. Every flag explains itself and needs your review."
      actions={
        <div className="w-44">
          <Select
            aria-label="Time window"
            value={String(weeks)}
            onChange={(e) => setWeeks(Number(e.target.value))}
            options={WEEK_OPTIONS}
          />
        </div>
      }
    />
  );

  if (state.status !== 'success') {
    return (
      <div className="space-y-6">
        {header}
        <AsyncStateView
          status={state.status}
          loadingLabel="Loading maternal risk analytics…"
          errorMessage={state.status === 'error' ? state.message : undefined}
          onRetry={reload}
        />
      </div>
    );
  }

  const data = state.data;
  const selectedPatient = data.patients.find((p) => p.patientId === trendPatientId);
  const refresh = () => { reload(); reloadTrends(); };

  return (
    <div className="space-y-6">
      {header}

      <div className="flex items-start gap-3 rounded-2xl border border-sandal-200 bg-warm-cream px-4 py-3 text-sm text-warm-brown">
        <Info className="w-5 h-5 text-sandal-600 shrink-0 mt-0.5" />
        <p>
          <strong>Clinical decision support, not a diagnosis.</strong> Flags are raised by fixed, published rules applied to
          data recorded in MaaSuraksha. They can miss risks that have not been recorded, and every flag needs clinician review.
          All figures are live data from your patients — nothing here is sample data.
        </p>
      </div>

      {data.summary.patientsMonitored === 0 ? (
        <EmptyState
          icon={Users}
          title="No assigned patients yet"
          description="Analytics appear once patients are assigned to you."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS(data.summary).map((stat) => (
              <Card key={stat.label} className={`bg-gradient-to-br border ${stat.tone}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-warm-muted mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-white/60 flex items-center justify-center">
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <p className="text-xs text-warm-muted -mt-3">
            “Flagged” counts patients with at least one unreviewed flag in the selected window. “Overdue” is as of today
            ({formatDate(data.today)}); “Completed” counts visits completed in the selected window.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardTitle>Weekly maternal risk events</CardTitle>
              <CardDescription className="mt-1 mb-4">
                Elevated BP readings, recorded warning signs and missed appointments, by the week they occurred.
              </CardDescription>
              {data.weeklyFlags.every((w) => w.total === 0) ? (
                <p className="text-sm text-warm-muted py-10 text-center">
                  No risk events recorded in this window. Record blood pressure and warning signs below to populate this chart.
                </p>
              ) : (
                <WeeklyFlagsChart data={data.weeklyFlags} />
              )}
            </Card>

            <Card>
              <CardTitle>Follow-up status</CardTitle>
              <CardDescription className="mt-1 mb-4">Appointments across your patients.</CardDescription>
              {data.followUpStatus.completed + data.followUpStatus.upcoming + data.followUpStatus.overdue === 0 ? (
                <p className="text-sm text-warm-muted py-10 text-center">No appointments recorded yet.</p>
              ) : (
                <FollowUpStatusChart {...data.followUpStatus} />
              )}
            </Card>
          </div>

          {/* Patient health trends */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div>
                <CardTitle>Patient health trends</CardTitle>
                <CardDescription className="mt-1">Blood pressure and weight recorded for one patient.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="sm:w-56">
                  <Select
                    aria-label="Patient"
                    value={trendPatientId}
                    onChange={(e) => setTrendPatientId(e.target.value)}
                    options={data.patients.map((p) => ({ value: p.patientId, label: p.name }))}
                  />
                </div>
                <Button size="sm" variant="outline" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setBpOpen(true)}>Record BP</Button>
                <Button size="sm" variant="outline" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setSignOpen(true)}>Warning sign</Button>
              </div>
            </div>

            {trendsState.status !== 'success' ? (
              <AsyncStateView
                status={trendsState.status}
                loadingLabel="Loading trends…"
                errorMessage={trendsState.status === 'error' ? trendsState.message : undefined}
                onRetry={reloadTrends}
              />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-warm-brown mb-2 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-sandal-600" /> Blood pressure (mmHg)
                  </h4>
                  {!trendsState.data || trendsState.data.bloodPressure.length === 0 ? (
                    <p className="text-sm text-warm-muted bg-warm-ivory rounded-xl border border-sandal-100 p-6 text-center">
                      No blood pressure readings recorded for {selectedPatient?.name ?? 'this patient'} yet.
                    </p>
                  ) : (
                    <>
                      <TrendChart
                        ariaLabel={`Blood pressure readings for ${selectedPatient?.name ?? 'patient'}`}
                        series={[
                          { name: 'Systolic', color: CHART_COLORS.systolic, unit: 'mmHg', points: trendsState.data.bloodPressure.map((p) => ({ date: p.date, value: p.systolic })) },
                          { name: 'Diastolic', color: CHART_COLORS.diastolic, unit: 'mmHg', points: trendsState.data.bloodPressure.map((p) => ({ date: p.date, value: p.diastolic })) },
                        ]}
                        references={[{ value: 140, label: '140 systolic' }, { value: 90, label: '90 diastolic' }]}
                      />
                      <p className="text-xs text-warm-muted mt-2">Dashed lines: 140/90 mmHg (ACOG Practice Bulletin 222). One reading above them is a prompt to re-measure, not a diagnosis.</p>
                    </>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-warm-brown mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sandal-600" /> Mother's weight (kg)
                  </h4>
                  {!trendsState.data || trendsState.data.weight.length === 0 ? (
                    <p className="text-sm text-warm-muted bg-warm-ivory rounded-xl border border-sandal-100 p-6 text-center">
                      No weight measurements recorded for {selectedPatient?.name ?? 'this patient'} yet.
                    </p>
                  ) : (
                    <>
                      <TrendChart
                        ariaLabel={`Weight measurements for ${selectedPatient?.name ?? 'patient'}`}
                        series={[{ name: 'Weight', color: CHART_COLORS.weight, unit: 'kg', points: trendsState.data.weight.map((p) => ({ date: p.date, value: p.weightKg })) }]}
                      />
                      {trendsState.data.weight.length < 2 && (
                        <p className="text-xs text-warm-muted mt-2">Only one measurement so far — a trend needs at least two.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Risk review list */}
          <Card>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">
              <div>
                <CardTitle>Patient risk review</CardTitle>
                <CardDescription className="mt-1">
                  {visibleFlags.length} flag{visibleFlags.length === 1 ? '' : 's'} shown — highest priority first.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="w-36">
                  <Select
                    aria-label="Priority filter"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                    options={[{ value: 'ALL', label: 'All priorities' }, { value: 'HIGH', label: 'High' }, { value: 'MEDIUM', label: 'Medium' }]}
                  />
                </div>
                <div className="w-44">
                  <Select
                    aria-label="Follow-up filter"
                    value={followUpFilter}
                    onChange={(e) => setFollowUpFilter(e.target.value as typeof followUpFilter)}
                    options={[{ value: 'ALL', label: 'All follow-ups' }, ...(['overdue', 'upcoming', 'completed', 'none'] as RiskFollowUpStatus[]).map((v) => ({ value: v, label: FOLLOW_UP_LABEL[v] }))]}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-warm-brown pb-2.5 cursor-pointer">
                  <input type="checkbox" className="accent-[#B97863]" checked={showReviewed} onChange={(e) => setShowReviewed(e.target.checked)} />
                  Show reviewed
                </label>
              </div>
            </div>

            {visibleFlags.length === 0 ? (
              <p className="text-sm text-warm-muted bg-warm-ivory rounded-xl border border-sandal-100 p-8 text-center">
                {data.flags.length === 0
                  ? 'No flags raised by the current rules for this window.'
                  : 'No flags match these filters (reviewed flags are hidden unless “Show reviewed” is on).'}
              </p>
            ) : (
              <ul className="divide-y divide-sandal-100/70">
                {visibleFlags.map((f) => {
                  const open = expanded === f.patientId + f.flagKey;
                  return (
                    <li key={f.patientId + f.flagKey} className="py-3.5">
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <button
                          type="button"
                          className="flex-1 min-w-0 text-left"
                          aria-expanded={open}
                          onClick={() => setExpanded(open ? null : f.patientId + f.flagKey)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-warm-brown">{f.patientName}</span>
                            <Badge size="sm" variant={f.priority === 'HIGH' ? 'danger' : 'peach'}>{f.priority === 'HIGH' ? 'High priority' : 'Medium priority'}</Badge>
                            {f.review && <Badge size="sm" variant="sage">{f.review.decision === 'CONFIRMED' ? 'Reviewed – relevant' : 'Reviewed – dismissed'}</Badge>}
                          </div>
                          <p className="text-sm text-warm-brown mt-1 flex items-center gap-1">
                            {f.title}
                            {f.eventDate && <span className="text-warm-muted">· {formatDate(f.eventDate)}</span>}
                            <ChevronDown className={cn('w-4 h-4 text-warm-muted transition-transform', open && 'rotate-180')} />
                          </p>
                        </button>
                        <div className="flex items-center gap-3 shrink-0 flex-wrap">
                          <div className="text-xs text-warm-muted">
                            Follow-up <Badge size="sm" variant={FOLLOW_UP_VARIANT[f.followUpStatus]} className="ml-1">{FOLLOW_UP_LABEL[f.followUpStatus]}</Badge>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setReviewing(f)}>{f.review ? 'Update review' : 'Review'}</Button>
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/doctor/patients/${f.patientId}`)}>Open patient</Button>
                        </div>
                      </div>
                      {open && (
                        <div className="mt-3 rounded-xl bg-warm-cream border border-sandal-100 px-4 py-3 text-sm text-warm-brown space-y-1.5">
                          <p><span className="font-semibold">Why flagged:</span> {f.reason}</p>
                          <p className="text-xs text-warm-muted">
                            Rule: {data.rules.find((r) => r.code === f.ruleCode)?.title}. See “How flags are generated” below for the source.
                          </p>
                          {f.review && (
                            <p className="text-xs text-warm-muted">
                              Reviewed {formatDate(f.review.reviewedAt)}{f.review.note ? ` — “${f.review.note}”` : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Rule transparency */}
          <Card variant="muted">
            <details>
              <summary className="cursor-pointer font-display text-lg font-semibold text-warm-brown">How flags are generated</summary>
              <p className="text-sm text-warm-muted mt-3">
                These rules are applied exactly as written below. They are screening prompts for clinician review; clinical thresholds
                should be confirmed against your own protocol before being relied on.
              </p>
              <ul className="mt-4 space-y-4">
                {data.rules.map((r) => (
                  <li key={r.code} className="text-sm text-warm-brown">
                    <p className="font-semibold">{r.title} <span className="font-normal text-warm-muted">· {r.priority}</span></p>
                    <p>{r.logic}</p>
                    <p className="text-xs text-warm-muted mt-1"><span className="font-semibold">Source:</span> {r.source}</p>
                    <p className="text-xs text-warm-muted"><span className="font-semibold">Limitation:</span> {r.limitation}</p>
                  </li>
                ))}
              </ul>
            </details>
          </Card>
        </>
      )}

      {selectedPatient && (
        <>
          <RecordBloodPressureModal isOpen={bpOpen} onClose={() => setBpOpen(false)} patientId={selectedPatient.patientId} patientName={selectedPatient.name} onSaved={refresh} />
          <RecordWarningSignModal isOpen={signOpen} onClose={() => setSignOpen(false)} patientId={selectedPatient.patientId} patientName={selectedPatient.name} onSaved={refresh} />
        </>
      )}
      <ReviewFlagModal flag={reviewing} onClose={() => setReviewing(null)} onSaved={reload} />
    </div>
  );
};
