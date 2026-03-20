"use client";

import { useAppDispatch } from "../lib/redux/hooks";
import { updateLoadingState } from "../lib/redux/features/ui";
import { useDatabase } from "../hooks/useDatabase";
import { useThemeManager } from "../hooks/useThemeManager";
import { useUserAuth } from "../hooks/useUserAuth";
import { useWalletManager } from "../hooks/useWalletManager";
import { useEffect } from "react";

/**
 * Component responsible for initializing app global state.
 * Uses Redux hooks to coordinate:
 * - Theme initialization
 * - Wallet connection (auto-connect)
 * - User authentication (hydration)
 * - Database initialization (worker sync)
 * - Global loading state
 */
export function AppInitializer() {
  // Theme initialization
  const { isThemeInitialized } = useThemeManager();

  // Wallet and Auth initialization
  // We call useWalletManager here to trigger auto-connect and get wallet state
  const { wallet, address, isConnected } = useWalletManager();

  // We call useUserAuth here to trigger session hydration and role resolution
  const { isLoading: authLoading } = useUserAuth({
    wallet,
    address,
    isConnected,
  });

  // Database initialization
  // We call useDatabase here to trigger worker initialization and sync
  const { dbLoading } = useDatabase();

  // Loading state coordination
  const dispatch = useAppDispatch();
  // We do NOT subscribe to isAppLoading here to avoid render loops when we update it

  useEffect(() => {
    dispatch(
      updateLoadingState({
        dbLoading,
        isThemeInitialized,
        authLoading,
      }),
    );
  }, [dbLoading, isThemeInitialized, authLoading, dispatch]);

  return null;
}
