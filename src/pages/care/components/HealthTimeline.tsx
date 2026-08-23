import React from 'react';
import { cn } from '@/utils/cn';
import { TimelineEvent } from '@/types';
import { MOTHER_TODAY_ISO } from '@/data/motherAppointmentsMockData';
import { TimelineEventCard } from './TimelineEventCard';
import { getTimelineCategoryDotClass } from '@/pages/care/timelineUi';

export interface HealthTimelineProps {
  events: TimelineEvent[];
}

const monthLabel = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

const todayLabel = new Date(MOTHER_TODAY_ISO).toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ events }) => {
  let lastMonth = '';
  let todayMarkerInserted = false;

  return (
    <div>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const eventMonth = monthLabel(event.date);
        const showMonthHeader = eventMonth !== lastMonth;
        lastMonth = eventMonth;

        const showTodayMarker = !todayMarkerInserted && event.date > MOTHER_TODAY_ISO;
        if (showTodayMarker) todayMarkerInserted = true;

        return (
          <React.Fragment key={event.eventId}>
            {showTodayMarker && (
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-sandal-300" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sandal-800 bg-peach-verySoft px-3 py-1 rounded-full shrink-0">
                  Today — {todayLabel}
                </span>
                <div className="flex-1 h-px bg-sandal-300" />
              </div>
            )}
            {showMonthHeader && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-muted pl-7 pt-4 pb-1.5 first:pt-0">
                {eventMonth}
              </p>
            )}
            <div className="flex gap-3">
              <div className="flex flex-col items-center w-4 shrink-0 pt-1.5">
                <span
                  className={cn(
                    'w-3 h-3 rounded-full ring-4 ring-white shrink-0',
                    getTimelineCategoryDotClass(event.category)
                  )}
                />
                {!isLast && <span className="w-px flex-1 bg-sandal-200 my-1" />}
              </div>
              <div className="flex-1 min-w-0 pb-4">
                <TimelineEventCard event={event} />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
