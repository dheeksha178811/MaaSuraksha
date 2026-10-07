import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GovernmentScheme } from '@/types';
import { SCHEME_CATEGORY_LABELS } from '@/data/governmentSchemesMockData';
import { getSchemeCategoryIcon } from '@/pages/schemes/schemesUi';

export interface SchemeCardProps {
  scheme: GovernmentScheme;
  onView: (scheme: GovernmentScheme) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, onView }) => {
  const CategoryIcon = getSchemeCategoryIcon(scheme.category);

  return (
    <Card padding="md" className="flex flex-col gap-3 hover:shadow-warm-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
          <CategoryIcon className="w-5 h-5" />
        </div>
        <Badge variant="outline" size="sm">{SCHEME_CATEGORY_LABELS[scheme.category]}</Badge>
      </div>
      <div className="flex-1">
        <h4 className="font-display font-semibold text-warm-brown text-base">{scheme.title}</h4>
        {scheme.shortName && <p className="text-xs font-medium text-sandal-700 mt-0.5">{scheme.shortName}</p>}
        <p className="text-xs text-warm-muted leading-relaxed mt-1.5 line-clamp-3">{scheme.description}</p>
      </div>
      <div className="flex justify-end pt-3 border-t border-sandal-100">
        <Button size="sm" variant="outline" onClick={() => onView(scheme)}>View Details</Button>
      </div>
    </Card>
  );
};
