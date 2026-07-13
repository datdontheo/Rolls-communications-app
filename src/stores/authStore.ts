import { create } from 'zustand';
import type { User } from '../types';
import { supabase } from '../utils/supabase';

interface AuthState {
  user: User | null;
  login: (username: string, password: string, keepLoggedIn: boolean) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => void;
  loadAdminPassword: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

// Fallback default used only until the stored password is loaded (or if none
// has ever been set). The live value is hydrated from Supabase on startup by
// loadAdminPassword() and updated by changePassword().
const DEFAULT_PASSWORD = 'rolls2024';
let adminPassword = DEFAULT_PASSWORD;

const PASSWORD_ROW_KEY = 'admin_password';
const SESSION_KEY = 'rolls_auth_session';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  // Load the current admin password from Supabase so a password changed in a
  // previous session actually takes effect after reload.
  loadAdminPassword: async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('admin_password')
        .eq('key', PASSWORD_ROW_KEY)
        .single();
      if (!error && data?.adminPassword) {
        adminPassword = data.adminPassword;
      }
    } catch {
      // Keep the default if the lookup fails; login still works offline.
    }
  },

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
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  },

  logout: () => {
    set({ user: null });
    localStorage.removeItem(SESSION_KEY);
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    if (oldPassword !== adminPassword) return false;

    // Upsert the password row so the change persists across reloads. Keyed on
    // the primary key `key`, so this inserts the row the first time and updates
    // it thereafter.
    const { error } = await supabase.from('settings').upsert({
      key: PASSWORD_ROW_KEY,
      adminPassword: newPassword,
    });
    if (error) {
      console.error('Failed to persist password change:', error);
      return false;
    }

    adminPassword = newPassword;
    return true;
  },
}));
