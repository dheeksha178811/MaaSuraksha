import React from 'react';
import { Link } from 'react-router-dom';
import { HeartCrack, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-peach-verySoft border border-sandal-200 flex items-center justify-center text-sandal-600 mb-6 shadow-subtle">
        <HeartCrack className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-sandal-600 mb-2">
        404 Not Found
      </span>

      <h1 className="font-display text-3xl sm:text-5xl font-bold text-warm-brown mb-4">
        Page Not Found
      </h1>

      <p className="text-sm sm:text-base text-warm-muted max-w-md mb-8 leading-relaxed">
        The maternal care page you are looking for might have been moved or does not exist in the current foundation.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Return Home
          </Button>
        </Link>
        <Link to="/mother/dashboard">
          <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Mother Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
