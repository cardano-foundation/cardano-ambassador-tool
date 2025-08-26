'use client';

import {
  initUtxoWorker,
  onUtxoWorkerMessage,
  sendUtxoWorkerMessage,
} from '@/lib/utxoWorkerClient';
import { resolveRoles } from '@/lib/auth/roles';
import { Utxo } from '@types';
import { IWallet } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { createContext, useContext, useEffect, useState } from 'react';
import initSqlJsLocal from './sql-wasm.js';
import initSqlJs, { Database } from 'sql.js';
import { 
  CardanoNetwork, 
  getCurrentNetwork, 
  getCurrentNetworkConfig, 
  getNetworkDisplayName 
} from '@/config/cardano';
import { 
  validateWalletNetwork, 
  NetworkValidationResult,
  getNetworkSwitchInstructions 
} from '@/utils/wallet-network';

// ---------- Types ----------

type User = {
  wallet: IWallet;
  roles?: string[];
  address: string;
} | null;

type Theme = 'light' | 'dark';

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

// ---------- SQL.js internal state ----------
let SQL: initSqlJs.SqlJsStatic | null = null;
let db: Database | null = null;

async function initDb(exportedDb: Uint8Array | number[]): Promise<void> {
  if (!SQL) {
    SQL = await initSqlJsLocal({
      locateFile: () => {
        return `/sql-wasm.wasm`;
      },
    });
  }

  const uint8Array =
    exportedDb instanceof Uint8Array ? exportedDb : new Uint8Array(exportedDb);

  db = new SQL!.Database(uint8Array);
  console.log('DB initialized!!.');
}

