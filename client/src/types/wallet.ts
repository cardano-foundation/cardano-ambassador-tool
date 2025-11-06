import type { IWallet, Wallet } from '@meshsdk/core';

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  hasAttemptedAutoConnect: boolean;
  selectedWalletId: string | null;
  walletName: string | null;
  address: string | null;
  wallet: IWallet | null;
  availableWallets: Wallet[];
  error: string | null;
  isNetworkValid: boolean;
}

export interface WalletContextValue extends WalletState {
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
  refreshWalletList: () => Promise<void>;
}
