'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { IWallet } from '@meshsdk/core';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  hydrateFromSession,
  resolveUserRoles,
  clearAuth,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthAddress,
  selectAuthRoles,
  selectIsAuthLoading,
  selectIsHydrated,
} from '@/lib/redux/features/auth';
import { selectWallet } from '@/lib/redux/features/wallet';

export type User = {
  wallet: IWallet;
  roles: string[];
  address: string;
} | null;

interface UseUserAuthProps {
  wallet: IWallet | null;
  address: string | null;
  isConnected: boolean;
}

/**
 * User auth hook - now delegates to Redux for state management.
 * Maintains backward compatibility with existing consumers.
 */
export function useUserAuth({
  wallet,
  address,
  isConnected,
}: UseUserAuthProps) {
  const dispatch = useAppDispatch();

  // Read from Redux
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const authAddress = useAppSelector(selectAuthAddress);
  const roles = useAppSelector(selectAuthRoles);
  const isLoading = useAppSelector(selectIsAuthLoading);
  const isHydrated = useAppSelector(selectIsHydrated);
  const reduxWallet = useAppSelector(selectWallet);

  // Hydrate from session on mount
  useEffect(() => {
    if (!isHydrated) {
      dispatch(hydrateFromSession());
    }
  }, [dispatch, isHydrated]);

  // Handle wallet connection and session management
  useEffect(() => {
    if (!isHydrated) return;

    if (!isConnected || !wallet || !address) {
      // Only clear if we were previously authenticated
      if (isAuthenticated) {
        dispatch(clearAuth());
      }
      return;
    }

    // If already authenticated with same address, skip
    if (isAuthenticated && authAddress === address) {
      return;
    }

    // Resolve roles for new connection
    dispatch(resolveUserRoles(address));
  }, [address, wallet, isConnected, isHydrated, isAuthenticated, authAddress, dispatch]);

  const logout = useCallback(() => {
    dispatch(clearAuth());
  }, [dispatch]);

  // Construct user object for backward compatibility
  const user: User = useMemo(() => {
    return isAuthenticated && authAddress && (wallet || reduxWallet)
      ? {
          wallet: (wallet || reduxWallet) as IWallet,
          roles,
          address: authAddress,
        }
      : null;
  }, [isAuthenticated, authAddress, wallet, reduxWallet, roles]);

  return {
    user,
    isLoading,
    logout,
    isAuthenticated,
    userAddress: authAddress || undefined,
    userRoles: roles,
    userWallet: wallet || reduxWallet || undefined,
    isAdmin,
  };
}
