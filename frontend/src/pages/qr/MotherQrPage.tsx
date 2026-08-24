import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  Building2,
  Check,
  Copy,
  HeartPulse,
  MapPin,
  Phone,
  Printer,
  ScanLine,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';
import { mockChild, mockDoctor, mockHospital, mockMother } from '@/data/mockData';
import { getCareCardForMother, getCareCardQrValue } from '@/data/motherCareCardMockData';
import { CareIdentityCard } from './components/CareIdentityCard';

const HOW_TO_USE_STEPS = [
  {
    title: 'At hospital reception',
    description: 'Present the QR at any partner hospital desk to instantly pull up your maternal and child care records.',
    icon: Building2,
  },
  {
    title: 'During an emergency',
    description: 'First responders or emergency staff can scan the code to see your blood group and emergency contact right away.',
    icon: ShieldAlert,
  },
  {
    title: 'At vaccination or ANC camps',
    description: 'Field health workers can scan the code to log vaccinations and antenatal checkups against your record.',
    icon: HeartPulse,
  },
  {
    title: 'With your care team',
    description: 'Your assigned doctor and hospital can verify your identity quickly without repeating paperwork each visit.',
    icon: Users,
  },
];

export const MotherQrPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const careCard = useMemo(() => getCareCardForMother(mockMother.id), []);
  const qrValue = useMemo(() => (careCard ? getCareCardQrValue(careCard) : ''), [careCard]);

  const handleCopyId = async () => {
    if (!careCard) return;
    try {
      await navigator.clipboard.writeText(careCard.maaSurakshaId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access may be unavailable (unsupported browser/context) — no-op.
    }
  };

  if (!careCard) return null;

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="print:hidden">
        <PageHeader
          title="My MaaSuraksha QR"
          subtitle="Your digital care identity card — show this QR at any hospital visit, camp, or emergency for instant care identification."
          badge={<Badge variant="sage">Active Card</Badge>}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopyId}
              >
                {copied ? 'Copied' : 'Copy ID'}
              </Button>
              <Button variant="secondary" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                Print Card
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Identity Card */}
        <div className="lg:col-span-2">
          <CareIdentityCard mother={mockMother} card={careCard} qrValue={qrValue} />
        </div>

        {/* Emergency & Care Info */}
        <div className="lg:col-span-3 space-y-5 print:hidden">
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
              <HeartPulse className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Emergency & Care Information</h3>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <HeartPulse className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-warm-muted">Blood Group</dt>
                  <dd className="font-medium text-warm-brown">{mockMother.bloodGroup}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-warm-muted">Location</dt>
                  <dd className="font-medium text-warm-brown">{mockMother.location}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-warm-muted">Emergency Contact</dt>
                  <dd className="font-medium text-warm-brown">
                    {mockMother.emergencyContact.name} ({mockMother.emergencyContact.relation})
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <div>
                  <dt className="text-xs text-warm-muted">Emergency Phone</dt>
                  <dd className="font-medium text-warm-brown">{mockMother.emergencyContact.phone}</dd>
                </div>
              </div>
            </dl>
          </Card>

          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
              <Stethoscope className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Assigned Hospital & Doctor</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <dt className="text-xs text-warm-muted">Hospital / Facility</dt>
                  <dd className="font-medium text-warm-brown">{mockHospital.name}</dd>
                  <dd className="text-xs text-warm-muted mt-0.5">{mockHospital.city}, {mockHospital.state}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Stethoscope className="w-4 h-4 text-sandal-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <dt className="text-xs text-warm-muted">Primary Doctor</dt>
                  <dd className="font-medium text-warm-brown">{mockDoctor.name}</dd>
                  <dd className="text-xs text-warm-muted mt-0.5">{mockDoctor.specialization}</dd>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Link to="/mother/hospital" className="flex-1">
                <Button variant="outline" size="sm" fullWidth>View Hospital</Button>
              </Link>
              <Link to="/mother/doctor" className="flex-1">
                <Button variant="outline" size="sm" fullWidth>View Doctor</Button>
              </Link>
            </div>
          </Card>

          <Card padding="lg" className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
              <Baby className="w-5 h-5 text-sandal-600" />
              <h3 className="font-display text-lg font-bold text-warm-brown">Child on Record</h3>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-warm-muted">Name</dt>
                <dd className="font-medium text-warm-brown">{mockChild.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-warm-muted">Age</dt>
                <dd className="font-medium text-warm-brown">{mockChild.ageDisplay}</dd>
              </div>
              <div>
                <dt className="text-xs text-warm-muted">Blood Group</dt>
                <dd className="font-medium text-warm-brown">{mockChild.bloodGroup}</dd>
              </div>
              <div>
                <dt className="text-xs text-warm-muted">Date of Birth</dt>
                <dd className="font-medium text-warm-brown">{formatDate(mockChild.dateOfBirth)}</dd>
              </div>
            </dl>
            <Link to="/mother/child">
              <Button variant="outline" size="sm" fullWidth>View Child Profile</Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* How To Use */}
      <Card padding="lg" className="space-y-4 print:hidden">
        <div className="flex items-center gap-2.5 pb-3 border-b border-sandal-100">
          <ScanLine className="w-5 h-5 text-sandal-600" />
          <h3 className="font-display text-xl font-bold text-warm-brown">How This QR Is Used</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOW_TO_USE_STEPS.map((step, index) => (
            <div key={step.title} className="flex items-start gap-3 p-3.5 rounded-xl bg-warm-ivory border border-sandal-100">
              <div className="w-9 h-9 rounded-lg bg-peach-verySoft text-sandal-700 flex items-center justify-center shrink-0 relative">
                <step.icon className="w-4 h-4" />
                <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-sandal-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-warm-brown">{step.title}</p>
                <p className="text-xs text-warm-muted leading-relaxed mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-warm-muted pt-1">
          This card carries only your MaaSuraksha ID and essential care-identification details — full medical records remain securely stored and are never embedded in the QR code itself.
        </p>
      </Card>
    </div>
  );
};
