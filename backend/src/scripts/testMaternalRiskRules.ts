// Run: npx tsx src/scripts/testMaternalRiskRules.ts
// Pure-function checks of the maternal risk rule engine — no database needed.
import assert from 'node:assert/strict';
import {
  PatientInput,
  evaluateFlags,
  followUpStatusFor,
  weekStart,
  weeklyEventCounts,
  windowStartFor,
} from '../services/maternalRiskRules';

const TODAY = '2026-10-14'; // a Wednesday
const base = (over: Partial<PatientInput> = {}): PatientInput => ({
  patientId: 'p1', name: 'Test Mother', riskLevel: 'LOW', highRiskFactors: [],
  readings: [], signs: [], appointments: [], ...over,
});
const flagsFor = (p: PatientInput, from = '2026-08-17') => evaluateFlags([p], from, TODAY);
let passed = 0;
const test = (name: string, fn: () => void) => { fn(); passed++; console.log(`ok - ${name}`); };

test('no data -> no flags (nothing invented)', () => {
  assert.deepEqual(flagsFor(base()), []);
});
test('139/89 is not flagged; 140/80 and 120/90 are (boundaries)', () => {
  assert.equal(flagsFor(base({ readings: [{ id: 'a', date: '2026-10-10', systolic: 139, diastolic: 89 }] })).length, 0);
  assert.equal(flagsFor(base({ readings: [{ id: 'a', date: '2026-10-10', systolic: 140, diastolic: 80 }] }))[0].ruleCode, 'BP_ELEVATED');
  assert.equal(flagsFor(base({ readings: [{ id: 'a', date: '2026-10-10', systolic: 120, diastolic: 90 }] }))[0].ruleCode, 'BP_ELEVATED');
});
test('159/109 elevated MEDIUM; 160/80 and 120/110 severe HIGH', () => {
  const f = (s: number, d: number) => flagsFor(base({ readings: [{ id: 'a', date: '2026-10-10', systolic: s, diastolic: d }] }))[0];
  assert.deepEqual([f(159, 109).ruleCode, f(159, 109).priority], ['BP_ELEVATED', 'MEDIUM']);
  assert.deepEqual([f(160, 80).ruleCode, f(160, 80).priority], ['BP_SEVERE', 'HIGH']);
  assert.deepEqual([f(120, 110).ruleCode, f(120, 110).priority], ['BP_SEVERE', 'HIGH']);
});
test('two consecutive elevated readings -> HIGH persistent; normal previous -> MEDIUM', () => {
  const persistent = flagsFor(base({ readings: [
    { id: 'b', date: '2026-10-12', systolic: 145, diastolic: 92 },
    { id: 'a', date: '2026-10-05', systolic: 142, diastolic: 88 }] }));
  assert.equal(persistent.length, 1);
  assert.equal(persistent[0].priority, 'HIGH');
  const single = flagsFor(base({ readings: [
    { id: 'b', date: '2026-10-12', systolic: 145, diastolic: 92 },
    { id: 'a', date: '2026-10-05', systolic: 118, diastolic: 76 }] }));
  assert.equal(single[0].priority, 'MEDIUM');
});
test('only the latest reading is evaluated: recovered BP raises no flag', () => {
  assert.equal(flagsFor(base({ readings: [
    { id: 'b', date: '2026-10-12', systolic: 118, diastolic: 76 },
    { id: 'a', date: '2026-10-05', systolic: 165, diastolic: 100 }] })).length, 0);
});
test('warning sign -> HIGH with explanation naming the sign', () => {
  const [f] = flagsFor(base({ signs: [{ id: 's1', code: 'SEVERE_HEADACHE', date: '2026-10-11', notes: null }] }));
  assert.equal(f.priority, 'HIGH');
  assert.match(f.reason, /Severe headache/);
  assert.equal(f.flagKey, 'WARNING_SIGN:s1');
});
test('missed appointment: past + upcoming/rescheduled only; completed/cancelled/requested/today excluded', () => {
  const appt = (id: string, date: string, status: string) => ({ id, date, status, title: 'ANC' });
  const flags = flagsFor(base({ appointments: [
    appt('1', '2026-10-01', 'upcoming'), appt('2', '2026-10-02', 'rescheduled'),
    appt('3', '2026-10-03', 'completed'), appt('4', '2026-10-04', 'cancelled'),
    appt('5', '2026-10-05', 'requested'), appt('6', TODAY, 'upcoming'), appt('7', '2026-10-20', 'upcoming')] }));
  assert.deepEqual(flags.map((f) => f.flagKey).sort(), ['MISSED_APPOINTMENT:1', 'MISSED_APPOINTMENT:2']);
  assert.ok(flags.every((f) => f.priority === 'MEDIUM'));
});
test('missed appointment priority rises to HIGH for recorded High-risk patient', () => {
  const flags = flagsFor(base({ riskLevel: 'HIGH', appointments: [{ id: '1', date: '2026-10-01', status: 'upcoming', title: null }] }));
  assert.equal(flags.find((f) => f.ruleCode === 'MISSED_APPOINTMENT')!.priority, 'HIGH');
  assert.ok(flags.some((f) => f.ruleCode === 'RECORDED_HIGH_RISK'));
});
test('events before the window are ignored', () => {
  assert.equal(flagsFor(base({ signs: [{ id: 's', code: 'FEVER', date: '2026-01-01', notes: null }] })).length, 0);
});
test('flags sorted HIGH before MEDIUM', () => {
  const flags = flagsFor(base({
    appointments: [{ id: '1', date: '2026-10-01', status: 'upcoming', title: null }],
    signs: [{ id: 's', code: 'FEVER', date: '2026-10-02', notes: null }] }));
  assert.deepEqual(flags.map((f) => f.priority), ['HIGH', 'MEDIUM']);
});
test('follow-up status precedence: overdue > upcoming > completed > none', () => {
  const a = (status: string, date: string) => ({ id: date + status, date, status, title: null });
  assert.equal(followUpStatusFor([a('upcoming', '2026-10-01'), a('upcoming', '2026-11-01')], TODAY), 'overdue');
  assert.equal(followUpStatusFor([a('upcoming', '2026-11-01'), a('completed', '2026-09-01')], TODAY), 'upcoming');
  assert.equal(followUpStatusFor([a('completed', '2026-09-01'), a('cancelled', '2026-11-01')], TODAY), 'completed');
  assert.equal(followUpStatusFor([], TODAY), 'none');
});
test('week helpers: Monday start, window length', () => {
  assert.equal(weekStart('2026-10-14'), '2026-10-12');
  assert.equal(weekStart('2026-10-18'), '2026-10-12'); // Sunday
  assert.equal(weekStart('2026-10-19'), '2026-10-19');
  assert.equal(windowStartFor(TODAY, 8), '2026-08-24');
});
test('weekly counts bucket events into the right week and sum correctly', () => {
  const p = base({
    readings: [
      { id: 'r1', date: '2026-10-13', systolic: 150, diastolic: 95 }, // this week
      { id: 'r2', date: '2026-10-06', systolic: 118, diastolic: 78 }, // normal -> not counted
      { id: 'r3', date: '2026-10-07', systolic: 162, diastolic: 100 }, // last week
    ],
    signs: [{ id: 's', code: 'FEVER', date: '2026-10-08', notes: null }], // last week
    appointments: [{ id: 'a', date: '2026-08-25', status: 'upcoming', title: null }], // first week, missed
  });
  const w = weeklyEventCounts([p], 8, TODAY);
  assert.equal(w.length, 8);
  assert.equal(w[0].weekStart, '2026-08-24');
  assert.equal(w[0].missedAppointments, 1);
  assert.equal(w[6].weekStart, '2026-10-05');
  assert.deepEqual([w[6].bloodPressure, w[6].warningSigns, w[6].total], [1, 1, 2]);
  assert.deepEqual([w[7].bloodPressure, w[7].total], [1, 1]);
  assert.equal(w.reduce((n, x) => n + x.total, 0), 4);
});

console.log(`\n${passed} tests passed`);
