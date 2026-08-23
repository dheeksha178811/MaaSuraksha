import React from 'react';
import { Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { CareTeamMember } from '@/types';

export interface CareTeamMemberCardProps {
  member: CareTeamMember;
}

export const CareTeamMemberCard: React.FC<CareTeamMemberCardProps> = ({ member }) => {
  return (
    <Card padding="md" className="flex items-start gap-3">
      <Avatar name={member.name} size="md" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-warm-brown text-sm">{member.name}</h4>
          {member.isPrimaryDoctor && <Badge variant="sage" size="sm">Your Doctor</Badge>}
        </div>
        <p className="text-xs text-warm-muted">{member.role}</p>
        <p className="text-[11px] text-sandal-700">{member.department}</p>
        {member.contactNote && (
          <p className="flex items-center gap-1 text-[11px] text-warm-muted pt-1">
            <Info className="w-3 h-3 shrink-0" />
            {member.contactNote}
          </p>
        )}
      </div>
    </Card>
  );
};
