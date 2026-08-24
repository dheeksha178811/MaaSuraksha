import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HeartHandshake, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/layout/Footer';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/auth/login';

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col selection:bg-peach-soft selection:text-warm-brown">
      {/* Public Header */}
      <header className="sticky top-0 z-30 bg-warm-ivory/85 backdrop-blur-md border-b border-sandal-200/50 px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-sandal-500 text-white flex items-center justify-center shadow-warm-sm group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold tracking-tight text-warm-brown">
              MaaSuraksha
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-sandal-600">
              Maternal & Child Health Care
            </span>
          </div>
        </Link>

        {/* Public Nav Actions */}
        <div className="flex items-center gap-3">
          {!isLoginPage ? (
            <>
              <Link to="/auth/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="md">
                  Login
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="primary" size="md" rightIcon={<LogIn className="w-4 h-4" />}>
                  Portal Access
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/">
              <Button variant="outline" size="sm">
                ← Back to Home
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
