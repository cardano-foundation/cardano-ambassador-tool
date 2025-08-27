'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useThemeManager() {
  // Theme state - Initialize immediately to prevent flash
  const [theme, setThemeState] = useState<Theme>(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved && ['light', 'dark'].includes(saved)) {
        return saved;
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  });
  
  const [isThemeInitialized, setIsThemeInitialized] = useState(false);

  // Apply theme immediately on mount and changes
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme class immediately and synchronously
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Force a reflow to ensure all elements recognize the new theme class
    // before CSS transitions start
    root.offsetHeight;

    // Save to localStorage
    localStorage.setItem('theme', theme);

    // Mark as initialized after first application
    if (!isThemeInitialized) {
      setIsThemeInitialized(true);
    }
  }, [theme, isThemeInitialized]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a theme
      const hasExplicitTheme = localStorage.getItem('theme');
      if (!hasExplicitTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Theme control functions
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
