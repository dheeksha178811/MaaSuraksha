import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import { ApprovedData, ConsentSection, sectionLabel } from '@/services/consentService';

// Renders only the sections present in the payload — the backend omits every
// section the mother did not approve, so nothing else can appear here.

const dash = (v: string | number | null | undefined) => (v === null || v === undefined || v === '' ? '—' : String(v));
const date = (v: string | null) => (v ? formatDate(v) : '—');
const pretty = (v: string | null) => (v ? v.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : '—');

const Row: React.FC<{ title: string; meta?: string; badge?: string | null; children?: React.ReactNode }> = ({ title, meta, badge, children }) => (
  <li className="py-3 first:pt-0 last:pb-0">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-warm-brown break-words">{title}</p>
        {meta && <p className="text-xs text-warm-muted mt-0.5">{meta}</p>}
      </div>
      {badge && <Badge variant="warm" size="sm" className="shrink-0">{pretty(badge)}</Badge>}
    </div>
    {children && <div className="mt-1.5 text-xs text-warm-muted space-y-0.5">{children}</div>}
  </li>
);

const Section: React.FC<{ id: ConsentSection; count: number; children: React.ReactNode }> = ({ id, count, children }) => (
  <div className="rounded-2xl border border-sandal-100 bg-warm-cream/40 p-4">
    <h4 className="font-display text-base font-bold text-warm-brown mb-3">
      {sectionLabel(id)} <span className="text-xs font-medium text-warm-muted">({count})</span>
    </h4>
    {count === 0 ? <p className="text-sm text-warm-muted">No records on file.</p> : <ul className="divide-y divide-sandal-100">{children}</ul>}
  </div>
);

export const ApprovedDataView: React.FC<{ data: ApprovedData }> = ({ data }) => (
  <div className="space-y-4">
    {data.reports && (
      <Section id="reports" count={data.reports.length}>
        {data.reports.map((r) => (
          <Row key={r.id} title={r.name} meta={`${pretty(r.category)} · ${date(r.date)}`} badge={r.status}>
            {r.description && <p>{r.description}</p>}
            {(r.doctorName || r.hospitalName) && <p>{[r.doctorName, r.hospitalName].filter(Boolean).join(' · ')}</p>}
          </Row>
        ))}
      </Section>
    )}
    {data.appointments && (
      <Section id="appointments" count={data.appointments.length}>
        {data.appointments.map((a) => (
          <Row key={a.id} title={a.title ?? pretty(a.category)} meta={`${date(a.date)}${a.time ? ` · ${a.time.slice(0, 5)}` : ''}`} badge={a.status}>
            {a.reason && <p>Reason: {a.reason}</p>}
            {a.notes && <p>Notes: {a.notes}</p>}
            {(a.doctorName || a.hospitalName) && <p>{[a.doctorName, a.hospitalName].filter(Boolean).join(' · ')}</p>}
          </Row>
        ))}
      </Section>
    )}
    {data.medications && (
      <Section id="medications" count={data.medications.length}>
        {data.medications.map((m) => (
          <Row key={m.id} title={m.name} meta={[m.dosage, m.frequency, m.timing].filter(Boolean).join(' · ') || undefined} badge={m.status}>
            <p>{date(m.startDate)} → {m.endDate ? date(m.endDate) : 'ongoing'}</p>
            {m.instructions && <p>Instructions: {m.instructions}</p>}
            {m.caution && <p>Caution: {m.caution}</p>}
            {m.doctorName && <p>Prescribed by {m.doctorName}</p>}
          </Row>
        ))}
      </Section>
    )}
    {data.vaccinations && (
      <Section id="vaccinations" count={data.vaccinations.length}>
        {data.vaccinations.map((v) => (
          <Row
            key={v.id}
            title={`${dash(v.vaccineName)}${v.doseLabel ? ` — ${v.doseLabel}` : ''}`}
            meta={`${pretty(v.recipientType)} · ${v.givenDate ? `Given ${date(v.givenDate)}` : `Due ${date(v.recommendedDate)}`}`}
            badge={v.status}
          >
            {v.administeredBy && <p>Administered by {v.administeredBy}</p>}
            {v.notes && <p>{v.notes}</p>}
          </Row>
        ))}
      </Section>
    )}
    {data.growth && (
      <>
        <Section id="growth" count={data.growth.measurements.length}>
          {data.growth.measurements.map((g) => (
            <Row key={g.id} title={`${pretty(g.recipientType)} · ${date(g.measuredOn)}`}>
              <p>
                Weight {dash(g.weightKg)} kg · Height {dash(g.heightCm)} cm
                {g.headCircumferenceCm ? ` · Head ${g.headCircumferenceCm} cm` : ''}
              </p>
              {g.notes && <p>{g.notes}</p>}
            </Row>
          ))}
        </Section>
        <div className="rounded-2xl border border-sandal-100 bg-warm-cream/40 p-4">
          <h4 className="font-display text-base font-bold text-warm-brown mb-3">
            Milestones <span className="text-xs font-medium text-warm-muted">({data.growth.milestones.length})</span>
          </h4>
          {data.growth.milestones.length === 0 ? (
            <p className="text-sm text-warm-muted">No milestones on file.</p>
          ) : (
            <ul className="divide-y divide-sandal-100">
              {data.growth.milestones.map((m) => (
                <Row key={m.id} title={dash(m.title)} meta={`${pretty(m.category)}${m.targetAgeRange ? ` · ${m.targetAgeRange}` : ''}`} badge={m.status}>
                  {m.description && <p>{m.description}</p>}
                  {m.achievedDate && <p>Achieved {date(m.achievedDate)}</p>}
                </Row>
              ))}
            </ul>
          )}
        </div>
      </>
    )}
  </div>
);
