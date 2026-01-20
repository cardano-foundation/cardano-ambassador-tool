import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export type Theme = 'light' | 'dark';

export interface TxConfirmationState {
  isVisible: boolean;
  txHash?: string;
  title?: string;
  description?: string;
  showNavigationOptions?: boolean;
  navigationOptions?: {
    label: string;
    url: string;
    variant?: 'primary' | 'outline';
  }[];
}

export interface UIState {
  // Theme
  theme: Theme;
  isThemeInitialized: boolean;

  // App loading
  isAppLoading: boolean;
  isInitialLoad: boolean;

  // Transaction confirmation (callbacks handled at component level)
  txConfirmation: TxConfirmationState;
}

// Helper to get initial theme from localStorage/system preference
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && ['light', 'dark'].includes(saved)) {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Helper to check if this is initial load
const checkIsInitialLoad = (): boolean => {
  if (typeof window !== 'undefined') {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return timing?.type === 'navigate' || timing?.type === 'reload';
  }
  return true;
};

const initialState: UIState = {
  // Theme - will be hydrated on client
  theme: 'light',
  isThemeInitialized: false,

  // Loading
  isAppLoading: true,
  isInitialLoad: true,

  // Transaction confirmation
  txConfirmation: {
    isVisible: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setThemeInitialized: (state, action: PayloadAction<boolean>) => {
      state.isThemeInitialized = action.payload;
    },
    // Hydrate theme from localStorage on client
    hydrateTheme: (state) => {
      state.theme = getInitialTheme();
      state.isInitialLoad = checkIsInitialLoad();
    },

    // Loading actions
    setAppLoading: (state, action: PayloadAction<boolean>) => {
      state.isAppLoading = action.payload;
    },
    updateLoadingState: (
      state,
      action: PayloadAction<{
        dbLoading: boolean;
        isThemeInitialized: boolean;
        authLoading: boolean;
      }>,
    ) => {
      const { dbLoading, isThemeInitialized, authLoading } = action.payload;

      if (!state.isInitialLoad) {
        state.isAppLoading = false;
        return;
      }

      if (!dbLoading && isThemeInitialized && !authLoading) {
        state.isAppLoading = false;
      }
    },

    // Transaction confirmation actions
    showTxConfirmation: (
      state,
      action: PayloadAction<Omit<TxConfirmationState, 'isVisible'>>,
    ) => {
      state.txConfirmation = {
        isVisible: true,
        ...action.payload,
      };
    },
    hideTxConfirmation: (state) => {
      state.txConfirmation = {
        isVisible: false,
        txHash: undefined,
        title: undefined,
        description: undefined,
        showNavigationOptions: undefined,
        navigationOptions: undefined,
      };
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setThemeInitialized,
  hydrateTheme,
  setAppLoading,
  updateLoadingState,
  showTxConfirmation,
  hideTxConfirmation,
} = uiSlice.actions;

export default uiSlice.reducer;
