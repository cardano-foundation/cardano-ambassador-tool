import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { Utxo } from '@types';

// ---------- Base Selectors ----------
export const selectDataState = (state: RootState) => state.data;

export const selectDbLoading = (state: RootState) => state.data.dbLoading;
export const selectIsSyncing = (state: RootState) => state.data.isSyncing;
export const selectDbError = (state: RootState) => state.data.dbError;

export const selectMembershipIntents = (state: RootState) => state.data.membershipIntents;
export const selectProposalIntents = (state: RootState) => state.data.proposalIntents;
export const selectMembers = (state: RootState) => state.data.members;
export const selectProposals = (state: RootState) => state.data.proposals;
export const selectSignOfApprovals = (state: RootState) => state.data.signOfApprovals;
export const selectTreasuryPayouts = (state: RootState) => state.data.treasuryPayouts;

// ---------- Memoized Selectors ----------

/**
 * Check if database has any error
 */
export const selectHasDbError = createSelector([selectDbError], (error) => error !== null);

/**
 * Check if data is ready (not loading and no error)
 */
export const selectIsDataReady = createSelector(
  [selectDbLoading, selectDbError],
  (dbLoading, dbError) => !dbLoading && dbError === null,
);

/**
 * Get membership intents count
 */
export const selectMembershipIntentsCount = createSelector(
  [selectMembershipIntents],
  (intents) => intents.length,
);

/**
 * Get proposal intents count
 */
export const selectProposalIntentsCount = createSelector(
  [selectProposalIntents],
  (intents) => intents.length,
);

/**
 * Get members count
 */
export const selectMembersCount = createSelector([selectMembers], (members) => members.length);

/**
 * Get proposals count
 */
export const selectProposalsCount = createSelector(
  [selectProposals],
  (proposals) => proposals.length,
);

/**
 * Get sign-off approvals count
 */
export const selectSignOfApprovalsCount = createSelector(
  [selectSignOfApprovals],
  (approvals) => approvals.length,
);

/**
 * Get treasury payouts count
 */
export const selectTreasuryPayoutsCount = createSelector(
  [selectTreasuryPayouts],
  (payouts) => payouts.length,
);

/**
 * Get pending items counts for admin dashboard
 */
export const selectPendingCounts = createSelector(
  [selectMembershipIntentsCount, selectProposalIntentsCount, selectSignOfApprovalsCount],
  (membershipIntents, proposalIntents, signOfApprovals) => ({
    membershipIntents,
    proposalIntents,
    signOfApprovals,
    total: membershipIntents + proposalIntents + signOfApprovals,
  }),
);

/**
 * Find a member by wallet address
 */
export const selectMemberByAddress = createSelector(
  [selectMembers, (_state: RootState, address: string | null) => address],
  (members, address): Utxo | undefined => {
    if (!address) return undefined;
    return members.find((utxo) => {
      if (!utxo.plutusData) return false;
      try {
        // Note: Actual parsing happens in the component/hook
        // This selector just provides the data structure
        return utxo.parsedMetadata?.includes(address);
      } catch {
        return false;
      }
    });
  },
);

/**
 * Find a membership intent by wallet address
 */
export const selectMembershipIntentByAddress = createSelector(
  [selectMembershipIntents, (_state: RootState, address: string | null) => address],
  (intents, address): Utxo | undefined => {
    if (!address) return undefined;
    return intents.find((utxo) => {
      if (!utxo.plutusData) return false;
      try {
        return utxo.parsedMetadata?.includes(address);
      } catch {
        return false;
      }
    });
  },
);

/**
 * Get UTxOs by context name
 */
export const selectUtxosByContext = createSelector(
  [
    selectDataState,
    (_state: RootState, contextName: string) => contextName,
  ],
  (dataState, contextName): Utxo[] => {
    switch (contextName) {
      case 'membership_intent':
        return dataState.membershipIntents;
      case 'proposal_intent':
        return dataState.proposalIntents;
      case 'members':
        return dataState.members;
      case 'proposals':
        return dataState.proposals;
      case 'sign_of_approval':
        return dataState.signOfApprovals;
      default:
        return [];
    }
  },
);
