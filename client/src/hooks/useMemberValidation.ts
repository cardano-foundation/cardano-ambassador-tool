import { useApp } from '@/context';
import { getCountryByCode } from '@/utils';
import { Utxo } from '@types';
import { MemberData } from '@sidan-lab/cardano-ambassador-tool';
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

export function useMemberValidation(): MemberValidationResult {
  const { isMember, memberValidationLoading, memberUtxo, memberData: rawMemberData } = useApp();

  // Adapt MemberData to the expected interface for components
  const memberData = useMemo(() => {
    if (!rawMemberData) return null;
    
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
  }, [rawMemberData]);

  return {
    isMember,
    isLoading: memberValidationLoading,
    memberUtxo,
    memberData,
  };
}
