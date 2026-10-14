import React, { useEffect, useRef, useState } from 'react';
import { WeeklyFlagPoint } from '@/types';

// Dependency-free SVG charts. The project has no chart library and this
// feature does not justify adding one. Charts measure their container and
// render at real pixel width, so text stays legible on phones.

export const CHART_COLORS = {
  bloodPressure: '#9E6252',
  warningSigns: '#4E3A33',
  missedAppointments: '#7FA087',
  completed: '#7FA087',
  upcoming: '#D5A492',
  overdue: '#BE4D4D',
  systolic: '#9E6252',
  diastolic: '#7FA087',
  weight: '#4E3A33',
  grid: '#EFE6DE',
  axis: '#806D64',
  reference: '#BE4D4D',
};

function useContainerWidth(): [React.RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

const shortDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${iso}T00:00:00`));
const longDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${iso}T00:00:00`));

/** Round a max up to a tidy axis ceiling. */
function niceMax(max: number, minCeil = 4): number {
  const m = Math.max(max, minCeil);
  const step = m <= 8 ? 2 : m <= 20 ? 5 : 10;
  return Math.ceil(m / step) * step;
}

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-warm-muted">
    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
    {label}
  </span>
);

// --- Weekly maternal risk flags (stacked bars) ------------------------------

const WEEKLY_SERIES: { key: 'bloodPressure' | 'warningSigns' | 'missedAppointments'; label: string; color: string }[] = [
  { key: 'bloodPressure', label: 'Elevated BP readings', color: CHART_COLORS.bloodPressure },
  { key: 'warningSigns', label: 'Warning signs', color: CHART_COLORS.warningSigns },
  { key: 'missedAppointments', label: 'Missed appointments', color: CHART_COLORS.missedAppointments },
];

