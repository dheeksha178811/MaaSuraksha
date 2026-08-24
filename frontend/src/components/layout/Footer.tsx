import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-warm-cream/80 border-t border-sandal-200/60 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-warm-muted">
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-semibold text-warm-brown">
            MaaSuraksha
          </span>
          <span>•</span>
          <span>Maternal & Child Health Program Beneficiary Tracking System</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-sandal-600 transition-colors">
            Home
          </Link>
          <Link to="/auth/login" className="hover:text-sandal-600 transition-colors">
            Portal Access
          </Link>
          <span className="flex items-center gap-1 text-sage-text">
            <ShieldCheck className="w-3.5 h-3.5" /> Fictional Demo / Module 0 Foundation
          </span>
        </div>
      </div>
    </footer>
  );
};
