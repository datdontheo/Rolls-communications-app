import { create } from 'zustand';
import { supabase } from '../utils/supabase';

interface ThemeState {
  isDark: boolean;
  toggle: () => Promise<void>;
  setDark: (isDark: boolean) => Promise<void>;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,

  toggle: async () => {
    set((state) => {
      const newDark = !state.isDark;
      applyTheme(newDark);
      return { isDark: newDark };
    });
    await persistTheme(useThemeStore.getState().isDark);
  },

  setDark: async (isDark: boolean) => {
    set({ isDark });
    applyTheme(isDark);
    await persistTheme(isDark);
  },

  initTheme: async () => {
    try {
      const { data, error } = await supabase.from('settings').select('theme_preference').eq('key', 'theme').single();
      if (!error && data?.theme_preference) {
        const isDark = data.theme_preference === 'dark';
        set({ isDark });
        applyTheme(isDark);
        return;
      }
    } catch (err) {
      console.warn('Failed to load theme preference from Supabase');
    }
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    set({ isDark });
    applyTheme(isDark);
  },
}));

// Upsert so the preference row is created on first save (a plain update would
// match 0 rows and silently do nothing). Swallow errors — theme is non-critical
// and must never surface as an unhandled rejection.
async function persistTheme(isDark: boolean) {
  try {
    await supabase.from('settings').upsert({ key: 'theme', themePreference: isDark ? 'dark' : 'light' });
  } catch (err) {
    console.warn('Failed to persist theme preference:', err);
  }
}

function applyTheme(isDark: boolean) {
  const html = document.documentElement;
  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}