export const WeeklyFlagsChart: React.FC<{ data: WeeklyFlagPoint[] }> = ({ data }) => {
  const [ref, width] = useContainerWidth();
  const [active, setActive] = useState<number | null>(null);
  const height = 220;
  const m = { top: 12, right: 8, bottom: 28, left: 28 };
  const innerW = Math.max(width - m.left - m.right, 0);
  const innerH = height - m.top - m.bottom;
  const yMax = niceMax(Math.max(...data.map((d) => d.total), 0));
  const y = (v: number) => m.top + innerH - (v / yMax) * innerH;
  const slot = data.length ? innerW / data.length : 0;
  const barW = Math.min(slot * 0.62, 36);
  const labelEvery = slot < 34 ? Math.ceil(34 / Math.max(slot, 1)) : 1;
  const sel = active !== null ? data[active] : null;

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
        {WEEKLY_SERIES.map((s) => <LegendDot key={s.key} color={s.color} label={s.label} />)}
      </div>
      <p className="text-xs text-warm-brown min-h-[1.25rem] mb-1" aria-live="polite">
        {sel
          ? `Week of ${longDate(sel.weekStart)}: ${sel.total} event${sel.total === 1 ? '' : 's'} — ${sel.bloodPressure} BP, ${sel.warningSigns} warning sign${sel.warningSigns === 1 ? '' : 's'}, ${sel.missedAppointments} missed appt${sel.missedAppointments === 1 ? '' : 's'}`
          : 'Hover or tap a week for details.'}
      </p>
      <div ref={ref} className="w-full">
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label="Stacked bar chart of weekly maternal risk events">
            {[0, 0.5, 1].map((t) => {
              const v = Math.round(yMax * t);
              return (
                <g key={t}>
                  <line x1={m.left} x2={width - m.right} y1={y(v)} y2={y(v)} stroke={CHART_COLORS.grid} />
                  <text x={m.left - 6} y={y(v) + 4} textAnchor="end" fontSize={11} fill={CHART_COLORS.axis}>{v}</text>
                </g>
              );
            })}
            {data.map((d, i) => {
              const x = m.left + slot * i + (slot - barW) / 2;
              let acc = 0;
              return (
                <g key={d.weekStart} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} onClick={() => setActive(i)}>
                  <title>{`Week of ${longDate(d.weekStart)}: ${d.total} events`}</title>
                  <rect x={m.left + slot * i} y={m.top} width={slot} height={innerH} fill={active === i ? '#F7F0EA' : 'transparent'} />
                  {WEEKLY_SERIES.map((s) => {
                    const v = d[s.key];
                    if (!v) return null;
                    const top = y(acc + v);
                    const h = y(acc) - top;
                    acc += v;
                    return <rect key={s.key} x={x} y={top} width={barW} height={Math.max(h - 1, 1)} fill={s.color} rx={2} />;
                  })}
                  {i % labelEvery === 0 && (
                    <text x={m.left + slot * i + slot / 2} y={height - 8} textAnchor="middle" fontSize={11} fill={CHART_COLORS.axis}>
                      {shortDate(d.weekStart)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};

// --- Follow-up status (horizontal stacked proportion + labelled counts) -----

export const FollowUpStatusChart: React.FC<{ completed: number; upcoming: number; overdue: number }> = ({
  completed,
  upcoming,
  overdue,
}) => {
  const total = completed + upcoming + overdue;
  const rows = [
    { label: 'Completed', value: completed, color: CHART_COLORS.completed },
    { label: 'Upcoming', value: upcoming, color: CHART_COLORS.upcoming },
    { label: 'Overdue', value: overdue, color: CHART_COLORS.overdue },
  ];
  return (
    <div className="space-y-4">
      <div
        className="flex h-4 w-full overflow-hidden rounded-full bg-warm-sand"
        role="img"
        aria-label={`Follow-ups: ${completed} completed, ${upcoming} upcoming, ${overdue} overdue`}
      >
        {rows.map((r) => (r.value > 0 ? <div key={r.label} title={`${r.label}: ${r.value}`} style={{ width: `${(r.value / total) * 100}%`, background: r.color }} /> : null))}
      </div>
      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 text-warm-brown">
              <span className="w-3 h-3 rounded-sm" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="font-semibold text-warm-brown tabular-nums">
              {r.value}
              <span className="ml-1.5 font-normal text-xs text-warm-muted">{total ? `${Math.round((r.value / total) * 100)}%` : ''}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Line chart for patient trends -------------------------------------------

export interface TrendSeries {
  name: string;
  color: string;
  unit: string;
  points: { date: string; value: number }[];
}
export interface ReferenceLine { value: number; label: string }

export const TrendChart: React.FC<{
  series: TrendSeries[];
  references?: ReferenceLine[];
  ariaLabel: string;
  height?: number;
}> = ({ series, references = [], ariaLabel, height = 230 }) => {
  const [ref, width] = useContainerWidth();
  const [active, setActive] = useState<string | null>(null);
  const m = { top: 14, right: 12, bottom: 28, left: 40 };
  const innerW = Math.max(width - m.left - m.right, 0);
  const innerH = height - m.top - m.bottom;

  const dates = Array.from(new Set(series.flatMap((s) => s.points.map((p) => p.date)))).sort();
  const values = [...series.flatMap((s) => s.points.map((p) => p.value)), ...references.map((r) => r.value)];
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const pad = Math.max((rawMax - rawMin) * 0.12, 2);
  const yMin = Math.floor((rawMin - pad) / 5) * 5;
  const yMax = Math.ceil((rawMax + pad) / 5) * 5;
  const y = (v: number) => m.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;
  const x = (d: string) => m.left + (dates.length <= 1 ? innerW / 2 : (dates.indexOf(d) / (dates.length - 1)) * innerW);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(yMin + (yMax - yMin) * t));
  const labelEvery = Math.max(1, Math.ceil(dates.length / Math.max(Math.floor(innerW / 64), 1)));
  const readout = active
    ? series
        .map((s) => {
          const p = s.points.find((pt) => pt.date === active);
          return p ? `${s.name} ${p.value} ${s.unit}` : null;
        })
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
        {series.map((s) => <LegendDot key={s.name} color={s.color} label={s.name} />)}
        {references.length > 0 && <LegendDot color={CHART_COLORS.reference} label="Guideline threshold" />}
      </div>
      <p className="text-xs text-warm-brown min-h-[1.25rem] mb-1" aria-live="polite">
        {active ? `${longDate(active)}: ${readout}` : 'Hover or tap a point for details.'}
      </p>
      <div ref={ref} className="w-full">
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={ariaLabel}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={m.left} x2={width - m.right} y1={y(t)} y2={y(t)} stroke={CHART_COLORS.grid} />
                <text x={m.left - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill={CHART_COLORS.axis}>{t}</text>
              </g>
            ))}
            {references.map((r) => (
              <g key={r.label}>
                <line x1={m.left} x2={width - m.right} y1={y(r.value)} y2={y(r.value)} stroke={CHART_COLORS.reference} strokeDasharray="4 4" />
                <text x={width - m.right} y={y(r.value) - 4} textAnchor="end" fontSize={10} fill={CHART_COLORS.reference}>{r.label}</text>
              </g>
            ))}
            {dates.map((d, i) =>
              i % labelEvery === 0 ? (
                <text key={d} x={x(d)} y={height - 8} textAnchor="middle" fontSize={11} fill={CHART_COLORS.axis}>{shortDate(d)}</text>
              ) : null
            )}
            {series.map((s) => (
              <g key={s.name}>
                {s.points.length > 1 && (
                  <polyline
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    points={s.points.map((p) => `${x(p.date)},${y(p.value)}`).join(' ')}
                  />
                )}
                {s.points.map((p, i) => (
                  <circle key={`${p.date}-${i}`} cx={x(p.date)} cy={y(p.value)} r={active === p.date ? 5 : 3.5} fill={s.color} stroke="#fff" strokeWidth={1.5}>
                    <title>{`${s.name}: ${p.value} ${s.unit} on ${longDate(p.date)}`}</title>
                  </circle>
                ))}
              </g>
            ))}
            {dates.map((d) => (
              <rect
                key={`hit-${d}`}
                x={x(d) - Math.max(innerW / Math.max(dates.length, 1) / 2, 10)}
                y={m.top}
                width={Math.max(innerW / Math.max(dates.length, 1), 20)}
                height={innerH}
                fill="transparent"
                onMouseEnter={() => setActive(d)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(d)}
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
};
