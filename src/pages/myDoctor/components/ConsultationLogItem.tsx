import React from 'react';
import { FileText } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { ConsultationLogEntry } from '@/types';

export interface ConsultationLogItemProps {
  log: ConsultationLogEntry;
}

export const ConsultationLogItem: React.FC<ConsultationLogItemProps> = ({ log }) => {
  return (
    <div className="flex gap-3 py-3 first:pt-0 last:pb-0 border-b border-sandal-100/70 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0 mt-0.5">
        <FileText className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="font-semibold text-warm-brown text-sm">{log.title}</h4>
          <span className="text-[11px] text-warm-muted shrink-0">{formatDate(log.date)}</span>
        </div>
        <p className="text-xs text-warm-muted leading-relaxed">{log.summary}</p>
      </div>
    </div>
  );
};
