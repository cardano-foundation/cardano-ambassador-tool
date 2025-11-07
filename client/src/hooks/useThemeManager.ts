'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useThemeManager() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved && ['light', 'dark'].includes(saved)) {
        return saved;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });

  const [isThemeInitialized, setIsThemeInitialized] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.offsetHeight;

    localStorage.setItem('theme', theme);

    if (!isThemeInitialized) {
      setIsThemeInitialized(true);
    }
  }, [theme, isThemeInitialized]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const hasExplicitTheme = localStorage.getItem('theme');
      if (!hasExplicitTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Theme control 
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isThemeInitialized,
    // Helper computed values
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}
