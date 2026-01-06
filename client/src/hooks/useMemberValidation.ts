import { useAppSelector } from '@/lib/redux/hooks';
import {
  selectParsedCurrentUserMember,
  selectMemberValidationLoading,
} from '@/lib/redux/features/auth';
import { selectDbLoading } from '@/lib/redux/features/data';
import { getCountryByCode } from '@/utils';
import { Utxo } from '@types';
import { useMemo } from 'react';

interface MemberValidationResult {
  isMember: boolean;
  isLoading: boolean;
  memberUtxo: Utxo | null;
  memberData: {
    name: string;
    username: string;
    email: string;
    country: string;
    city: string;
    bio: string;
  } | null;
}

/**
 * Member validation hook - now delegates to Redux for state management.
 * Maintains backward compatibility with existing consumers.
 */
export function useMemberValidation(): MemberValidationResult {
  // Use the memoized selector that joins members + wallet address
  const parsedMember = useAppSelector(selectParsedCurrentUserMember);
  const dbLoading = useAppSelector(selectDbLoading);

  // Adapt MemberData to the expected interface for components
  const memberData = useMemo(() => {
    if (!parsedMember.memberData) return null;

    const rawMemberData = parsedMember.memberData;
    const countryData = rawMemberData.country
      ? getCountryByCode(rawMemberData.country)
      : null;

    return {
      name: rawMemberData.fullName || rawMemberData.displayName,
      username: rawMemberData.displayName,
      email: rawMemberData.emailAddress,
      country: countryData?.name || rawMemberData.country || '',
      city: rawMemberData.city || '',
      bio: rawMemberData.bio || '',
    };
  }, [parsedMember.memberData]);

  return {
    isMember: parsedMember.isMember,
    isLoading: dbLoading,
    memberUtxo: parsedMember.memberUtxo,
    memberData,
  };
}
