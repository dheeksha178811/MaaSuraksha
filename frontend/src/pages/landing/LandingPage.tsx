import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Baby,
  Stethoscope,
  Building2,
  Syringe,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-10 sm:py-16">
      {/* 1. HERO SECTION */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-peach-verySoft border border-sandal-200 text-xs font-semibold uppercase tracking-wider text-sandal-800 mb-6 shadow-subtle animate-in fade-in duration-500">
          <Sparkles className="w-3.5 h-3.5 text-sandal-600" />
          <span>Maternal & Child Health Program Companion</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-warm-brown tracking-tight leading-[1.12] mb-6">
          Protecting Every Mother. <br />
          <span className="text-sandal-600 italic font-serif">Nurturing Every Child.</span>
        </h1>

        <p className="text-base sm:text-xl text-warm-muted max-w-2xl mx-auto leading-relaxed mb-10">
          A connected healthcare companion for mothers, children, doctors, and hospitals.
          Bringing warmth, proactive immunization schedules, and trusted maternal coordination into one peaceful space.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth/login">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-base px-8 py-4 shadow-warm-md hover:shadow-warm-lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base px-8 py-4"
            >
              Role Access & Login
            </Button>
          </Link>
        </div>

        {/* Hero Visual Card Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-warm-ivory via-transparent to-transparent z-10 pointer-events-none h-full" />
          <div className="bg-white/90 rounded-3xl p-6 sm:p-10 border border-sandal-200/70 shadow-warm-lg max-w-4xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-sandal-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-peach-soft flex items-center justify-center text-sandal-700 shadow-subtle">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-sandal-600">
                    Beneficiary Care Space
                  </span>
                  <h3 className="font-display text-2xl font-bold text-warm-brown">
                    Ananya & Baby Vihaan (5 Weeks)
                  </h3>
                </div>
              </div>
              <Badge variant="sage" size="md">
                Active Antenatal & Postnatal Track
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-2xl bg-warm-cream/60 border border-sandal-100">
                <div className="flex items-center gap-2 text-sandal-700 mb-1">
                  <Syringe className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Next Vaccine</span>
                </div>
                <p className="font-display text-lg font-semibold text-warm-brown">
                  Pentavalent-1 & OPV-1
                </p>
                <span className="text-xs text-sandal-600 font-medium">Due in 7 days (6 Weeks)</span>
              </div>

              <div className="p-4 rounded-2xl bg-warm-cream/60 border border-sandal-100">
                <div className="flex items-center gap-2 text-sandal-700 mb-1">
                  <CalendarCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Doctor Checkup</span>
                </div>
                <p className="font-display text-lg font-semibold text-warm-brown">
                  Dr. Priya Menon
                </p>
                <span className="text-xs text-warm-muted">Sunrise Women & Children Hospital</span>
              </div>

              <div className="p-4 rounded-2xl bg-warm-cream/60 border border-sandal-100">
                <div className="flex items-center gap-2 text-sandal-700 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Maternal Vitals</span>
                </div>
                <p className="font-display text-lg font-semibold text-warm-brown">
                  Healthy Recovery
                </p>
                <span className="text-xs text-sage-text font-medium">BP 118/76 • Vitals Stable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY MAASURAKSHA SECTION */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-wider uppercase text-sandal-600 block mb-2">
            Why MaaSuraksha
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-warm-brown">
            Designed for Peace of Mind Through Every Stage of Motherhood
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white/90">
            <div className="w-12 h-12 rounded-2xl bg-peach-verySoft text-sandal-600 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold text-warm-brown mb-2">
              Calm & Warm Design
            </h3>
            <p className="text-sm text-warm-muted leading-relaxed">
              No cold clinical interfaces. A soothing terracotta and peach space crafted specifically to reassure mothers and reduce prenatal anxiety.
            </p>
          </Card>

          <Card className="p-6 bg-white/90">
            <div className="w-12 h-12 rounded-2xl bg-sage-soft text-sage-text flex items-center justify-center mb-4">
              <Syringe className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold text-warm-brown mb-2">
              Zero Missed Immunizations
            </h3>
            <p className="text-sm text-warm-muted leading-relaxed">
              Clear automated timeline reminders for national immunization schedules from birth through early childhood development.
            </p>
          </Card>

          <Card className="p-6 bg-white/90">
            <div className="w-12 h-12 rounded-2xl bg-peach-soft text-sandal-700 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold text-warm-brown mb-2">
              Unified Care Ecosystem
            </h3>
            <p className="text-sm text-warm-muted leading-relaxed">
              Seamlessly connect gynecologists, pediatricians, hospital wards, and community health officers under one synchronized umbrella.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. FOR MOTHERS SECTION */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="bg-warm-cream/70 rounded-3xl p-8 sm:p-12 border border-sandal-200/80">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-sandal-200 text-xs font-semibold text-sandal-800">
                <Baby className="w-3.5 h-3.5 text-sandal-600" />
                <span>Empowering Mothers</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-warm-brown leading-tight">
                Your Personal Maternal Health Sanctuary
              </h2>
              <p className="text-sm sm:text-base text-warm-muted leading-relaxed">
                From the first trimester ultrasound to post-delivery infant care, keep every medical scan, vaccine milestone, and doctor consultation structured and stress-free.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  'Personalized week-by-week pregnancy & newborn tracking',
                  'One-tap access to your doctor notes and hospital discharge records',
                  'Curated nutrition guidance tailored for lactation and recovery',
                  'Direct visibility of eligible government maternity benefit schemes',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-warm-brown">
                    <CheckCircle2 className="w-4 h-4 text-sage-text shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-sandal-200/70 shadow-warm-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sandal-100">
                <span className="font-display font-semibold text-warm-brown">Maternal Wellness Highlights</span>
                <Badge variant="sage">Postpartum Week 5</Badge>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-warm-ivory border border-sandal-100">
                  <span className="text-xs font-semibold text-sandal-700 block">Hydration & Rest</span>
                  <p className="text-xs text-warm-muted mt-0.5">Maintain 3L daily water intake and rest during infant sleep cycles.</p>
                </div>
                <div className="p-3 rounded-xl bg-warm-ivory border border-sandal-100">
                  <span className="text-xs font-semibold text-sandal-700 block">6-Week Pediatric Screening</span>
                  <p className="text-xs text-warm-muted mt-0.5">Physical evaluation and growth check with Dr. Priya Menon.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOR DOCTORS & HOSPITALS SECTION */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-wider uppercase text-sandal-600 block mb-2">
            Clinical Care Coordination
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-warm-brown">
            Precision Tools for Gynecologists & Hospitals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 bg-white border border-sandal-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-peach-verySoft text-sandal-700 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-display text-2xl font-bold text-warm-brown">
              For Gynecologists & Obstetricians
            </h3>
            <p className="text-sm text-warm-muted leading-relaxed">
              Identify high-risk pregnancies early with structured clinical histories, track growth centiles, and coordinate follow-up schedules without paper friction.
            </p>
            <div className="pt-2 text-xs text-sandal-700 font-semibold flex items-center gap-1">
              <span>Explore Doctor Portal preview</span>
              <span>→</span>
            </div>
          </Card>

          <Card className="p-8 bg-white border border-sandal-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-peach-soft text-sandal-800 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-2xl font-bold text-warm-brown">
              For Hospitals & Maternity Centers
            </h3>
            <p className="text-sm text-warm-muted leading-relaxed">
              Manage institutional delivery registrations, neonatal ICU bed status, vaccine batch stock, and district healthcare compliance seamlessly.
            </p>
            <div className="pt-2 text-xs text-sandal-700 font-semibold flex items-center gap-1">
              <span>Explore Hospital Console preview</span>
              <span>→</span>
            </div>
          </Card>
        </div>
      </section>

      {/* 5. IMMUNIZATION & REMINDERS SECTION */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="bg-warm-cream/50 rounded-3xl p-8 sm:p-12 border border-sandal-200/70">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs font-bold tracking-wider uppercase text-sandal-600 block mb-2">
              National Schedule Tracking
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-warm-brown">
              Comprehensive Immunization & Milestone Timeline
            </h2>
            <p className="text-sm sm:text-base text-warm-muted mt-3">
              Automated reminders calculated from the child's birth date ensure no essential vaccines are missed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-sandal-100 shadow-subtle">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sage-text uppercase">Completed</span>
                <span className="text-xs font-semibold text-warm-muted">At Birth</span>
              </div>
              <h4 className="font-display text-lg font-bold text-warm-brown">BCG, OPV-0, Hep B-1</h4>
              <p className="text-xs text-warm-muted mt-1">Administered during hospital discharge.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-sandal-300 shadow-warm-sm">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="sandal" size="sm">Due Soon</Badge>
                <span className="text-xs font-semibold text-sandal-700">6 Weeks</span>
              </div>
              <h4 className="font-display text-lg font-bold text-warm-brown">Pentavalent-1 & OPV-1</h4>
              <p className="text-xs text-warm-muted mt-1">DTP, HepB, Hib, Rotavirus & PCV primary dose.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-sandal-100 shadow-subtle">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-warm-muted uppercase">Upcoming</span>
                <span className="text-xs font-semibold text-warm-muted">10 Weeks</span>
              </div>
              <h4 className="font-display text-lg font-bold text-warm-brown">Pentavalent-2 & OPV-2</h4>
              <p className="text-xs text-warm-muted mt-1">Scheduled for subsequent milestone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONNECTED CARE SECTION */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto text-center">
        <div className="max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-wider uppercase text-sandal-600 block mb-2">
            Connected Care
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-warm-brown">
            Four Connected Stakeholders, One Goal
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-sandal-100 shadow-subtle flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-peach-verySoft text-sandal-600 flex items-center justify-center mb-3">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="font-display text-lg font-bold text-warm-brown">Mothers</h4>
            <p className="text-xs text-warm-muted mt-1">Beneficiary Portal</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-sandal-100 shadow-subtle flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-peach-soft text-sandal-700 flex items-center justify-center mb-3">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h4 className="font-display text-lg font-bold text-warm-brown">Doctors</h4>
            <p className="text-xs text-warm-muted mt-1">Clinical Oversight</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-sandal-100 shadow-subtle flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-sage-soft text-sage-text flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="font-display text-lg font-bold text-warm-brown">Hospitals</h4>
            <p className="text-xs text-warm-muted mt-1">Facility Operations</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-sandal-100 shadow-subtle flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-warm-sand text-warm-brown flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-display text-lg font-bold text-warm-brown">Administrators</h4>
            <p className="text-xs text-warm-muted mt-1">Program Analytics</p>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION SECTION */}
      <section className="px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto text-center">
        <div className="bg-sandal-500 rounded-3xl p-10 sm:p-14 text-white shadow-warm-lg space-y-6 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
              Begin Your MaaSuraksha Care Journey Today
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Step into a serene, dedicated maternal health companion built with safety, warmth, and reliable healthcare coordination.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto bg-white text-sandal-900 hover:bg-warm-cream border-none font-semibold px-8 py-3.5 shadow-subtle"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Enter Portal Access
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
