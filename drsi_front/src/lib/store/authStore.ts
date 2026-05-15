import { create } from 'zustand';

interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  applicationStatus: string | null;

  setAuth: (token: string, user: AuthUser) => void;
  setApplicationStatus: (status: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => {
  // Hydrate from localStorage on init
  const savedToken = localStorage.getItem('auth_token');
  const savedUser = localStorage.getItem('auth_user');

  return {
    token: savedToken,
    user: savedUser ? JSON.parse(savedUser) : null,
    isAuthenticated: !!savedToken,
    applicationStatus: null,

    setAuth: (token, user) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },

    setApplicationStatus: (status) => set({ applicationStatus: status }),

    clearAuth: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ token: null, user: null, isAuthenticated: false, applicationStatus: null });
    },
  };
});
