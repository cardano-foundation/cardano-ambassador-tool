"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  selectTheme,
  selectIsThemeInitialized,
  selectIsDark,
  selectIsLight,
  setTheme as setThemeAction,
  toggleTheme as toggleThemeAction,
} from "@/lib/redux/features/ui";
import { useThemeSync } from "@/lib/redux/features/ui/useThemeSync";

// Re-export type for backward compatibility
export type Theme = "light" | "dark";

/**
 * Theme manager hook - now delegates to Redux.
 * Maintains backward compatibility with existing consumers.
 */
export function useThemeManager() {
  const dispatch = useAppDispatch();

  // Initialize theme sync (hydration, localStorage, DOM updates)
  useThemeSync();

  // Read from Redux
  const theme = useAppSelector(selectTheme);
  const isThemeInitialized = useAppSelector(selectIsThemeInitialized);
  const isDark = useAppSelector(selectIsDark);
  const isLight = useAppSelector(selectIsLight);

  // Theme control - dispatch to Redux
  const setTheme = (newTheme: Theme) => {
    dispatch(setThemeAction(newTheme));
  };

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isThemeInitialized,
    isDark,
    isLight,
  };
}
