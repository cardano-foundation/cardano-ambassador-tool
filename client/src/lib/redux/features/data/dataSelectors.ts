import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import type { Utxo, Proposal } from '@types';
import { lovelaceToAda, parseMemberDatum, parseProposalDatum } from '@/utils';

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


// ... existing selectors ...

/**
 * Derived Selector: Parse and combine all proposals (Active + Completed)
 * Replaces logic in useProposals hook
 */
export const selectDetailedProposals = createSelector(
  [selectProposalIntents, selectProposals, selectSignOfApprovals, selectMembers],
  (proposalIntents, proposals, signOfApprovals, members) => {
    // 1. Combine Active Utxos
    const proposalsUtxos = [...proposalIntents, ...proposals, ...signOfApprovals];

    // 2. Parse Active Proposals
    const activeProposals = proposalsUtxos
      .map((utxo, idx) => {
        if (!utxo.plutusData) return null;

        try {
          let metadata: any;
          let description = 'No description provided';

          // Try parsing metadata from pre-parsed field or raw plutus data
          if (utxo.parsedMetadata) {
            try {
              const parsed =
                typeof utxo.parsedMetadata === 'string'
                  ? JSON.parse(utxo.parsedMetadata)
                  : utxo.parsedMetadata;
              metadata = parsed;
              description = parsed.description || description;
            } catch {
              const parsedDatum = parseProposalDatum(utxo.plutusData);
              metadata = parsedDatum?.metadata;
            }
          } else {
            const parsedDatum = parseProposalDatum(utxo.plutusData);
            metadata = parsedDatum?.metadata;
          }

          if (!metadata) return null;

          // Determine status
          let status: Proposal['status'] = 'pending';
          if (signOfApprovals.some((p) => p.txHash === utxo.txHash)) {
            status = 'signoff_pending';
          } else if (proposals.some((p) => p.txHash === utxo.txHash)) {
            status = 'approved';
          }

          return {
            id: 0, // Will be re-indexed later
            title: metadata.title || 'Untitled Proposal',
            description,
            receiverWalletAddress: metadata.receiverWalletAddress || '',
            submittedByAddress: metadata.submittedByAddress || '',
            fundsRequested: metadata.fundsRequested || '0',
            status,
            txHash: utxo.txHash,
            slug: undefined,
            url: metadata.url || undefined,
          } as Proposal;
        } catch (e) {
          console.error('Error parsing proposal datum:', e);
          return null;
        }
      })
      .filter((p): p is Proposal => p !== null);

    // 3. Parse Completed Proposals from Members
    const completedProposals = members.flatMap((mbr) => {
      const parsed = parseMemberDatum(mbr.plutusData!);
      if (!parsed || !parsed.member.completion) return [];

      return Array.from(parsed.member.completion, ([proposal, value]) => {
        // Create slug
        const titleSlug = proposal.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 50);
        const addressSlug = proposal.receiverWalletAddress.substring(0, 8);
        const slug = `${titleSlug}-${addressSlug}`;

        return {
          ...proposal,
          status: 'paid_out' as Proposal['status'],
          fundsRequested: lovelaceToAda(value),
          txHash: undefined,
          slug,
          description: 'No description provided',
          url: proposal.url || undefined,
          id: 0,
        } as Proposal;
      });
    });

    // 4. Merge and Index
    return [...activeProposals, ...completedProposals].map((p, index) => ({
      ...p,
      id: index + 1,
    }));
  },
);

/**
 * Derived Selector: Calculate Total Payouts from Proposals
 * Replaces logic in useTreasuryBalance hook
 */
export const selectCalculatedTotalPayouts = createSelector(
  [selectDetailedProposals],
  (allProposals) => {
    const totalLovelace = allProposals
      .filter((p) => p.status === 'paid_out')
      .reduce((sum, proposal) => {
      const adaString = proposal.fundsRequested;
      if (!adaString) return sum;

      // Remove locale formatting (commas) and parse as float
      const adaValue = parseFloat(adaString.replace(/,/g, ''));
      if (isNaN(adaValue)) return sum;

      // Convert ADA to lovelace (multiply by 1,000,000)
      const lovelace = BigInt(Math.round(adaValue * 1_000_000));
      return sum + lovelace;
    }, BigInt(0));

    return totalLovelace.toString();
  },
);
