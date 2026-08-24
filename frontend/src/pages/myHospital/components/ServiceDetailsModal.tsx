import React from 'react';
import { Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { mockHospital } from '@/data/mockData';
import { HospitalService } from '@/types';
import { getHospitalServiceCategoryIcon, HOSPITAL_SERVICE_CATEGORY_LABELS } from '@/pages/myHospital/myHospitalUi';

interface ServiceDetailsModalProps {
  service: HospitalService;
  onClose: () => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({ service, onClose }) => {
  const CategoryIcon = getHospitalServiceCategoryIcon(service.category);

  return (
    <Modal isOpen onClose={onClose} maxWidth="md">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0">
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-warm-brown">{service.name}</h2>
            <p className="text-sm text-warm-muted mt-0.5">{mockHospital.name}</p>
          </div>
        </div>

        <Badge variant="outline" size="sm">{HOSPITAL_SERVICE_CATEGORY_LABELS[service.category]}</Badge>

        <p className="text-sm text-warm-brown leading-relaxed">{service.description}</p>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-warm-ivory border border-sandal-100">
          <Clock className="w-4 h-4 text-sandal-600 shrink-0" />
          <div>
            <p className="text-xs text-warm-muted">Availability</p>
            <p className="text-sm font-semibold text-warm-brown">{service.availability}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-sandal-100">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};
