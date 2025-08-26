'use client';

import { useEffect, useState } from 'react';

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
  const updateLoadingState = (dbLoading: boolean, isThemeInitialized: boolean) => {
    if (!isInitialLoad) {
      // Skip loading screen for navigation (not full page reload)
      setIsAppLoading(false);
      return;
    }

    // For initial loads, check if all resources are ready
    if (!dbLoading && isThemeInitialized) {
      // Add a small delay for smooth UX, but don't block indefinitely
      const timer = setTimeout(() => {
        setIsAppLoading(false);
      }, 800); // Shorter delay to prevent blocking
      
      return timer;
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
