'use client';

import { getCurrentNetworkConfig } from '@/config/cardano';
import { useNetworkValidation } from '@/hooks';
import { useAppLoading } from '@/hooks/useAppLoading';
import { useDatabase } from '@/hooks/useDatabase';
import { Theme, useThemeManager } from '@/hooks/useThemeManager';
import { User, useUserAuth } from '@/hooks/useUserAuth';
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
  ) => null | undefined;
  shouldShowLoading: boolean;

  // Database state
  dbLoading: boolean;
  intents: Utxo[];
  ambassadors: Ambassador[];
  syncData: (context: string) => void;
  syncAllData: () => void;
  query: <T = Record<string, unknown>>(sql: string, params?: any[]) => T[];
  getUtxosByContext: (contextName: string) => Utxo[];

  // User state
  user: User;
  isAuthenticated: boolean;
  userAddress: string | undefined;
  userRoles: string[];
  userWallet: IWallet | undefined;

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

  // Database defaults
  dbLoading: true,
  intents: [],
  ambassadors: [],
  syncData: () => {},
  syncAllData: () => {},
  query: () => [],
  getUtxosByContext: () => [],

  // User defaults
  user: null,
  // setUser: () => {},
  // Theme defaults
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  updateLoadingState: function (
    dbLoading: boolean,
    isThemeInitialized: boolean,
  ): null | undefined {
    throw new Error('Function not implemented.');
  },
  shouldShowLoading: false,
  isAuthenticated: false,
  userAddress: undefined,
  userRoles: [],
  userWallet: undefined,
  isThemeInitialized: false,
  isDark: false,
  isLight: false,
  currentNetwork: getCurrentNetworkConfig(),
  networkValidation: null,
  isValidatingNetwork: false,
  validateCurrentWallet: function (): Promise<void> {
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

  const {
    // State
    dbLoading,
    intents,
    ambassadors,

    // Operations
    syncData,
    syncAllData,
    query,
    getUtxosByContext,
  } = useDatabase();

  const {
    user,

  } = useUserAuth();

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
    dismissNetworkError,
    // Helper computed values
    isNetworkValid,
    hasNetworkError,
    networkErrorMessage,
    walletNetwork,
  } = useNetworkValidation();

  // Coordinate app loading state based on dependencies
  useEffect(() => {
    const timer = updateLoadingState(dbLoading, isThemeInitialized);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [dbLoading, isThemeInitialized, updateLoadingState]);

  // Temporary debug: confirm provider mount
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[AppProvider] mounted');
  }, []);

  // Create the context value
  const contextValue: AppContextValue = {
    // App loading
    isAppLoading: isAppLoading,
    isInitialLoad: isInitialLoad,

    // Database
    dbLoading,
    intents,
    ambassadors,
    syncData,
    syncAllData,
    query,
    getUtxosByContext,

    // User
    user,
    // setUser: userAuth.setUser,
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
    dismissNetworkError,
    // Helper computed values
    isNetworkValid,
    hasNetworkError,
    networkErrorMessage,
    walletNetwork,
    updateLoadingState: function (
      dbLoading: boolean,
      isThemeInitialized: boolean,
    ): null | undefined {
      throw new Error('Function not implemented.');
    },
    shouldShowLoading: false,
    isAuthenticated: false,
    userAddress: undefined,
    userRoles: [],
    userWallet: undefined,
    isThemeInitialized: false,
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

