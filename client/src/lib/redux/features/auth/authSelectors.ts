import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import { selectMembers, selectDbLoading } from '../data/dataSelectors';
import { selectWalletAddress } from '../wallet/walletSelectors';
import { parseMemberDatum, getCountryByCode } from '@/utils';
import type { Utxo } from '@types';
import type { MemberData } from '@sidan-lab/cardano-ambassador-tool';

// ---------- Base Selectors ----------

export const selectAuthState = (state: RootState) => state.auth;

export const selectAuthAddress = (state: RootState) => state.auth.address;
export const selectAuthRoles = (state: RootState) => state.auth.roles;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsAdmin = (state: RootState) => state.auth.isAdmin;
export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectIsHydrated = (state: RootState) => state.auth.isHydrated;
export const selectAuthError = (state: RootState) => state.auth.error;

// Member validation base selectors
export const selectIsMember = (state: RootState) => state.auth.isMember;
export const selectMemberValidationLoading = (state: RootState) =>
  state.auth.memberValidationLoading;
export const selectCurrentMemberData = (state: RootState) => state.auth.currentMemberData;
export const selectCurrentMemberUtxoRef = (state: RootState) => state.auth.currentMemberUtxoRef;

// ---------- Memoized Selectors ----------

/**
 * Check if auth has an error
 */
export const selectHasAuthError = createSelector(
  [selectAuthError],
  (error) => error !== null,
);

/**
 * Check if auth is ready (hydrated and not loading)
 */
export const selectIsAuthReady = createSelector(
  [selectIsHydrated, selectIsAuthLoading],
  (isHydrated, isLoading) => isHydrated && !isLoading,
);

/**
 * Check if user is fully ready (auth ready and member validation complete)
 */
export const selectIsUserReady = createSelector(
  [selectIsAuthReady, selectMemberValidationLoading],
  (isAuthReady, memberValidationLoading) => isAuthReady && !memberValidationLoading,
);

/**
 * Find the current user's member UTxO by matching wallet address
 * This is the key memoized selector that joins members + wallet address
 */
export const selectCurrentUserMemberUtxo = createSelector(
  [selectMembers, selectWalletAddress, selectDbLoading],
  (members, walletAddress, dbLoading): Utxo | null => {
    if (dbLoading || !walletAddress) return null;

    const userMember = members.find((utxo) => {
      if (!utxo.plutusData) return false;
      try {
        const parsed = parseMemberDatum(utxo.plutusData);
        if (!parsed?.member?.metadata) return false;
        return parsed.member.metadata.walletAddress === walletAddress;
      } catch {
        return false;
      }
    });

    return userMember || null;
  },
);

/**
 * Parse current user's member data from their member UTxO
 */
export const selectParsedCurrentUserMember = createSelector(
  [selectCurrentUserMemberUtxo],
  (
    memberUtxo,
  ): {
    isMember: boolean;
    memberData: MemberData | null;
    memberUtxo: Utxo | null;
  } => {
    if (!memberUtxo?.plutusData) {
      return {
        isMember: false,
        memberData: null,
        memberUtxo: null,
      };
    }

    try {
      const parsed = parseMemberDatum(memberUtxo.plutusData);
      if (!parsed?.member?.metadata) {
        return {
          isMember: false,
          memberData: null,
          memberUtxo: null,
        };
      }

      const memberMetadata = parsed.member.metadata;
      const countryData = memberMetadata.country
        ? getCountryByCode(memberMetadata.country)
        : null;

      const memberData: MemberData = {
        walletAddress: memberMetadata.walletAddress,
        fullName: memberMetadata.fullName || memberMetadata.displayName,
        displayName: memberMetadata.displayName,
        emailAddress: memberMetadata.emailAddress,
        country: countryData?.name || memberMetadata.country || '',
        city: memberMetadata.city || '',
        bio: memberMetadata.bio || '',
        x_handle: memberMetadata.x_handle || '',
        github: memberMetadata.github || '',
        discord: memberMetadata.discord || '',
        spo_id: memberMetadata.spo_id || '',
      };

      return {
        isMember: true,
        memberData,
        memberUtxo,
      };
    } catch (error) {
      console.error('Error parsing member data:', error);
      return {
        isMember: false,
        memberData: null,
        memberUtxo: null,
      };
    }
  },
);

/**
 * Get member validation result from Redux state (for when already computed)
 */
export const selectMemberValidationResult = createSelector(
  [selectIsMember, selectCurrentMemberData, selectMemberValidationLoading],
  (isMember, memberData, isLoading) => ({
    isMember,
    memberData,
    isLoading,
  }),
);

/**
 * Get full user info for display
 */
export const selectUserInfo = createSelector(
  [selectAuthAddress, selectAuthRoles, selectIsAuthenticated, selectIsAdmin],
  (address, roles, isAuthenticated, isAdmin) => ({
    address,
    roles,
    isAuthenticated,
    isAdmin,
  }),
);

/**
 * Check if current user can perform admin actions
 */
export const selectCanPerformAdminActions = createSelector(
  [selectIsAuthenticated, selectIsAdmin, selectIsAuthReady],
  (isAuthenticated, isAdmin, isReady) => isReady && isAuthenticated && isAdmin,
);

/**
 * Check if current user can perform member actions
 */
export const selectCanPerformMemberActions = createSelector(
  [selectIsAuthenticated, selectIsMember, selectIsUserReady],
  (isAuthenticated, isMember, isReady) => isReady && isAuthenticated && isMember,
);
