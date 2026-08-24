import { useState, useEffect } from 'react';
import { UserRole, BaseUser } from '@/types';
import { mockMother, mockDoctor, mockHospital } from '@/data/mockData';

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

export function useMockAuth() {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('maasuraksha_mock_role') as UserRole) || 'mother';
  });

  const [user, setUser] = useState<BaseUser>(() => {
    return MOCK_USERS_BY_ROLE[role] || mockMother;
  });

  const loginAsRole = (newRole: UserRole) => {
    setRole(newRole);
    setUser(MOCK_USERS_BY_ROLE[newRole]);
    localStorage.setItem('maasuraksha_mock_role', newRole);
  };

  const logout = () => {
    localStorage.removeItem('maasuraksha_mock_role');
  };

  useEffect(() => {
    setUser(MOCK_USERS_BY_ROLE[role] || mockMother);
  }, [role]);

  return {
    role,
    user,
    loginAsRole,
    logout,
    isAuthenticated: true,
  };
}
