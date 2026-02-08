import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { selectDetailedProposals } from "../data/dataSelectors";

import { selectCalculatedTotalPayouts } from "../data/dataSelectors";

// ---------- Base Selectors ----------
export const selectTreasuryState = (state: RootState) => state.treasury;

export const selectTreasuryBalanceString = (state: RootState) =>
  state.treasury.balance;
// Removed selectTotalPayoutsString as it's no longer in state
export const selectIsTreasuryLoading = (state: RootState) =>
  state.treasury.isLoading;
export const selectTreasuryError = (state: RootState) => state.treasury.error;

// ---------- Memoized Selectors ----------

/**
 * Get treasury balance as bigint
 */
export const selectTreasuryBalance = createSelector(
  [selectTreasuryBalanceString],
  (balanceString) => BigInt(balanceString),
);

/**
 * Get total payouts as bigint
 * Now derived from data slice via selectCalculatedTotalPayouts
 */
export const selectTotalPayouts = createSelector(
  [selectCalculatedTotalPayouts],
  (payoutsString) => BigInt(payoutsString),
);

/**
 * Get treasury balance in ADA (as number)
 */
export const selectTreasuryBalanceAda = createSelector(
  [selectTreasuryBalance],
  (balance) => Math.floor(Number(balance) / 1_000_000),
);

/**
 * Get total payouts in ADA (as number)
 */
export const selectTotalPayoutsAda = createSelector(
  [selectTotalPayouts],
  (payouts) => Math.floor(Number(payouts) / 1_000_000),
);

/**
 * Check if treasury has error
 */
export const selectHasTreasuryError = createSelector(
  [selectTreasuryError],
  (error) => error !== null,
);

/**
 * Check if treasury data is ready
 */
export const selectIsTreasuryReady = createSelector(
  [selectIsTreasuryLoading, selectTreasuryError],
  (isLoading, error) => !isLoading && error === null,
);
