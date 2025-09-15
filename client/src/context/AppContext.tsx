'use client';

import { getCurrentNetworkConfig } from '@/config/cardano';
import { useNetworkValidation } from '@/hooks';
import { useAppLoading } from '@/hooks/useAppLoading';
import { useDatabase } from '@/hooks/useDatabase';
import { Theme, useThemeManager } from '@/hooks/useThemeManager';
import { User, useUserAuth } from '@/hooks/useUserAuth';
import { useWalletManager } from '@/hooks/useWalletManager';
import { WalletContextValue } from '@/types/wallet';
import { IWallet } from '@meshsdk/core';
import {
  Ambassador,
  NetworkConfig,
  NetworkValidationResult,
  Utxo,
} from '@types';
import { createContext, useContext, useEffect } from 'react';

// ---------- Types ----------
interface AppContextValue {
  // App loading state
  isAppLoading: boolean;
  isInitialLoad: boolean;
  updateLoadingState: (
    dbLoading: boolean,
    isThemeInitialized: boolean,
    authLoading: boolean,
  ) => null | undefined;
  shouldShowLoading: boolean;

  // Wallet state (centralized)
  wallet: WalletContextValue;

  // Database state
  dbLoading: boolean;
  membershipIntents: Utxo[];
  proposalIntents: Utxo[];
  members: Utxo[];
  proposals: Utxo[];
  ambassadors: Ambassador[];
  syncData: (context: string) => void;
  syncAllData: () => void;
  query: <T = Record<string, unknown>>(sql: string, params?: any[]) => T[];
  getUtxosByContext: (contextName: string) => Utxo[];

  // User state
  user: User;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  userAddress: string | undefined;
  userRoles: string[];
  userWallet: IWallet | undefined;
  logout: () => void;

  // Theme state
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
  toggleTheme: () => void;
  isThemeInitialized: boolean;
  isDark: boolean;
  isLight: boolean;

  // network
  currentNetwork: NetworkConfig;
  networkValidation: NetworkValidationResult | null;
  isValidatingNetwork: boolean;
  validateCurrentWallet: () => Promise<void>;
  validateBeforeConnection: (wallet: IWallet) => Promise<boolean>;
  dismissNetworkError: () => void;
  isNetworkValid: boolean | undefined;
  hasNetworkError: boolean | null;
  networkErrorMessage: string | undefined;
  walletNetwork: string | undefined;
}

// ---------- Context ----------
const AppContext = createContext<AppContextValue>({
  // App loading defaults
  isAppLoading: true,
  isInitialLoad: true,

  // Wallet defaults
  wallet: {
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
    connectWallet: async () => {},
    disconnectWallet: () => {},
    clearError: () => {},
    refreshWalletList: async () => {},
  },

  // Database defaults
  dbLoading: true,
  membershipIntents: [],
  proposalIntents: [],
  members: [],
  proposals: [],
  ambassadors: [],
  syncData: () => {},
  syncAllData: () => {},
  query: () => [],
  getUtxosByContext: () => [],

  // User defaults
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  userAddress: undefined,
  userRoles: [],
  userWallet: undefined,
  logout: () => {},
  
  // Theme defaults
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  updateLoadingState: function (
    dbLoading: boolean,
    isThemeInitialized: boolean,
    authLoading: boolean,
  ): null | undefined {
    throw new Error('Function not implemented.');
  },
  shouldShowLoading: false,
  isThemeInitialized: false,
  isDark: false,
  isLight: false,
  currentNetwork: getCurrentNetworkConfig(),
  networkValidation: null,
  isValidatingNetwork: false,
  validateCurrentWallet: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  validateBeforeConnection: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  dismissNetworkError: function (): void {
    throw new Error('Function not implemented.');
  },
  isNetworkValid: undefined,
  hasNetworkError: null,
  networkErrorMessage: undefined,
  walletNetwork: undefined,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize all the custom hooks
  const {
    isAppLoading,
    isInitialLoad,
    updateLoadingState,
    // Helper values
    shouldShowLoading,
  } = useAppLoading();

  // Centralized wallet management
  const wallet = useWalletManager();

  const {
    // State
    dbLoading,
    membershipIntents,
    proposalIntents,
    members,
    proposals,
    ambassadors,

    // Operations
    syncData,
    syncAllData,
    query,
    getUtxosByContext,
  } = useDatabase();

  const {
    user,
    isLoading: authLoading,
    isAuthenticated,
    userAddress,
    userRoles,
    userWallet,
    isAdmin,
    logout,
  } = useUserAuth({
    wallet: wallet.wallet,
    address: wallet.address,
    isConnected: wallet.isConnected,
  });

  const {
    theme,
    setTheme,
    toggleTheme,
    isThemeInitialized,
    // Helper computed values
    isDark,
    isLight,
  } = useThemeManager();

  const {
    currentNetwork,
    networkValidation,
    isValidatingNetwork,
    validateCurrentWallet,
    validateBeforeConnection,
    dismissNetworkError,
    // Helper computed values
    isNetworkValid,
    hasNetworkError,
    networkErrorMessage,
    walletNetwork,
  } = useNetworkValidation({
    wallet: wallet.wallet,
    isConnected: wallet.isConnected,
  });

  // Coordinate app loading state 
  useEffect(() => {
    const timer = updateLoadingState(
      dbLoading,
      isThemeInitialized,
      authLoading,
    );

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [dbLoading, isThemeInitialized, authLoading, updateLoadingState]);

  // Create the context value
  const contextValue: AppContextValue = {
    // App loading
    isAppLoading: isAppLoading,
    isInitialLoad: isInitialLoad,

    // Wallet
    wallet,

    // Database
    dbLoading,
    membershipIntents,
    proposalIntents,
    members,
    proposals,
    ambassadors,
    syncData,
    syncAllData,
    query,
    getUtxosByContext,

    // User
    user,
    logout,
    isAuthenticated,
    isAdmin,
    isLoading: authLoading,
    userAddress,
    userRoles,
    userWallet,
    // Theme
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isLight,

    // network
    currentNetwork,
    networkValidation,
    isValidatingNetwork,
    validateCurrentWallet,
    validateBeforeConnection,
    dismissNetworkError,
    // Helper computed values
    isNetworkValid,
    hasNetworkError,
    networkErrorMessage,
    walletNetwork,
    updateLoadingState,
    shouldShowLoading,
    isThemeInitialized,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

// ---------- Custom Hooks ----------

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
