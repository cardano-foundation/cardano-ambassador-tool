import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  fetchTreasuryBalance as fetchTreasuryBalanceThunk,
  setTotalPayouts,
} from '@/lib/redux/features/treasury';
import {
  selectTreasuryBalance,
  selectTotalPayouts,
  selectIsTreasuryLoading,
} from '@/lib/redux/features/treasury';
import useProposals from './useProposals';

/**
 * Treasury balance hook - now delegates to Redux for state management.
 * Maintains backward compatibility with existing consumers.
 */
export function useTreasuryBalance() {
  const dispatch = useAppDispatch();
  const { allProposals } = useProposals();

  // Read from Redux
  const treasuryBalance = useAppSelector(selectTreasuryBalance);
  const totalPayouts = useAppSelector(selectTotalPayouts);
  const isTreasuryLoading = useAppSelector(selectIsTreasuryLoading);

  // Calculate and update total payouts when proposals change
  // Note: fundsRequested is in ADA format (locale string like "1,234.56")
  // We need to convert back to lovelace for accurate BigInt summation
  useEffect(() => {
    const payouts = allProposals.reduce((sum, proposal) => {
      const adaString = proposal.fundsRequested;
      if (!adaString) return sum;

      // Remove locale formatting (commas) and parse as float
      const adaValue = parseFloat(adaString.replace(/,/g, ''));
      if (isNaN(adaValue)) return sum;

      // Convert ADA to lovelace (multiply by 1,000,000)
      const lovelace = BigInt(Math.round(adaValue * 1_000_000));
      return sum + lovelace;
    }, BigInt(0));

    dispatch(setTotalPayouts(payouts.toString()));
  }, [allProposals, dispatch]);

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
