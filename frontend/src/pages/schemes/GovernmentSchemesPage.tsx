import React, { useMemo, useState } from 'react';
import { Info, Landmark } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { governmentSchemes, SCHEME_CATEGORY_LABELS } from '@/data/governmentSchemesMockData';
import { GovernmentScheme, SchemeCategory } from '@/types';
import { SchemeCard } from './components/SchemeCard';
import { SchemeDetailsModal } from './components/SchemeDetailsModal';

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Categories' },
  ...(Object.keys(SCHEME_CATEGORY_LABELS) as SchemeCategory[]).map((category) => ({
    value: category,
    label: SCHEME_CATEGORY_LABELS[category],
  })),
];

export const GovernmentSchemesPage: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | SchemeCategory>('ALL');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  const filteredSchemes = useMemo(
    () => (categoryFilter === 'ALL' ? governmentSchemes : governmentSchemes.filter((s) => s.category === categoryFilter)),
    [categoryFilter]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Government Schemes"
        subtitle="Government programmes that support mothers and children through pregnancy, delivery, nutrition and immunization."
        badge={<Badge variant="sandal">{governmentSchemes.length} Schemes</Badge>}
        actions={
          <div className="w-full sm:w-56">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'ALL' | SchemeCategory)}
              options={CATEGORY_OPTIONS}
              aria-label="Filter schemes by category"
            />
          </div>
        }
      />

      <Card variant="muted" padding="sm" className="flex items-start gap-3">
        <Info className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-warm-muted leading-relaxed">
          These are general descriptions of each scheme. Your ASHA worker, Anganwadi centre or hospital can confirm
          which schemes apply to you and help you register.
        </p>
      </Card>

      {filteredSchemes.length === 0 ? (
        <Card className="bg-warm-ivory border-sandal-100">
          <div className="text-center py-12">
            <Landmark className="w-10 h-10 text-sandal-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-warm-brown mb-2">No Schemes Found</h3>
            <p className="text-warm-muted">There are no schemes in this category yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSchemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} onView={setSelectedScheme} />
          ))}
        </div>
      )}

      {selectedScheme && <SchemeDetailsModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />}
    </div>
  );
};
