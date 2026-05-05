import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  checkAuth: () => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  login: (username: string, password: string) => {
    if (username === 'admin' && password === 'rolls2024') {
      const user: User = { username: 'admin', authenticated: true };
      set({ user });
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  },

  logout: () => {
    set({ user: null });
    localStorage.removeItem('user');
  },

  checkAuth: () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        set({ user: JSON.parse(user) });
      } catch {
        set({ user: null });
      }
    }
  },

  changePassword: (oldPassword: string, newPassword: string) => {
    const stored = localStorage.getItem('adminPassword') || 'rolls2024';
    if (oldPassword === stored) {
      localStorage.setItem('adminPassword', newPassword);
      return true;
    }
    return false;
  },
}));
