"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getCatConstants, getProvider } from "@/utils";

// ---------- Types ----------
export interface TreasuryState {
  // Balance stored as string (bigint not serializable)
  balance: string;
  isLoading: boolean;
  error: string | null;
}

// ---------- Initial State ----------
const initialState: TreasuryState = {
  balance: "0",
  isLoading: true,
  error: null,
};

// ---------- Async Thunks ----------

/**
 * Fetch treasury balance from blockchain
 */
export const fetchTreasuryBalance = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("treasury/fetchBalance", async (_, { rejectWithValue }) => {
  try {
    const provider = getProvider();
    const catConstants = getCatConstants();
    const treasuryAddress = catConstants.scripts.treasury.spend.address;

    const utxos = await provider.fetchAddressUTxOs(treasuryAddress);
    const totalBalance = utxos.reduce((sum, utxo) => {
      const lovelace = utxo.output.amount.find(
        (asset) => asset.unit === "lovelace",
      );
      return sum + BigInt(lovelace ? lovelace.quantity : "0");
    }, BigInt(0));

    return totalBalance.toString();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to fetch treasury balance",
    );
  }
});

// ---------- Slice ----------
const treasurySlice = createSlice({
  name: "treasury",
  initialState,
  reducers: {
    setTreasuryBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setTreasuryLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTreasuryError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearTreasuryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreasuryBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTreasuryBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchTreasuryBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch treasury balance";
        state.balance = "0";
      });
  },
});

// ---------- Exports ----------
export const {
  setTreasuryBalance,
  setTreasuryLoading,
  setTreasuryError,
  clearTreasuryError,
} = treasurySlice.actions;

export default treasurySlice.reducer;
