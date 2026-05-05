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
    const state = useThemeStore.getState();
    await supabase.from('settings').update({ theme_preference: state.isDark ? 'dark' : 'light' }).eq('key', 'theme');
  },

  setDark: async (isDark: boolean) => {
    set({ isDark });
    applyTheme(isDark);
    await supabase.from('settings').update({ theme_preference: isDark ? 'dark' : 'light' }).eq('key', 'theme');
  },

  initTheme: async () => {
    const { data, error } = await supabase.from('settings').select('theme_preference').eq('key', 'theme').single();
    let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!error && data?.theme_preference) {
      isDark = data.theme_preference === 'dark';
    }
    set({ isDark });
    applyTheme(isDark);
  },
}));

function applyTheme(isDark: boolean) {
  const html = document.documentElement;
  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}
