import React from 'react';
import { ChevronRight, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import { TimelineEvent } from '@/types';
import { getRecipientIcon, getRecipientLabel } from '@/pages/growth/growthUi';
import { getTimelineCategoryIcon, TIMELINE_CATEGORY_LABELS } from '@/pages/care/timelineUi';

export interface TimelineEventCardProps {
  event: TimelineEvent;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event }) => {
  const CategoryIcon = getTimelineCategoryIcon(event.category);
  const RecipientIcon = getRecipientIcon(event.recipient);

  return (
    <Card padding="md" className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="w-8 h-8 rounded-lg bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
            <CategoryIcon className="w-4 h-4" />
          </span>
          <h4 className="font-display font-semibold text-warm-brown text-base">{event.title}</h4>
        </div>
        <span className="text-xs font-semibold text-warm-muted whitespace-nowrap shrink-0">
          {formatDate(event.date)}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" size="sm">{TIMELINE_CATEGORY_LABELS[event.category]}</Badge>
        {event.statusLabel && (
          <Badge variant={event.statusVariant || 'outline'} size="sm">{event.statusLabel}</Badge>
        )}
        <span className="flex items-center gap-1 text-[11px] text-warm-muted">
          <RecipientIcon className="w-3 h-3" />
          {getRecipientLabel(event.recipient)} • {event.recipientName}
        </span>
      </div>

      {event.summary && <p className="text-xs text-warm-muted leading-relaxed">{event.summary}</p>}

      {(event.doctorName || event.hospitalName) && (
        <p className="flex items-center gap-1.5 text-[11px] text-sandal-700">
          <Stethoscope className="w-3 h-3" />
          {[event.doctorName, event.hospitalName].filter(Boolean).join(' • ')}
        </p>
      )}

      {event.linkTo && (
        <Link
          to={event.linkTo}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-sandal-700 hover:underline pt-1"
        >
          {event.linkLabel || 'View Details'}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </Card>
  );
};
