import React from 'react';
import { Check, ExternalLink, Landmark } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GovernmentScheme } from '@/types';
import { SCHEME_CATEGORY_LABELS } from '@/data/governmentSchemesMockData';
import { getSchemeCategoryIcon } from '@/pages/schemes/schemesUi';

interface SchemeDetailsModalProps {
  scheme: GovernmentScheme;
  onClose: () => void;
}

export const SchemeDetailsModal: React.FC<SchemeDetailsModalProps> = ({ scheme, onClose }) => {
  const CategoryIcon = getSchemeCategoryIcon(scheme.category);

  return (
    <Modal isOpen onClose={onClose} maxWidth="lg">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-warm-brown">{scheme.title}</h2>
            {scheme.shortName && <p className="text-sm text-warm-muted mt-0.5">{scheme.shortName}</p>}
          </div>
        </div>

        <Badge variant="outline" size="sm">{SCHEME_CATEGORY_LABELS[scheme.category]}</Badge>

        <p className="text-sm text-warm-brown leading-relaxed">{scheme.overview}</p>

        <div>
          <h3 className="text-sm font-semibold text-warm-brown mb-2">What it offers</h3>
          <ul className="space-y-2">
            {scheme.keyBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-warm-brown leading-relaxed">
                <Check className="w-4 h-4 text-sage-text shrink-0 mt-0.5" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-warm-ivory border border-sandal-100">
          <Landmark className="w-4 h-4 text-sandal-600 shrink-0" />
          <div>
            <p className="text-xs text-warm-muted">Implemented by</p>
            <p className="text-sm font-semibold text-warm-brown">{scheme.implementedBy}</p>
          </div>
        </div>

        <p className="text-xs text-warm-muted leading-relaxed">
          This is general information. Benefits and rules can differ by state and change over time — your ASHA worker,
          Anganwadi centre or hospital can confirm what applies to you.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-sandal-100">
          {scheme.officialWebsite && (
            <a
              href={scheme.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-sandal-500 hover:bg-sandal-600 text-white shadow-sm hover:shadow-warm-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sandal-400 active:scale-[0.98]"
            >
              Official Website
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};
