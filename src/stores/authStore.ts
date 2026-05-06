import { create } from 'zustand';
import type { User } from '../types';
import { supabase } from '../utils/supabase';

interface AuthState {
  user: User | null;
  login: (username: string, password: string, keepLoggedIn: boolean) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

let adminPassword = 'rolls2024';

const SESSION_KEY = 'rolls_auth_session';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  login: async (username: string, password: string, keepLoggedIn: boolean) => {
    if (username === 'admin' && password === adminPassword) {
      const user: User = { username: 'admin', authenticated: true };
      set({ user });

      // Save session if "keep me logged in" is checked
      if (keepLoggedIn) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ username, authenticated: true, timestamp: Date.now() }));
      }
      return true;
    }
    return false;
  },

  restoreSession: () => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const session = JSON.parse(saved);
        // Session is valid if saved within last 30 days
        if (Date.now() - session.timestamp < 30 * 24 * 60 * 60 * 1000) {
          set({ user: { username: session.username, authenticated: true } });
        } else {
          // Session expired
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (err) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  },

  logout: () => {
    set({ user: null });
    localStorage.removeItem(SESSION_KEY);
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    if (oldPassword === adminPassword) {
      adminPassword = newPassword;
      const { error } = await supabase.from('settings').update({ admin_password: newPassword }).eq('key', 'admin_password');
      return !error;
    }
    return false;
  },
}));
