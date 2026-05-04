"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { IWallet, Wallet } from "@meshsdk/core";
import {
  clearWalletSelection,
  connectToWallet,
  getAvailableWallets,
  getSavedWalletSelection,
  getWalletAddress,
  saveWalletSelection,
  validateNetwork,
} from "../../../../utils/wallet";
import type { RootState } from "../../store";

// ---------- Types ----------
export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  hasAttemptedAutoConnect: boolean;
  selectedWalletId: string | null;
  walletName: string | null;
  address: string | null;
  wallet: IWallet | null; // Non-serializable - configured in store middleware
  availableWallets: Wallet[];
  error: string | null;
  isNetworkValid: boolean;
}

// ---------- Initial State ----------
const initialState: WalletState = {
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
};

// ---------- Async Thunks ----------

/**
 * Refresh available wallets list
 */
export const refreshWalletList = createAsyncThunk<
  Wallet[],
  void,
  { rejectValue: string; state: RootState }
>(
  "wallet/refreshWalletList",
  async (_, { rejectWithValue }) => {
    try {
      const wallets = await getAvailableWallets();
      return wallets;
    } catch (error) {
      return rejectWithValue("Failed to discover wallets");
    }
  },
  {
    // useWalletManager is called from 30+ places. Without this guard, every
    // mounted instance would trigger the auto-connect chain on first render,
    // hammering the wallet API before hasAttemptedAutoConnect flips.
    condition: (_, { getState }) => !getState().wallet.isConnecting,
  },
);

/**
 * Connect to a wallet by ID
 */
export const connectWallet = createAsyncThunk(
  "wallet/connect",
  async (
    {
      walletId,
      availableWallets,
    }: { walletId: string; availableWallets: Wallet[] },
    { rejectWithValue },
  ) => {
    try {
      const wallet = await connectToWallet(walletId);
      const address = await getWalletAddress(wallet);
      const isNetworkValid = await validateNetwork(wallet);

      if (!isNetworkValid) {
        const walletNetworkId = await wallet.getNetworkId();
        const { getCurrentNetworkConfig, NETWORK_NAMES } = await import(
          "@/config/cardano"
        );
        const expectedNetwork = getCurrentNetworkConfig();

        const walletNetworkName = NETWORK_NAMES[walletNetworkId] || "Unknown";
        const expectedNetworkName = expectedNetwork.name;

        return rejectWithValue(
          `Network mismatch! Your wallet is connected to ${walletNetworkName}, but this app requires ${expectedNetworkName}. Please switch your wallet network.`,
        );
      }

      const selectedWallet = availableWallets.find((w) => w.id === walletId);
      saveWalletSelection(walletId);

      return {
        wallet,
        address,
        walletId,
        walletName: selectedWallet?.name || null,
        isNetworkValid: true,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Connection failed",
      );
    }
  },
);

/**
 * Auto-connect from saved wallet selection
 */
export const autoConnect = createAsyncThunk<
  {
    wallet: IWallet;
    address: string | null;
    walletId: string;
    walletName: string | null;
    isNetworkValid: boolean;
  } | null,
  Wallet[],
  { rejectValue: string; state: RootState }
>(
  "wallet/autoConnect",
  async (availableWallets, { rejectWithValue }) => {
    const savedWalletId = getSavedWalletSelection();
    if (!savedWalletId) {
      return null; // No saved wallet - not an error
    }

    try {
      const wallet = await connectToWallet(savedWalletId);
      const address = await getWalletAddress(wallet);
      const isNetworkValid = await validateNetwork(wallet);

      if (!isNetworkValid) {
        const walletNetworkId = await wallet.getNetworkId();
        const { getCurrentNetworkConfig, NETWORK_NAMES } = await import(
          "@/config/cardano"
        );
        const expectedNetwork = getCurrentNetworkConfig();

        const walletNetworkName = NETWORK_NAMES[walletNetworkId] || "Unknown";
        const expectedNetworkName = expectedNetwork.name;

        clearWalletSelection();
        return rejectWithValue(
          `Auto-connect failed: Wallet is on ${walletNetworkName} but app requires ${expectedNetworkName}.`,
        );
      }

      const selectedWallet = availableWallets.find(
        (w) => w.id === savedWalletId,
      );
      saveWalletSelection(savedWalletId);

      return {
        wallet,
        address,
        walletId: savedWalletId,
        walletName: selectedWallet?.name || null,
        isNetworkValid: true,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Auto-connection failed",
      );
    }
  },
  {
    // Skip if a connect/auto-connect is already in flight or has resolved.
    // useWalletManager fans out across many components, so without this guard
    // each instance would race to dispatch autoConnect on first render.
    condition: (_, { getState }) => {
      const { wallet } = getState();
      if (wallet.isConnecting) return false;
      if (wallet.hasAttemptedAutoConnect) return false;
      return true;
    },
  },
);

// ---------- Slice ----------
const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    disconnectWallet: (state) => {
      state.isConnected = false;
      state.selectedWalletId = null;
      state.walletName = null;
      state.address = null;
      state.wallet = null;
      state.error = null;
      clearWalletSelection();
    },
    clearError: (state) => {
      state.error = null;
    },
    setAvailableWallets: (state, action: PayloadAction<Wallet[]>) => {
      state.availableWallets = action.payload;
    },
    setHasAttemptedAutoConnect: (state, action: PayloadAction<boolean>) => {
      state.hasAttemptedAutoConnect = action.payload;
    },
  },
  extraReducers: (builder) => {
    // refreshWalletList
    builder
      .addCase(refreshWalletList.fulfilled, (state, action) => {
        state.availableWallets = action.payload;
      })
      .addCase(refreshWalletList.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // connectWallet
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnected = true;
        state.isConnecting = false;
        state.selectedWalletId = action.payload.walletId;
        state.walletName = action.payload.walletName;
        state.address = action.payload.address;
        state.wallet = action.payload.wallet;
        state.isNetworkValid = action.payload.isNetworkValid;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload as string;
      });

    // autoConnect
    builder
      .addCase(autoConnect.pending, (state) => {
        state.isConnecting = true;
      })
      .addCase(autoConnect.fulfilled, (state, action) => {
        state.hasAttemptedAutoConnect = true;
        if (action.payload) {
          state.isConnected = true;
          state.isConnecting = false;
          state.selectedWalletId = action.payload.walletId;
          state.walletName = action.payload.walletName;
          state.address = action.payload.address;
          state.wallet = action.payload.wallet;
          state.isNetworkValid = action.payload.isNetworkValid;
        } else {
          state.isConnecting = false;
        }
      })
      .addCase(autoConnect.rejected, (state, action) => {
        state.isConnecting = false;
        state.hasAttemptedAutoConnect = true;
        state.error = action.payload as string;
      });
  },
});

// ---------- Exports ----------
export const {
  disconnectWallet,
  clearError,
  setAvailableWallets,
  setHasAttemptedAutoConnect,
} = walletSlice.actions;

export default walletSlice.reducer;
