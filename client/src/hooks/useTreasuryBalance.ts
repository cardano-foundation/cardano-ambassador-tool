import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchTreasuryBalance as fetchTreasuryBalanceThunk } from '@/lib/redux/features/treasury';
import {
  selectTreasuryBalance,
  selectIsTreasuryLoading,
} from '@/lib/redux/features/treasury';
import { selectCalculatedTotalPayouts } from '@/lib/redux/features/data/dataSelectors';

/**
 * Treasury balance hook - now delegates to Redux for state management.
 * Maintains backward compatibility with existing consumers.
 */
export function useTreasuryBalance() {
  const dispatch = useAppDispatch();

  // Read from Redux
  const treasuryBalance = useAppSelector(selectTreasuryBalance);
  // Derived total payouts from data slice
  const totalPayouts = useAppSelector(selectCalculatedTotalPayouts);
  const isTreasuryLoading = useAppSelector(selectIsTreasuryLoading);

  // Fetch treasury balance on mount
  useEffect(() => {
    dispatch(fetchTreasuryBalanceThunk());
  }, [dispatch]);

  // Listen for global refresh events
  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail?.refreshTreasury) {
        dispatch(fetchTreasuryBalanceThunk());
      }
    };

    window.addEventListener('app:refresh' as any, handleRefresh);

    return () => {
      window.removeEventListener('app:refresh' as any, handleRefresh);
    };
  }, [dispatch]);

  const refreshTreasuryBalance = useCallback(async () => {
    await dispatch(fetchTreasuryBalanceThunk());
  }, [dispatch]);

  return {
    treasuryBalance,
    isTreasuryLoading,
    totalPayouts,
    refreshTreasuryBalance,
  };
}
