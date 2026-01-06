'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { hydrateTheme, setTheme, setThemeInitialized, Theme } from './uiSlice';
import { selectTheme, selectIsThemeInitialized } from './uiSelectors';

/**
 * Hook that syncs Redux theme state with localStorage and DOM.
 * Should be called once at the app root level.
 */
export function useThemeSync() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const isThemeInitialized = useAppSelector(selectIsThemeInitialized);

  // Hydrate theme from localStorage on mount
  useEffect(() => {
    dispatch(hydrateTheme());
  }, [dispatch]);

  // Sync theme changes to DOM and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // Force reflow to ensure styles are applied
    root.offsetHeight;

    localStorage.setItem('theme', theme);

    if (!isThemeInitialized) {
      dispatch(setThemeInitialized(true));
    }
  }, [theme, isThemeInitialized, dispatch]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const hasExplicitTheme = localStorage.getItem('theme');
      if (!hasExplicitTheme) {
        dispatch(setTheme(e.matches ? 'dark' : 'light'));
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [dispatch]);

  return { theme, isThemeInitialized };
}
