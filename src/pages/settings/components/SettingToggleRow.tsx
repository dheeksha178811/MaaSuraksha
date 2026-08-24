import React from 'react';
import { Switch } from '@/components/ui/Switch';

export interface SettingToggleRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const SettingToggleRow: React.FC<SettingToggleRowProps> = ({
  title,
  description,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0 border-b border-sandal-100/70 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-warm-brown">{title}</p>
        {description && <p className="text-xs text-warm-muted leading-relaxed mt-0.5">{description}</p>}
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={title}
        className="mt-0.5"
      />
    </div>
  );
};