function queryDb<T = Record<string, unknown>>(
  query: string,
  params: any[] = [],
): T[] {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  const stmt = db.prepare(query);
  stmt.bind(params);

  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

function getUtxosByContext(contextName: string): Utxo[] {
  return queryDb<Utxo>('SELECT * FROM utxos WHERE context = ?', [contextName]);
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
  // App loading state - detect if this is a full page reload
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isInitialLoad] = useState(() => {
    // Only show initial loading on full page reload, not on navigation
    if (typeof window !== 'undefined') {
      // Check if we're doing a fresh page load (navigation timing API)
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return timing?.type === 'navigate' || timing?.type === 'reload';
    }
    return true;
  });
  
  // Database state
  const [dbLoading, setDbLoading] = useState(true);
  const [intents, setIntents] = useState<Utxo[]>([]);

  // User state
  const [user, setUserState] = useState<User | null>(null);
  const { setPersist, address, wallet } = useWallet();

  // Theme state - Initialize immediately to prevent flash
  const [theme, setThemeState] = useState<Theme>(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved && ['light', 'dark'].includes(saved)) {
        return saved;
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const [isThemeInitialized, setIsThemeInitialized] = useState(false);

  // Network state
  const [currentNetwork] = useState<CardanoNetwork>(() => getCurrentNetwork());
  const [networkValidation, setNetworkValidation] = useState<NetworkValidationResult | null>(null);
  const [isValidatingNetwork, setIsValidatingNetwork] = useState(false);

  // ---------- App Loading Logic ----------
  useEffect(() => {
    if (!isInitialLoad) {
      // Skip loading screen for navigation (not full page reload)
      setIsAppLoading(false);
      return;
    }

    // For initial loads, wait for all resources to be ready
    const timer = setTimeout(() => {
      // Ensure minimum loading time for smooth UX (even if resources load quickly)
      if (!dbLoading && isThemeInitialized) {
        setIsAppLoading(false);
      }
    }, 1500); // Minimum 1.5 seconds loading time

    return () => clearTimeout(timer);
  }, [dbLoading, isThemeInitialized, isInitialLoad]);

  // ---------- Database Effects ----------
  useEffect(() => {
    // Initialize worker
    initUtxoWorker();

    // Listen for DB updates from worker
    const unsubscribe = onUtxoWorkerMessage(async (data) => {
      if (data.db) {
        try {
          await initDb(data.db);
          const rows = queryDb<Utxo>(
            'SELECT * FROM utxos WHERE context = "membership_intent" ',
          );
          setIntents(rows);
          setDbLoading(false);
          console.log('✅ All worker resources loaded');
        } catch (err) {
          console.error('Error loading DB from worker:', err);
          setDbLoading(false);
        }
      }
    });

    // Request worker to seed all data
    syncAllData();

    return unsubscribe;
  }, []);

  // ---------- User Effects ----------
  
  const setUser = (data: User | null) => {
    if (data) {
      localStorage.setItem('user', JSON.stringify(data));
    } else {
      localStorage.removeItem('user');
    }
    setUserState(data);
  };

  // Load stored user first
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUserState(JSON.parse(stored));
    }
  }, []);

  // Persist wallet connection
  useEffect(() => {
    setPersist(true);
  }, [setPersist]);

  // Fetch roles when address changes
  useEffect(() => {
    async function fetchRoles() {
      if (address && address.length) {
        const roles = await resolveRoles(address);
        console.log({ roles });
        setUser({ wallet, roles, address });
      }
    }
    fetchRoles();
  }, [address, wallet]);

  // ---------- Theme Effects ----------
  
  // Apply theme immediately on mount and changes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme class immediately and synchronously
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Force a reflow to ensure all elements recognize the new theme class
    // before CSS transitions start
    root.offsetHeight;
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Mark as initialized after first application
    if (!isThemeInitialized) {
      setIsThemeInitialized(true);
    }
  }, [theme, isThemeInitialized]);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a theme
      const hasExplicitTheme = localStorage.getItem('theme');
      if (!hasExplicitTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // ---------- Network Effects ----------
  
  // Validate wallet network when wallet or address changes
  useEffect(() => {
    if (wallet && address && address.length > 0) {
      validateCurrentWallet();
    } else {
      // Clear network validation when wallet is disconnected
      setNetworkValidation(null);
    }
  }, [wallet, address]);

  // ---------- Network Functions ----------
  
  const validateCurrentWallet = async () => {
    if (!wallet) {
      setNetworkValidation(null);
      return;
    }

    setIsValidatingNetwork(true);
    try {
      const validation = await validateWalletNetwork(wallet);
      setNetworkValidation(validation);
      
      // Log validation result for debugging
      if (validation.isValid) {
        console.log('✅ Wallet network validation passed:', validation.message);
      } else {
        console.warn('⚠️ Wallet network validation failed:', validation.message);
      }
    } catch (error) {
      console.error('Network validation error:', error);
      setNetworkValidation({
        isValid: false,
        expectedNetwork: currentNetwork,
        error: 'WALLET_ERROR',
        message: 'Failed to validate wallet network. Please try reconnecting your wallet.'
      });
    } finally {
      setIsValidatingNetwork(false);
    }
  };

  const dismissNetworkError = () => {
    setNetworkValidation(null);
  };

  // ---------- Other Functions ----------

  function syncAllData() {
    sendUtxoWorkerMessage({
      action: 'seedAll',
      apiBaseUrl: window.location.origin,
      contexts: [
        'member',
        'membership_intent',
        'proposal',
        'proposal_intent',
        'sign_of_approval',
      ],
    });
  }

  function syncData(context: string) {
    sendUtxoWorkerMessage({
      action: 'seed',
      apiBaseUrl: window.location.origin,
      context,
    });
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider
      value={{
        // App loading
        isAppLoading,
        isInitialLoad,
        
        // Database
        dbLoading,
        intents,
        syncData,
        syncAllData,
        query: queryDb,
        getUtxosByContext,
        
        // User
        user,
        setUser,
        
        // Theme
        theme,
        setTheme,
        toggleTheme,
        
        // Network
        currentNetwork,
        networkValidation,
        isValidatingNetwork,
        validateCurrentWallet,
        dismissNetworkError,
      }}
    >
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

export function useAppLoading() {
  const { isAppLoading, isInitialLoad } = useApp();
  
  return {
    isAppLoading,
    isInitialLoad,
    // Helper values
    shouldShowLoading: isAppLoading && isInitialLoad,
  };
}
