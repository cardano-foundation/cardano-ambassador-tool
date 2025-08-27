'use client';

import { useAppLoading } from '@/hooks/useAppLoading';
import { useDatabase } from '@/hooks/useDatabase';
import { useNetworkValidation } from '@/hooks/useNetworkValidation';
import { Theme, useThemeManager } from '@/hooks/useThemeManager';
import { User, useUserAuth } from '@/hooks/useUserAuth';
import { CardanoNetwork } from '@/config/cardano';
import { NetworkValidationResult } from '@/utils/wallet-network';
import { Utxo } from '@types';
import { createContext, useContext, useEffect } from 'react';

// ---------- Types ----------
interface AppContextValue {
  // App loading state
  isAppLoading: boolean;
  isInitialLoad: boolean;

  // Database state
  dbLoading: boolean;
  intents: Utxo[];
  syncData: (context: string) => void;
  syncAllData: () => void;
  query: <T = Record<string, unknown>>(sql: string, params?: any[]) => T[];
  getUtxosByContext: (context: string) => Utxo[];

  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Theme state
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Network state
  currentNetwork: CardanoNetwork;
  networkValidation: NetworkValidationResult | null;
  isValidatingNetwork: boolean;
  validateCurrentWallet: () => Promise<void>;
  dismissNetworkError: () => void;
}

// ---------- Context ----------
const AppContext = createContext<AppContextValue>({
  // App loading defaults
  isAppLoading: true,
  isInitialLoad: true,

  // Database defaults
  dbLoading: true,
  intents: [],
  syncData: () => {},
  syncAllData: () => {},
  query: () => [],
  getUtxosByContext: () => [],

  // User defaults
  user: null,
  setUser: () => {},

  // Theme defaults
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},

  // Network defaults
  currentNetwork: 'preprod',
  networkValidation: null,
  isValidatingNetwork: false,
  validateCurrentWallet: async () => {},
  dismissNetworkError: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize all the custom hooks
  const appLoading = useAppLoading();
  const database = useDatabase();
  const userAuth = useUserAuth();
  const themeManager = useThemeManager();
  const networkValidation = useNetworkValidation(userAuth.userWallet || null, userAuth.userAddress || null);

  // Coordinate app loading state based on dependencies
  useEffect(() => {
    const timer = appLoading.updateLoadingState(
      database.loading,
      themeManager.isThemeInitialized
    );
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [database.loading, themeManager.isThemeInitialized, appLoading.updateLoadingState]);

  // Create the context value
  const contextValue: AppContextValue = {
    // App loading
    isAppLoading: appLoading.isAppLoading,
    isInitialLoad: appLoading.isInitialLoad,

    // Database
    dbLoading: database.loading,
    intents: database.intents,
    syncData: database.syncData,
    syncAllData: database.syncAllData,
    query: database.query,
    getUtxosByContext: database.getUtxosByContext,

    // User
    user: userAuth.user,
    setUser: userAuth.setUser,

    // Theme
    theme: themeManager.theme,
    setTheme: themeManager.setTheme,
    toggleTheme: themeManager.toggleTheme,

    // Network
    currentNetwork: networkValidation.currentNetwork,
    networkValidation: networkValidation.networkValidation,
    isValidatingNetwork: networkValidation.isValidatingNetwork,
    validateCurrentWallet: networkValidation.validateCurrentWallet,
    dismissNetworkError: networkValidation.dismissNetworkError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
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

export function useDb() {
  const {
    dbLoading,
    intents,
    syncData,
    syncAllData,
    query,
    getUtxosByContext,
  } = useApp();

  return {
    loading: dbLoading,
    intents,
    syncData,
    syncAllData,
    query,
    getUtxosByContext,
  };
}

export function useUser() {
  const { user, setUser } = useApp();

  return {
    user,
    setUser,
  };
}

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useApp();

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}

export function useNetwork() {
  const {
    currentNetwork,
    networkValidation,
    isValidatingNetwork,
    validateCurrentWallet,
    dismissNetworkError,
  } = useApp();

  return {
    currentNetwork,
    networkValidation,
    isValidatingNetwork,
    validateCurrentWallet,
    dismissNetworkError,
    // Helper computed values
    isNetworkValid: networkValidation?.isValid ?? true,
    hasNetworkError: networkValidation && !networkValidation.isValid,
    networkErrorMessage: networkValidation?.message,
    walletNetwork: networkValidation?.walletNetwork,
  };
}

export function useAppLoadingStatus() {
  const { isAppLoading, isInitialLoad } = useApp();

  return {
    isAppLoading,
    isInitialLoad,
    // Helper values
    shouldShowLoading: isAppLoading && isInitialLoad,
  };
}
