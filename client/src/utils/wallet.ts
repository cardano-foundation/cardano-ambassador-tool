import { getCurrentNetworkConfig } from '@/config/cardano';
import { BrowserWallet, IWallet } from '@meshsdk/core';

const WALLET_PERSISTENCE_KEY = 'wallet-selection';

// Wallet discovery
export const getAvailableWallets = async () => {
  return BrowserWallet.getAvailableWallets();
};

// Wallet connection
export const connectToWallet = async (walletId: string) => {
  return await BrowserWallet.enable(walletId);
};

// Network validation
export const validateNetwork = async (wallet: IWallet) => {
  try {
    const networkId = await wallet.getNetworkId();
    const expectedNetwork = getCurrentNetworkConfig();
    return networkId === expectedNetwork.networkId;
  } catch {
    return false;
  }
};

// Persistence
export const saveWalletSelection = (walletId: string) => {
  localStorage.setItem(WALLET_PERSISTENCE_KEY, walletId);
};

export const getSavedWalletSelection = (): string | null => {
  return localStorage.getItem(WALLET_PERSISTENCE_KEY);
};

export const clearWalletSelection = () => {
  localStorage.removeItem(WALLET_PERSISTENCE_KEY);
};

// Address utilities
export const getWalletAddress = async (wallet: IWallet) => {
  const addresses = await wallet.getUsedAddresses();
  return addresses[0] || null;
};
