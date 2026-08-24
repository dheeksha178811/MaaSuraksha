import React from 'react';
import { Check, ClipboardList, FileText, Hospital, Stethoscope, Baby, CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CARE_STAGE_DETAILS, CareStage, pregnancyJourney } from '@/data/careJourneyMockData';
import { useCareStage } from '@/hooks/useCareStage';

const pregnancyStages: CareStage[] = ['EARLY_PREGNANCY', 'ANTENATAL_CARE', 'LATE_PREGNANCY'];

const timeline = [
  { label: 'Pregnancy Registered', detail: 'January 10, 2026', complete: true },
  { label: 'First Consultation', detail: 'January 24, 2026', complete: true },
  { label: 'Initial Tests', detail: 'January 28, 2026', complete: true },
  { label: 'Antenatal Visits', detail: 'Visits 1-7 completed', complete: true },
  { label: 'Current Week', detail: `Week ${pregnancyJourney.currentWeek}`, complete: true },
  { label: 'Upcoming Tests', detail: pregnancyJourney.upcomingTest, complete: false },
  { label: 'Delivery', detail: 'Expected July 25, 2026', complete: false },
];

export const PregnancyPage: React.FC = () => {
  const careStage = useCareStage();
  const pregnancyCompleted = !pregnancyStages.includes(careStage);
  const stageDetails = CARE_STAGE_DETAILS[careStage];
  const displayedTimeline = timeline.map((item) => ({
    ...item,
    complete: pregnancyCompleted ? item.label !== 'Upcoming Tests' : item.complete,
    detail: item.label === 'Delivery' && pregnancyCompleted ? 'Completed July 18, 2026' : item.detail,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Pregnancy Journey"
        subtitle={pregnancyCompleted ? 'Your pregnancy record remains available as part of your complete care history.' : 'Follow your antenatal milestones, upcoming tests, and delivery plan.'}
        badge={<Badge variant="sage">{pregnancyCompleted ? 'Pregnancy Completed' : stageDetails.label}</Badge>}
        actions={<Button variant="outline" size="sm">Download Summary</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card padding="md" className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-warm-muted uppercase tracking-wider font-semibold">Pregnancy timeline</p>
              <h2 className="font-display text-xl font-bold text-warm-brown mt-1">A journey worth remembering</h2>
            </div>
            <Badge variant="warm">Week {pregnancyJourney.currentWeek}</Badge>
          </div>
          <div className="relative pl-2">
            <div className="absolute left-[17px] top-3 bottom-3 w-px bg-sandal-200" />
            <div className="space-y-5">
              {displayedTimeline.map((item) => (
                <div key={item.label} className="relative flex items-start gap-4">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${item.complete ? 'bg-sage-soft border-sage-text text-sage-text' : 'bg-warm-ivory border-sandal-300 text-sandal-600'}`}>
                    {item.complete ? <Check className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-semibold text-warm-brown">{item.label}</p>
                    <p className="text-xs text-warm-muted mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card padding="md" className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sandal-100">
            <Baby className="w-5 h-5 text-sandal-600" />
            <h2 className="font-display text-lg font-bold text-warm-brown">{pregnancyCompleted ? 'Pregnancy Completed' : 'Pregnancy at a glance'}</h2>
          </div>
          <div>
            <p className="text-xs text-warm-muted">Delivery date</p>
            <p className="text-base font-semibold text-warm-brown mt-1">{pregnancyCompleted ? 'July 18, 2026' : 'Expected July 25, 2026'}</p>
          </div>
          <div>
            <p className="text-xs text-warm-muted">Expected delivery date</p>
            <p className="text-base font-semibold text-warm-brown mt-1">July 25, 2026</p>
          </div>
          <div className="pt-3 border-t border-sandal-100">
            <p className="text-xs text-warm-muted">{pregnancyCompleted ? 'Previous pregnancy information' : 'Current stage'}</p>
            <p className="text-sm text-warm-brown mt-1">{pregnancyCompleted ? pregnancyJourney.previousPregnancy : stageDetails.focus}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card padding="md" className="space-y-2"><Stethoscope className="w-5 h-5 text-sandal-600" /><p className="text-xs text-warm-muted">Doctor</p><p className="font-semibold text-warm-brown">{pregnancyJourney.doctor.name}</p><p className="text-xs text-warm-muted">{pregnancyJourney.doctor.specialization}</p></Card>
        <Card padding="md" className="space-y-2"><Hospital className="w-5 h-5 text-sandal-600" /><p className="text-xs text-warm-muted">Hospital</p><p className="font-semibold text-warm-brown">{pregnancyJourney.hospital.name}</p><p className="text-xs text-warm-muted">{pregnancyJourney.hospital.city}</p></Card>
        <Card padding="md" className="space-y-2"><ClipboardList className="w-5 h-5 text-sandal-600" /><p className="text-xs text-warm-muted">Antenatal history</p><p className="font-semibold text-warm-brown">7 visits completed</p><p className="text-xs text-sage-text">All routine milestones recorded</p></Card>
        <Card padding="md" className="space-y-2"><FileText className="w-5 h-5 text-sandal-600" /><p className="text-xs text-warm-muted">Related records</p><p className="font-semibold text-warm-brown">Records placeholder</p><p className="text-xs text-warm-muted">Reports will appear here in a future module.</p></Card>
      </div>
    </div>
  );
};
