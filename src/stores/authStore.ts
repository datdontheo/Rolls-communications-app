import { create } from 'zustand';
import type { User } from '../types';
import { supabase } from '../utils/supabase';

interface AuthState {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

let adminPassword = 'rolls2024';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  login: async (username: string, password: string) => {
    if (username === 'admin' && password === adminPassword) {
      const user: User = { username: 'admin', authenticated: true };
      set({ user });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ user: null });
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
