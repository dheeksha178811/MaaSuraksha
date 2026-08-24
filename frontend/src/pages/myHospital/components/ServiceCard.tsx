import React from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HospitalService } from '@/types';
import { getHospitalServiceCategoryIcon, HOSPITAL_SERVICE_CATEGORY_LABELS } from '@/pages/myHospital/myHospitalUi';

export interface ServiceCardProps {
  service: HospitalService;
  onView: (service: HospitalService) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onView }) => {
  const CategoryIcon = getHospitalServiceCategoryIcon(service.category);

  return (
    <Card variant="interactive" padding="md" className="space-y-3 hover:shadow-warm-md">
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
          <CategoryIcon className="w-5 h-5" />
        </div>
        <Badge variant="outline" size="sm">{HOSPITAL_SERVICE_CATEGORY_LABELS[service.category]}</Badge>
      </div>
      <div>
        <h4 className="font-display font-semibold text-warm-brown text-base">{service.name}</h4>
        <p className="text-xs text-warm-muted leading-relaxed mt-1 line-clamp-2">{service.description}</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-sandal-100">
        <span className="flex items-center gap-1.5 text-xs text-sandal-700 font-medium">
          <Clock className="w-3.5 h-3.5" />
          {service.availability}
        </span>
        <Button size="sm" variant="ghost" onClick={() => onView(service)}>Details</Button>
      </div>
    </Card>
  );
};
