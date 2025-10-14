'use client';

import { getCurrentNetworkConfig } from '@/config/cardano';
import { useNetworkValidation } from '@/hooks';
import { useAppLoading } from '@/hooks/useAppLoading';
import { useDatabase } from '@/hooks/useDatabase';
import { Theme, useThemeManager } from '@/hooks/useThemeManager';
import { User, useUserAuth } from '@/hooks/useUserAuth';
import { useWalletManager } from '@/hooks/useWalletManager';
import { parseMemberDatum, getCountryByCode } from '@/utils';
import { WalletContextValue } from '@/types/wallet';
import { IWallet } from '@meshsdk/core';
import { MemberData } from '@sidan-lab/cardano-ambassador-tool';
import { NetworkConfig, NetworkValidationResult, Utxo } from '@types';
import { createContext, useContext, useEffect, useMemo } from 'react';

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
  wallet: WalletContextValue;

  // Member validation state
  isMember: boolean;
  memberValidationLoading: boolean;
  memberUtxo: Utxo | null;
  memberData: MemberData | null;

  // Database state
  dbLoading: boolean;
  isSyncing: boolean;
  membershipIntents: Utxo[];
  proposalIntents: Utxo[];
  members: Utxo[];
  proposals: Utxo[];
  syncData: (context: string) => void;
  syncAllData: () => void;
  query: <T = Record<string, unknown>>(sql: string, params?: any[]) => T[];
  getUtxosByContext: (contextName: string) => Utxo[];
  findMembershipIntentUtxo: (address: string) => Promise<Utxo | null>;

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

  // Member validation defaults
  isMember: false,
  memberValidationLoading: true,
  memberUtxo: null,
  memberData: null,

  // Database defaults
  dbLoading: true,
  isSyncing: false,
  membershipIntents: [],
  proposalIntents: [],
  members: [],
  proposals: [],
  syncData: () => {},
  syncAllData: () => {},
  query: () => [],
  getUtxosByContext: () => [],
  findMembershipIntentUtxo: async () => null,

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
    shouldShowLoading,
  } = useAppLoading();

  const wallet = useWalletManager();

  const {
    dbLoading,
    isSyncing,
    membershipIntents,
    proposalIntents,
    members,
    proposals,
    syncData,
    syncAllData,
    query,
    getUtxosByContext,
    findMembershipIntentUtxo,
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
    isNetworkValid,
    hasNetworkError,
    networkErrorMessage,
    walletNetwork,
  } = useNetworkValidation({
    wallet: wallet.wallet,
    isConnected: wallet.isConnected,
  });

  // Member validation logic
  const memberValidation = useMemo(() => {
    if (dbLoading || !wallet.address) {
      return {
        isMember: false,
        memberValidationLoading: true,
        memberUtxo: null,
        memberData: null,
      };
    }

    // Find member UTXO that belongs to the current user
    const userMember = members.find((utxo) => {
      if (!utxo.plutusData) return false;
      try {
        const parsed = parseMemberDatum(utxo.plutusData);
        if (!parsed?.member?.metadata) return false;
        return parsed.member.metadata.walletAddress === wallet.address;
      } catch {
        return false;
      }
    });

    if (!userMember?.plutusData) {
      return {
        isMember: false,
        memberValidationLoading: false,
        memberUtxo: null,
        memberData: null,
      };
    }

    try {
      const parsed = parseMemberDatum(userMember.plutusData);
      if (!parsed?.member?.metadata) {
        return {
          isMember: false,
          memberValidationLoading: false,
          memberUtxo: null,
          memberData: null,
        };
      }

      const memberMetadata = parsed.member.metadata;
      const countryData = memberMetadata.country
        ? getCountryByCode(memberMetadata.country)
        : null;
      
      return {
        isMember: true,
        memberValidationLoading: false,
        memberUtxo: userMember,
        memberData: {
          walletAddress: memberMetadata.walletAddress,
          fullName: memberMetadata.fullName || memberMetadata.displayName,
          displayName: memberMetadata.displayName,
          emailAddress: memberMetadata.emailAddress,
          country: countryData?.name || memberMetadata.country || '',
          city: memberMetadata.city || '',
          bio: memberMetadata.bio || '',
        } as MemberData,
      };
    } catch (error) {
      console.error('Error parsing member data:', error);
      return {
        isMember: false,
        memberValidationLoading: false,
        memberUtxo: null,
        memberData: null,
      };
    }
  }, [members, wallet.address, dbLoading]);

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
    isAppLoading: isAppLoading,
    isInitialLoad: isInitialLoad,
    wallet,

    // Member validation
    isMember: memberValidation.isMember,
    memberValidationLoading: memberValidation.memberValidationLoading,
    memberUtxo: memberValidation.memberUtxo,
    memberData: memberValidation.memberData,

    // Database
    dbLoading,
    isSyncing,
    membershipIntents,
    proposalIntents,
    members,
    proposals,
    syncData,
    syncAllData,
    query,
    getUtxosByContext,
    findMembershipIntentUtxo,

    // User
    user,
    logout,
    isAuthenticated,
    isAdmin,
    isLoading: authLoading,
    userAddress,
    userRoles,
    userWallet,
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
