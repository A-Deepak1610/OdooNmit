import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'campus_theme';

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') return getSystemTheme();
  return theme;
};

const applyThemeToDOM = (resolved: ResolvedTheme, preference: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // ignore quota/privacy errors
  }
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved;
    }
  } catch {
    // fallback to light
  }
  return 'light';
};

const initialTheme = getInitialTheme();
const initialResolved = resolveTheme(initialTheme);

// Synchronously apply initial theme to DOM immediately on script execution
applyThemeToDOM(initialResolved, initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => {
  // Listen for storage events across tabs/windows
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
          const resolved = resolveTheme(newTheme);
          applyThemeToDOM(resolved, newTheme);
          set({ theme: newTheme, resolvedTheme: resolved });
        }
      }
    });

    // Listen for OS system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const current = get().theme;
      if (current === 'system') {
        const resolved = getSystemTheme();
        applyThemeToDOM(resolved, 'system');
        set({ resolvedTheme: resolved });
      }
    });
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,
    setTheme: (theme) => {
      const resolved = resolveTheme(theme);
      applyThemeToDOM(resolved, theme);
      set({ theme, resolvedTheme: resolved });
    },
    toggleTheme: () => {
      const currentResolved = get().resolvedTheme;
      const nextTheme: Theme = currentResolved === 'dark' ? 'light' : 'dark';
      const resolved = resolveTheme(nextTheme);
      applyThemeToDOM(resolved, nextTheme);
      set({ theme: nextTheme, resolvedTheme: resolved });
    },
  };
});
