import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ROLE_CONFIGS } from '@/data/mockData';
import { Button } from '@/components/ui/Button';
import { AuthNetworkError, RealAuthUser, TOKEN_STORAGE_KEY, fetchCurrentUser } from '@/services/authApi';
import { ROLE_STORAGE_KEY } from '@/hooks/useMockAuth';
import { UserRole } from '@/types';

type Session =
  | { status: 'checking' }
  | { status: 'anonymous' }
  | { status: 'unreachable' }
  | { status: 'authenticated'; user: RealAuthUser };

// Each portal lives under its own path prefix; the prefix decides which role
// may enter. This is a UX guard only — every API call is independently
// authenticated and role-checked by the backend.
const ROLE_BY_PREFIX: Record<string, UserRole> = {
  mother: 'mother',
  doctor: 'doctor',
  hospital: 'hospital',
  admin: 'admin',
};

/**
 * Layout-route guard for the signed-in app shell. The session is only trusted
 * once the backend has accepted the stored token (GET /auth/me); a stored
 * token alone, or a stored role, grants nothing.
 */
export const RequireAuth: React.FC = () => {
  const location = useLocation();
  const [session, setSession] = useState<Session>(() =>
    sessionStorage.getItem(TOKEN_STORAGE_KEY) ? { status: 'checking' } : { status: 'anonymous' }
  );

  const verify = useCallback(() => {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setSession({ status: 'anonymous' });
      return;
    }
    setSession({ status: 'checking' });
    fetchCurrentUser(token)
      .then((user) => {
        sessionStorage.setItem(ROLE_STORAGE_KEY, user.role);
        setSession({ status: 'authenticated', user });
      })
      .catch((error) => {
        if (error instanceof AuthNetworkError) {
          // Can't tell whether the token is valid; deny access but keep it.
          setSession({ status: 'unreachable' });
          return;
        }
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(ROLE_STORAGE_KEY);
        setSession({ status: 'anonymous' });
      });
  }, []);

  useEffect(verify, [verify]);

  if (session.status === 'checking') {
    return (
      <div className="min-h-screen bg-warm-ivory flex items-center justify-center gap-2.5 text-sm text-warm-muted">
        <span className="w-4 h-4 rounded-full border-2 border-sandal-200 border-t-sandal-600 animate-spin" />
        Checking your session…
      </div>
    );
  }

  if (session.status === 'unreachable') {
    return (
      <div className="min-h-screen bg-warm-ivory flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-sandal-400" />
        <p className="text-warm-brown font-semibold">Unable to reach the MaaSuraksha server.</p>
        <p className="text-sm text-warm-muted">We couldn't confirm your session. Please check the connection and try again.</p>
        <Button variant="outline" onClick={verify}>Retry</Button>
      </div>
    );
  }

  if (session.status === 'anonymous') {
    // `from` is read back through getSafeReturnPath on the login page, so only
    // a plain in-app path can ever be followed after sign-in.
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  const requiredRole = ROLE_BY_PREFIX[location.pathname.split('/')[1]];
  if (requiredRole && requiredRole !== session.user.role) {
    return <Navigate to={ROLE_CONFIGS[session.user.role].defaultPath} replace />;
  }

  return <Outlet />;
};
