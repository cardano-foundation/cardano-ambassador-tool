import { configureStore } from "@reduxjs/toolkit";
import { uiReducer } from "./features/ui";
import { walletReducer } from "./features/wallet";
import { dataReducer } from "./features/data";
import { treasuryReducer } from "./features/treasury";
import { authReducer } from "./features/auth";

// Store will be populated incrementally as we migrate from Context
// Phase 2: ui slice (theme, loading, tx confirmation) - DONE
// Phase 3: wallet slice (connection, network) - DONE
// Phase 4: data slice (members, proposals, intents) - DONE
// Phase 5: treasury slice - DONE
// Phase 7: auth slice - DONE

export const makeStore = () => {
  return configureStore({
    reducer: {
      ui: uiReducer,
      wallet: walletReducer,
      data: dataReducer,
      treasury: treasuryReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // IWallet from MeshSDK is non-serializable
          // TransactionInfo may contain non-serializable data
          ignoredActions: [
            "wallet/connect/fulfilled",
            "wallet/autoConnect/fulfilled",
          ],
          ignoredPaths: [
            "wallet.wallet",
            "wallet.availableWallets",
            "data.treasuryPayouts",
          ],
        },
      }),
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
