export type UserRole = 'mother' | 'doctor' | 'hospital' | 'admin';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: BaseUser | null;
  role: UserRole;
}
