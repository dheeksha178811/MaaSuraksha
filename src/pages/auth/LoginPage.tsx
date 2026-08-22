import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  Stethoscope,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  CheckCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { UserRole } from '@/types';
import { ROLE_CONFIGS } from '@/data/mockData';
import { RoleCard } from '@/components/ui/RoleCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useMockAuth } from '@/hooks/useMockAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsRole } = useMockAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string>('ananya.kapoor@example.com');
  const [password, setPassword] = useState<string>('••••••••');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const roleIcons = {
    mother: HeartHandshake,
    doctor: Stethoscope,
    hospital: Building2,
    admin: ShieldCheck,
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Set appropriate demo email for role
    if (role === 'mother') setEmail('ananya.kapoor@example.com');
    if (role === 'doctor') setEmail('dr.priya.menon@sunrisewch.org');
    if (role === 'hospital') setEmail('care@sunrisewch.org');
    if (role === 'admin') setEmail('admin.director@health.gov.in');
  };

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsLoading(true);
    // Simulate lightweight transition
    setTimeout(() => {
      loginAsRole(selectedRole);
      const targetPath = ROLE_CONFIGS[selectedRole].defaultPath;
      navigate(targetPath);
    }, 400);
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-[calc(100vh-160px)] flex flex-col justify-center">
      {/* Header Info */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-verySoft border border-sandal-200 text-xs font-semibold text-sandal-800">
          <Sparkles className="w-3.5 h-3.5 text-sandal-600" />
          <span>MaaSuraksha Portal Authentication</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-warm-brown">
          Welcome to MaaSuraksha
        </h1>

        <p className="text-sm sm:text-base text-warm-muted leading-relaxed">
          {selectedRole
            ? `Sign in to access your ${ROLE_CONFIGS[selectedRole].title} workspace.`
            : 'What brings you here today? Please choose your role to continue.'}
        </p>
      </div>

      {/* STEP 1: Select Role */}
      {!selectedRole ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(['mother', 'doctor', 'hospital', 'admin'] as UserRole[]).map((roleKey) => {
              const cfg = ROLE_CONFIGS[roleKey];
              const Icon = roleIcons[roleKey];
              return (
                <RoleCard
                  key={roleKey}
                  role={roleKey}
                  title={cfg.title.split('/')[0].trim()}
                  subtitle={cfg.subtitle}
                  description={cfg.description}
                  icon={Icon}
                  isSelected={selectedRole === roleKey}
                  onSelect={handleRoleSelect}
                />
              );
            })}
          </div>

          <div className="text-center text-xs text-warm-muted flex items-center justify-center gap-1">
            <HelpCircle className="w-4 h-4 text-sandal-400" />
            <span>Select any role above to enter the corresponding mock workspace.</span>
          </div>
        </div>
      ) : (
        /* STEP 2: Role Login Form */
        <div className="max-w-md mx-auto w-full animate-in zoom-in-95 duration-200">
          <Card className="p-6 sm:p-8 bg-white shadow-warm-lg border border-sandal-200/80">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-sandal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-peach-verySoft text-sandal-600 flex items-center justify-center">
                  {React.createElement(roleIcons[selectedRole], { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-warm-brown">
                    {ROLE_CONFIGS[selectedRole].title}
                  </h3>
                  <span className="text-[11px] text-sandal-600 font-semibold block">
                    Mock Authentication Flow
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-xs text-warm-muted hover:text-sandal-700 flex items-center gap-1 font-medium hover:underline cursor-pointer"
                title="Change role"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Switch</span>
              </button>
            </div>

            <form onSubmit={handleMockLogin} className="space-y-4">
              <Input
                label="Registered Email / ID"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="name@domain.com"
              />

              <Input
                label="Passcode / Security PIN"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="Enter password"
              />

              <div className="p-3 rounded-xl bg-warm-cream/70 border border-sandal-100 text-xs text-warm-muted flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-sage-text shrink-0 mt-0.5" />
                <span>
                  <strong>Module 0 Notice:</strong> Mock authentication enabled. Clicking sign in will transition directly into the {ROLE_CONFIGS[selectedRole].title} workspace.
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="mt-2"
              >
                {isLoading ? 'Entering Workspace...' : `Enter ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Portal`}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
