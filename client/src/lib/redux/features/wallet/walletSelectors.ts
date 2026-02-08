import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

// ---------- Base Selectors ----------
export const selectWalletState = (state: RootState) => state.wallet;

export const selectIsConnected = (state: RootState) => state.wallet.isConnected;
export const selectIsConnecting = (state: RootState) =>
  state.wallet.isConnecting;
export const selectHasAttemptedAutoConnect = (state: RootState) =>
  state.wallet.hasAttemptedAutoConnect;
export const selectSelectedWalletId = (state: RootState) =>
  state.wallet.selectedWalletId;
export const selectWalletName = (state: RootState) => state.wallet.walletName;
export const selectWalletAddress = (state: RootState) => state.wallet.address;
export const selectWallet = (state: RootState) => state.wallet.wallet;
export const selectAvailableWallets = (state: RootState) =>
  state.wallet.availableWallets;
export const selectWalletError = (state: RootState) => state.wallet.error;
export const selectIsNetworkValid = (state: RootState) =>
  state.wallet.isNetworkValid;

// ---------- Memoized Selectors ----------

/**
 * Check if wallet is ready (auto-connect attempted and not connecting)
 */
export const selectIsWalletReady = createSelector(
  [selectHasAttemptedAutoConnect, selectIsConnecting],
  (hasAttemptedAutoConnect, isConnecting) =>
    hasAttemptedAutoConnect && !isConnecting,
);

/**
 * Check if wallet has an error
 */
export const selectHasWalletError = createSelector(
  [selectWalletError],
  (error) => error !== null,
);

/**
 * Get shortened wallet address for display
 */
export const selectShortenedAddress = createSelector(
  [selectWalletAddress],
  (address) => {
    if (!address) return null;
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  },
);

/**
 * Get current connected wallet info
 */
export const selectConnectedWalletInfo = createSelector(
  [selectAvailableWallets, selectSelectedWalletId],
  (availableWallets, selectedWalletId) => {
    if (!selectedWalletId) return null;
    return availableWallets.find((w) => w.id === selectedWalletId) || null;
  },
);

/**
 * Full wallet context value for backward compatibility
 */
export const selectWalletContextValue = createSelector(
  [selectWalletState],
  (walletState) => walletState,
);
