'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  selectIsAppLoading,
  selectIsInitialLoad,
  selectShouldShowLoading,
  updateLoadingState as updateLoadingStateAction,
} from '@/lib/redux/features/ui';

/**
 * App loading hook - now delegates to Redux.
 * Maintains backward compatibility with existing consumers.
 */
export function useAppLoading() {
  const dispatch = useAppDispatch();

  // Read from Redux
  const isAppLoading = useAppSelector(selectIsAppLoading);
  const isInitialLoad = useAppSelector(selectIsInitialLoad);
  const shouldShowLoading = useAppSelector(selectShouldShowLoading);

  // App loading control - dispatch to Redux
  const updateLoadingState = useCallback(
    (dbLoading: boolean, isThemeInitialized: boolean, authLoading: boolean) => {
      dispatch(
        updateLoadingStateAction({
          dbLoading,
          isThemeInitialized,
          authLoading,
        }),
      );
      return null;
    },
    [dispatch],
  );

  return {
    isAppLoading,
    isInitialLoad,
    updateLoadingState,
    shouldShowLoading,
  };
}
