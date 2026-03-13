"use client";

import { useAppSelector } from "../lib/redux/hooks";
import { selectParsedCurrentUserMember } from "../lib/redux/features/auth";
import { selectDbLoading } from "../lib/redux/features/data";
import { selectWalletAddress } from "../lib/redux/features/wallet";
import { MemberData } from "@sidan-lab/cardano-ambassador-tool";
import { Utxo } from "@types";

interface MemberValidationResult {
  isMember: boolean;
  memberValidationLoading: boolean;
  memberUtxo: Utxo | null;
  memberData: MemberData | null;
}

/**
 * Member validation hook - delegates to Redux selectors.
 * Provides member status and data for the current wallet address.
 */
export function useMemberValidation(): MemberValidationResult {
  const parsedMember = useAppSelector(selectParsedCurrentUserMember);
  const dbLoading = useAppSelector(selectDbLoading);
  const walletAddress = useAppSelector(selectWalletAddress);

  // Loading if db is loading or no wallet address yet
  const memberValidationLoading = dbLoading || !walletAddress;

  return {
    isMember: parsedMember.isMember,
    memberValidationLoading,
    memberUtxo: parsedMember.memberUtxo,
    memberData: parsedMember.memberData,
  };
}
