'use client';

import { useState } from 'react';

export function useAppLoading() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isInitialLoad] = useState(() => {
    // Only show initial loading on full page reload, not on navigation
    if (typeof window !== 'undefined') {
      const timing = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      return timing?.type === 'navigate' || timing?.type === 'reload';
    }
    return true;
  });

  // App loading control - depends on external loading states
  const updateLoadingState = (
    dbLoading: boolean,
    isThemeInitialized: boolean,
    authLoading: boolean,
  ) => {
    if (!isInitialLoad) {
      // Skip loading screen for navigation
      setIsAppLoading(false);
      return;
    }

    // check if all resources are ready
    if (!dbLoading && isThemeInitialized && !authLoading) {
      setIsAppLoading(false);
      return null;
    }

    return null;
  };

  return {
    isAppLoading,
    isInitialLoad,
    updateLoadingState,
    // Helper values
    shouldShowLoading: isAppLoading && isInitialLoad,
  };
}
