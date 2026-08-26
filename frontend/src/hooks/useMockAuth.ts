import { useState, useEffect } from 'react';
import { UserRole, BaseUser } from '@/types';
import { mockMother, mockDoctor, mockHospital } from '@/data/mockData';
import { loginWithBackend, fetchCurrentUser, AuthApiError, RealAuthUser, TOKEN_STORAGE_KEY } from '@/services/authApi';

const MOCK_USERS_BY_ROLE: Record<UserRole, BaseUser> = {
  mother: mockMother,
  doctor: mockDoctor,
  hospital: mockHospital,
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. Suniti Sharma (Director)',
    email: 'admin.director@health.gov.in',
    role: 'admin',
    createdAt: '2023-11-01',
  },
};

// Tab-scoped, same as TOKEN_STORAGE_KEY (see authApi.ts) — the currently
// signed-in role is auth-adjacent session state, so it must stay isolated
// per tab too, not just the token itself, or a stale value here would still
// leak the wrong role across tabs even after the token was isolated.
const ROLE_STORAGE_KEY = 'maasuraksha_mock_role';

// Merges the real backend identity fields onto the existing per-role mock
// object, so every other field that non-identity pages/components still
// read directly off mockMother/mockDoctor/mockHospital (age, bloodGroup,
// specialization, ...) is untouched — only id/name/email/role/phone/
// avatarUrl/createdAt come from the real account now.
function toBaseUser(real: RealAuthUser): BaseUser {
  const mockFallback = MOCK_USERS_BY_ROLE[real.role] ?? mockMother;
  return {
    ...mockFallback,
    id: real.id,
    name: real.name,
    email: real.email,
    role: real.role,
    phone: real.phone ?? undefined,
    avatarUrl: real.avatarUrl ?? undefined,
    createdAt: real.createdAt,
  };
}

export function useMockAuth() {
  const [role, setRole] = useState<UserRole>(() => {
    return (sessionStorage.getItem(ROLE_STORAGE_KEY) as UserRole) || 'mother';
  });

  const [user, setUser] = useState<BaseUser>(() => {
    return MOCK_USERS_BY_ROLE[role] || mockMother;
  });

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loginAsRole = (newRole: UserRole) => {
    setRole(newRole);
    setUser(MOCK_USERS_BY_ROLE[newRole]);
    sessionStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  // Real backend login (Phase 6 Part 3). On success, persists the real JWT
  // and identity and returns the real user so the caller can navigate
  // without waiting on a re-render. On failure, the original error
  // (AuthNetworkError for an unreachable backend, AuthApiError otherwise)
  // is rethrown as-is so the caller can decide whether a mock fallback is
  // appropriate — this hook does not fall back on its own.
  const loginWithCredentials = async (email: string, password: string): Promise<RealAuthUser> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { user: realUser, token } = await loginWithBackend(email, password);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      sessionStorage.setItem(ROLE_STORAGE_KEY, realUser.role);
      setRole(realUser.role);
      setUser(toBaseUser(realUser));
      return realUser;
    } catch (error) {
      const message = error instanceof AuthApiError ? error.message : 'Unable to sign in. Please try again.';
      setAuthError(message);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  // On mount, restore a real session if a token was persisted from a
  // previous real login — mirrors the existing role-persistence behavior,
  // now backed by a real account. An invalid/expired token is silently
  // cleared, leaving the existing mock-role state in place.
  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;
    fetchCurrentUser(token)
      .then((realUser) => {
        setRole(realUser.role);
        setUser(toBaseUser(realUser));
        sessionStorage.setItem(ROLE_STORAGE_KEY, realUser.role);
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    role,
    user,
    loginAsRole,
    loginWithCredentials,
    isAuthenticating,
    authError,
    logout,
    isAuthenticated: true,
  };
}
