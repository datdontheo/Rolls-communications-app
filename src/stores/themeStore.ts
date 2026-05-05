import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (isDark: boolean) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,

  toggle: () => {
    set((state) => {
      const newDark = !state.isDark;
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      applyTheme(newDark);
      return { isDark: newDark };
    });
  },

  setDark: (isDark: boolean) => {
    set({ isDark });
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme(isDark);
  },

  initTheme: () => {
    const saved = localStorage.getItem('theme');
    const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
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
