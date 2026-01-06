import { configureStore } from '@reduxjs/toolkit';
import { uiReducer } from './features/ui';

// Store will be populated incrementally as we migrate from Context
// Phase 2: ui slice (theme, loading, tx confirmation) - DONE
// Phase 3: wallet slice (connection, network)
// Phase 4: members slice, proposals slice
// Phase 5: treasury slice
// Phase 7: auth slice

export const makeStore = () => {
  return configureStore({
    reducer: {
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: process.env.NODE_ENV === 'development',
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
