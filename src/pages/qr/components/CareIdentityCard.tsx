import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import { MaternalCareCard, MotherProfile } from '@/types';

export interface CareIdentityCardProps {
  mother: MotherProfile;
  card: MaternalCareCard;
  qrValue: string;
}

const STAGE_LABELS: Record<MotherProfile['stage'], string> = {
  pregnancy: 'Pregnancy',
  postpartum: 'Postpartum',
  infant_care: 'Infant Care',
};

export const CareIdentityCard: React.FC<CareIdentityCardProps> = ({ mother, card, qrValue }) => {
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-warm-brown via-sandal-800 to-sandal-600 p-[1.5px] shadow-warm-lg">
      <div className="rounded-3xl bg-gradient-to-br from-warm-brown via-sandal-900 to-sandal-700 p-6 sm:p-7 text-warm-ivory">
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/15">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight">MaaSuraksha</p>
              <p className="text-[10px] uppercase tracking-wider text-white/60">Maternal Care Identity Card</p>
            </div>
          </div>
          <Badge variant="warm" size="sm" className="bg-white/10 border-white/20 text-white">
            {STAGE_LABELS[mother.stage]}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-5">
          <div className="bg-white rounded-2xl p-3 shrink-0 shadow-warm-md">
            <QRCodeSVG value={qrValue} size={148} level="M" fgColor="#4E3A33" bgColor="#FFFFFF" />
          </div>

          <div className="flex-1 min-w-0 w-full space-y-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Avatar name={mother.name} size="lg" className="mx-auto sm:mx-0 border-white/40" />
              <div>
                <h3 className="font-display text-xl font-bold">{mother.name}</h3>
                <p className="text-xs text-white/70">{mother.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <p className="text-white/50 uppercase tracking-wider text-[10px]">MaaSuraksha ID</p>
                <p className="font-semibold tracking-wide">{card.maaSurakshaId}</p>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-wider text-[10px]">Blood Group</p>
                <p className="font-semibold">{mother.bloodGroup}</p>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-wider text-[10px]">Issued</p>
                <p className="font-semibold">{formatDate(card.issuedDate)}</p>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-wider text-[10px]">Valid Through</p>
                <p className="font-semibold">{formatDate(card.validThrough)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-5 mt-5 border-t border-white/15 text-[11px] text-white/60">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Scan at any partner hospital or health worker visit for instant care identification.</span>
        </div>
      </div>
    </div>
  );
};
