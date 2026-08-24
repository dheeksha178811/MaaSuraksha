import React from 'react';
import { AlertCircle, MessageCircle, Phone, Video, LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DoctorContactOption, DoctorContactType } from '@/types';

const CONTACT_ICONS: Record<DoctorContactType, LucideIcon> = {
  CALL: Phone,
  MESSAGE: MessageCircle,
  VIDEO_CONSULT: Video,
  EMERGENCY: AlertCircle,
};

export interface DoctorContactCardProps {
  option: DoctorContactOption;
  onAction: (option: DoctorContactOption) => void;
}

export const DoctorContactCard: React.FC<DoctorContactCardProps> = ({ option, onAction }) => {
  const Icon = CONTACT_ICONS[option.type];
  const isEmergency = option.type === 'EMERGENCY';

  return (
    <Card
      variant="interactive"
      padding="md"
      className="flex items-start gap-3"
      onClick={() => onAction(option)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onAction(option);
      }}
    >
      <div
        className={
          isEmergency
            ? 'w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0'
            : 'w-10 h-10 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0'
        }
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-warm-brown text-sm">{option.label}</h4>
          {isEmergency && <Badge variant="danger" size="sm">24/7</Badge>}
        </div>
        <p className="text-xs text-warm-muted leading-relaxed">{option.description}</p>
        {option.value && <p className="text-xs font-medium text-sandal-700">{option.value}</p>}
      </div>
    </Card>
  );
};
