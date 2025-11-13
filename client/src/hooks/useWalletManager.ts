import { WalletState } from '@/types/wallet';
import {
  clearWalletSelection,
  connectToWallet,
  getAvailableWallets,
  getSavedWalletSelection,
  getWalletAddress,
  saveWalletSelection,
  validateNetwork,
} from '@/utils/wallet';
import { useCallback, useEffect, useState } from 'react';

export function useWalletManager(): WalletState & {
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
  refreshWalletList: () => Promise<void>;
} {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    hasAttemptedAutoConnect: false,
    selectedWalletId: null,
    walletName: null,
    address: null,
    wallet: null,
    availableWallets: [],
    error: null,
    isNetworkValid: true,
  });

  // Discover available wallets
  const refreshWalletList = useCallback(async () => {
    try {
      const wallets = await getAvailableWallets();
      setState((prev) => ({ ...prev, availableWallets: wallets }));
    } catch (error) {
      setState((prev) => ({ ...prev, error: 'Failed to discover wallets' }));
    }
  }, []);

  // Connect to wallet
  const connectWallet = useCallback(
    async (walletId: string) => {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));

      try {
        const wallet = await connectToWallet(walletId);
        const address = await getWalletAddress(wallet);
        const isNetworkValid = await validateNetwork(wallet);

        const selectedWallet = state.availableWallets.find(
          (w) => w.id === walletId,
        );

        if (!isNetworkValid) {
          const walletNetworkId = await wallet.getNetworkId();
          const expectedNetwork = await import('@/config/cardano').then((m) =>
            m.getCurrentNetworkConfig(),
          );
          const networkNames = await import('@/config/cardano').then(
            (m) => m.NETWORK_NAMES,
          );

          const walletNetworkName = networkNames[walletNetworkId] || 'Unknown';
          const expectedNetworkName = expectedNetwork.name;

          setState((prev) => ({
            ...prev,
            isConnecting: false,
            error: `Network mismatch! Your wallet is connected to ${walletNetworkName}, but this app requires ${expectedNetworkName}. Please switch your wallet network.`,
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          selectedWalletId: walletId,
          walletName: selectedWallet?.name || null,
          address,
          wallet,
          isNetworkValid: true,
        }));

        saveWalletSelection(walletId);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: error instanceof Error ? error.message : 'Connection failed',
        }));
      }
    },
    [state.availableWallets],
  );

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
      selectedWalletId: null,
      walletName: null,
      address: null,
      wallet: null,
      error: null,
    }));
    clearWalletSelection();
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Auto-connection on mount
  useEffect(() => {
    const attemptAutoConnect = async () => {
      await refreshWalletList();

      const savedWalletId = getSavedWalletSelection();
      if (savedWalletId && !state.hasAttemptedAutoConnect) {
        setState((prev) => ({ ...prev, isConnecting: true }));

        try {
          const wallet = await connectToWallet(savedWalletId);
          const address = await getWalletAddress(wallet);
          const isNetworkValid = await validateNetwork(wallet);

          if (!isNetworkValid) {
            // Get detailed network information for error message
            const walletNetworkId = await wallet.getNetworkId();
            const expectedNetwork = await import('@/config/cardano').then((m) =>
              m.getCurrentNetworkConfig(),
            );
            const networkNames = await import('@/config/cardano').then(
              (m) => m.NETWORK_NAMES,
            );

            const walletNetworkName =
              networkNames[walletNetworkId] || 'Unknown';
            const expectedNetworkName = expectedNetwork.name;

            setState((prev) => ({
              ...prev,
              isConnecting: false,
              error: `Auto-connect failed: Wallet is on ${walletNetworkName} but app requires ${expectedNetworkName}.`,
            }));
            clearWalletSelection();
            return;
          }

          setState((prev) => {
            const selectedWallet = prev.availableWallets.find(
              (w) => w.id === savedWalletId,
            );
            return {
              ...prev,
              isConnected: true,
              isConnecting: false,
              selectedWalletId: savedWalletId,
              walletName: selectedWallet?.name || null,
              address,
              wallet,
              isNetworkValid: true,
            };
          });

          saveWalletSelection(savedWalletId);
        } catch (error) {
          setState((prev) => ({
            ...prev,
            isConnecting: false,
            error:
              error instanceof Error ? error.message : 'Auto-connection failed',
          }));
        }
      }

      setState((prev) => ({ ...prev, hasAttemptedAutoConnect: true }));
    };

    attemptAutoConnect();
  }, []);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    clearError,
    refreshWalletList,
  };
}
