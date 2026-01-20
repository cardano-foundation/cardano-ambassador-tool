'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TransactionInfo } from '@meshsdk/core';
import type { Utxo } from '@types';

// ---------- Types ----------
export interface DataState {
  // Loading state
  dbLoading: boolean;
  isSyncing: boolean;
  dbError: string | null;

  // UTxO data
  membershipIntents: Utxo[];
  proposalIntents: Utxo[];
  members: Utxo[];
  proposals: Utxo[];
  signOfApprovals: Utxo[];
  treasuryPayouts: TransactionInfo[];
}

// ---------- Initial State ----------
const initialState: DataState = {
  dbLoading: true,
  isSyncing: false,
  dbError: null,
  membershipIntents: [],
  proposalIntents: [],
  members: [],
  proposals: [],
  signOfApprovals: [],
  treasuryPayouts: [],
};

// ---------- Payload Types ----------
interface SetAllDataPayload {
  membershipIntents: Utxo[];
  proposalIntents: Utxo[];
  members: Utxo[];
  proposals: Utxo[];
  signOfApprovals: Utxo[];
  treasuryPayouts: TransactionInfo[];
}

// ---------- Slice ----------
const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Loading state
    setDbLoading: (state, action: PayloadAction<boolean>) => {
      state.dbLoading = action.payload;
    },
    setIsSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    setDbError: (state, action: PayloadAction<string | null>) => {
      state.dbError = action.payload;
    },

    // Set all data at once (from Web Worker)
    setAllData: (state, action: PayloadAction<SetAllDataPayload>) => {
      state.membershipIntents = action.payload.membershipIntents;
      state.proposalIntents = action.payload.proposalIntents;
      state.members = action.payload.members;
      state.proposals = action.payload.proposals;
      state.signOfApprovals = action.payload.signOfApprovals;
      state.treasuryPayouts = action.payload.treasuryPayouts;
      state.dbError = null;
    },

    // Individual setters (for partial updates if needed)
    setMembershipIntents: (state, action: PayloadAction<Utxo[]>) => {
      state.membershipIntents = action.payload;
    },
    setProposalIntents: (state, action: PayloadAction<Utxo[]>) => {
      state.proposalIntents = action.payload;
    },
    setMembers: (state, action: PayloadAction<Utxo[]>) => {
      state.members = action.payload;
    },
    setProposals: (state, action: PayloadAction<Utxo[]>) => {
      state.proposals = action.payload;
    },
    setSignOfApprovals: (state, action: PayloadAction<Utxo[]>) => {
      state.signOfApprovals = action.payload;
    },
    setTreasuryPayouts: (state, action: PayloadAction<TransactionInfo[]>) => {
      state.treasuryPayouts = action.payload;
    },

    // Database initialization complete
    dbInitialized: (state, action: PayloadAction<{ isSyncOperation: boolean }>) => {
      if (action.payload.isSyncOperation) {
        state.isSyncing = false;
      } else {
        state.dbLoading = false;
      }
      state.dbError = null;
    },

    // Database initialization failed
    dbInitializationFailed: (state, action: PayloadAction<string>) => {
      state.dbLoading = false;
      state.isSyncing = false;
      state.dbError = action.payload;
    },

    // Start sync operation
    startSync: (state) => {
      state.isSyncing = true;
    },
  },
});

// ---------- Exports ----------
export const {
  setDbLoading,
  setIsSyncing,
  setDbError,
  setAllData,
  setMembershipIntents,
  setProposalIntents,
  setMembers,
  setProposals,
  setSignOfApprovals,
  setTreasuryPayouts,
  dbInitialized,
  dbInitializationFailed,
  startSync,
} = dataSlice.actions;

export default dataSlice.reducer;
