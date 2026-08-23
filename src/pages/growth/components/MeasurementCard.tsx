import React from 'react';
import { CalendarClock, Home, Ruler, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { GrowthMeasurement } from '@/types';
import { getRecipientIcon, getRecipientLabel } from '@/pages/growth/growthUi';

export interface MeasurementCardProps {
  measurement: GrowthMeasurement;
  previous?: GrowthMeasurement;
  onView: (measurement: GrowthMeasurement) => void;
}

export const MeasurementCard: React.FC<MeasurementCardProps> = ({ measurement, previous, onView }) => {
  const RecipientIcon = getRecipientIcon(measurement.recipientType);
  const weightDelta =
    measurement.weightKg !== undefined && previous?.weightKg !== undefined
      ? Math.round((measurement.weightKg - previous.weightKg) * 100) / 100
      : undefined;

  return (
    <Card variant="interactive" className="hover:shadow-warm-md">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
          <Scale className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold text-warm-brown text-base">{measurement.context}</h4>
            {measurement.loggedByMother && (
              <Badge variant="peach" size="sm" className="gap-1">
                <Home className="w-3 h-3" />
                Logged at Home
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-brown font-medium">
            {measurement.weightKg !== undefined && (
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-sandal-500" />
                {measurement.weightKg} kg
                {weightDelta !== undefined && weightDelta !== 0 && (
                  <span className={weightDelta > 0 ? 'text-sage-text flex items-center gap-0.5' : 'text-rose-600 flex items-center gap-0.5'}>
                    {weightDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {weightDelta > 0 ? '+' : ''}{weightDelta} kg
                  </span>
                )}
              </span>
            )}
            {measurement.heightCm !== undefined && (
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-sandal-500" />
                {measurement.heightCm} cm
              </span>
            )}
            {measurement.headCircumferenceCm !== undefined && (
              <span className="text-xs text-warm-muted self-center">
                Head: {measurement.headCircumferenceCm} cm
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-warm-muted">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-sandal-500" />
              {formatDate(measurement.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <RecipientIcon className="w-3.5 h-3.5 text-sandal-500" />
              {getRecipientLabel(measurement.recipientType)} • {measurement.recipientName}
            </span>
          </div>
        </div>

        <div className="shrink-0 sm:w-36 w-full">
          <Button size="sm" variant="outline" fullWidth onClick={() => onView(measurement)}>
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};
