"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/redux/hooks";
import {
  selectWalletState,
  selectAvailableWallets,
  connectWallet as connectWalletThunk,
  autoConnect,
  disconnectWallet as disconnectWalletAction,
  clearError as clearErrorAction,
  refreshWalletList,
  setHasAttemptedAutoConnect,
} from "../lib/redux/features/wallet";
import { WalletState } from "../types/wallet";

// Module-level guard: 30+ components call useWalletManager. Without this,
// every mounted instance races to dispatch refreshWalletList + autoConnect on
// first render, multiplying wallet-discovery and connect calls.
let walletBootstrapAttempted = false;

/**
 * Wallet manager hook - now delegates to Redux.
 * Maintains backward compatibility with existing consumers.
 */
export function useWalletManager(): WalletState & {
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
  refreshWalletList: () => Promise<void>;
} {
  const dispatch = useAppDispatch();

  // Read from Redux
  const walletState = useAppSelector(selectWalletState);
  const availableWallets = useAppSelector(selectAvailableWallets);

  // Connect to wallet - dispatch async thunk
  const connectWallet = useCallback(
    async (walletId: string) => {
      await dispatch(connectWalletThunk({ walletId, availableWallets }));
    },
    [dispatch, availableWallets],
  );

  // Disconnect wallet - dispatch action
  const disconnectWallet = useCallback(() => {
    dispatch(disconnectWalletAction());
  }, [dispatch]);

  // Clear error - dispatch action
  const clearError = useCallback(() => {
    dispatch(clearErrorAction());
  }, [dispatch]);

  // Refresh wallet list - dispatch async thunk
  const refreshWalletListFn = useCallback(async () => {
    await dispatch(refreshWalletList());
  }, [dispatch]);

  // Auto-connection on mount
  useEffect(() => {
    if (walletBootstrapAttempted) return;
    if (walletState.hasAttemptedAutoConnect) return;
    walletBootstrapAttempted = true;

    const attemptAutoConnect = async () => {
      // First refresh wallet list
      const result = await dispatch(refreshWalletList());

      if (refreshWalletList.fulfilled.match(result)) {
        const wallets = result.payload;
        // Attempt auto-connect with the fetched wallets
        await dispatch(autoConnect(wallets));
      } else {
        // Even if refresh fails, mark as attempted
        dispatch(setHasAttemptedAutoConnect(true));
      }
    };

    attemptAutoConnect();
  }, [dispatch, walletState.hasAttemptedAutoConnect]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    clearError,
    refreshWalletList: refreshWalletListFn,
  };
}
