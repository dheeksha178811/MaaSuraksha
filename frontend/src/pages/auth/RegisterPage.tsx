import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Stethoscope,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User,
  CheckCircle,
  RotateCcw,
  UserPlus,
} from 'lucide-react';
import { UserRole } from '@/types';
import { ROLE_CONFIGS } from '@/data/mockData';
import { RoleCard } from '@/components/ui/RoleCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AuthApiError, registerWithBackend } from '@/services/authApi';

const roleIcons = {
  mother: HeartHandshake,
  doctor: Stethoscope,
  hospital: Building2,
  admin: ShieldCheck,
};

export const RegisterPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setFormError(null);
  };

  const handleChangeRole = () => {
    setSelectedRole(null);
    setFormError(null);
    setRegistered(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setFormError(null);

    // Only hospital's profile has a required registration-time field
    // (facilityName — see validateHospitalProfile); mother/doctor/admin have
    // none, so no other role collects extra fields here at all.
    if (selectedRole === 'hospital' && !facilityName.trim()) {
      setFormError('Facility name is required for hospital accounts.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerWithBackend({
        name: name.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        profile: selectedRole === 'hospital' ? { facilityName: facilityName.trim() } : undefined,
      });
      setRegistered(true);
    } catch (error) {
      setFormError(error instanceof AuthApiError ? error.message : 'Unable to create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-[calc(100vh-160px)] flex flex-col justify-center">
      {/* Header Info */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-verySoft border border-sandal-200 text-xs font-semibold text-sandal-800">
          <Sparkles className="w-3.5 h-3.5 text-sandal-600" />
          <span>MaaSuraksha Account Registration</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-warm-brown">
          Create Your Account
        </h1>

        <p className="text-sm sm:text-base text-warm-muted leading-relaxed">
          {selectedRole
            ? `Set up your ${ROLE_CONFIGS[selectedRole].title} account to get started.`
            : 'Choose your role to begin creating a real MaaSuraksha account.'}
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

          <div className="text-center text-xs text-warm-muted">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-sandal-700 hover:underline">
              Sign in instead
            </Link>
          </div>
        </div>
      ) : (
        /* STEP 2: Registration Form / Success */
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
                    New Account Registration
                  </span>
                </div>
              </div>

              {!registered && (
                <button
                  type="button"
                  onClick={handleChangeRole}
                  className="text-xs text-warm-muted hover:text-sandal-700 flex items-center gap-1 font-medium hover:underline cursor-pointer"
                  title="Change role"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Switch</span>
                </button>
              )}
            </div>

            {registered ? (
              <div className="space-y-5 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-sage-soft text-sage-text flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-display text-lg font-bold text-warm-brown">Account created</h4>
                  <p className="text-sm text-warm-muted leading-relaxed">
                    Your {ROLE_CONFIGS[selectedRole].title} account is ready. Sign in with the email and password
                    you just set.
                  </p>
                </div>
                <Link to="/auth/login">
                  <Button variant="primary" size="lg" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  placeholder="Your full name"
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  placeholder="name@domain.com"
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  placeholder="At least 8 characters"
                  helperText="Must be at least 8 characters."
                />

                {selectedRole === 'hospital' && (
                  <Input
                    label="Facility Name"
                    type="text"
                    required
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    leftIcon={<Building2 className="w-4 h-4" />}
                    placeholder="e.g. Sunrise Women & Children Hospital"
                  />
                )}

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed">
                    {formError}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                  rightIcon={<UserPlus className="w-4 h-4" />}
                  className="mt-2"
                >
                  {isSubmitting
                    ? 'Creating Account...'
                    : `Create ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account`}
                </Button>

                <p className="text-center text-xs text-warm-muted">
                  Already have an account?{' '}
                  <Link to="/auth/login" className="font-semibold text-sandal-700 hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
