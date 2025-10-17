'use client';
import TransactionConfirmationOverlay from '@/components/TransactionConfirmationOverlay';
import { useApp } from '@/context';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import {
  findMemberUtxo,
  findTokenUtxoByMemberUtxo,
  getCatConstants,
  getProvider,
} from '@/utils';
import { resolveTxHash } from '@meshsdk/core';
import {
  MemberData,
  membershipMetadata,
  UserActionTx,
} from '@sidan-lab/cardano-ambassador-tool';
import { TransactionConfirmationResult } from '@types';
import { useCallback, useMemo, useState } from 'react';
import DashboardHeader from '../_component/DashboardHeader';
import MemberOnlyAccessCard from '../_component/MemberOnlyAccessCard';
import ProfileDetails from '../_component/ProfileDetails';
import ProfileEditModal from '../_component/ProfileEditModal';
import ProfileHeader from '../_component/ProfileHeader';

export default function ProfilesPage() {
  const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
  const ORACLE_OUTPUT_INDEX = parseInt(
    process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
  );

  const blockfrost = getProvider();
  const { userWallet, syncData, wallet, memberData, isMember } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Transaction confirmation states
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const profileData = useMemo(() => {
    if (!memberData) {
      return {
        name: '',
        username: '',
        country: '',
        city: '',
        bio_excerpt: '',
        created_at: '',
        email: '',
      };
    }

    return {
      name: memberData.fullName,
      username: memberData.displayName,
      email: memberData.emailAddress,
      country: memberData.country,
      city: memberData.city,
      bio_excerpt: memberData.bio,
      created_at: '',
    };
  }, [memberData]);

  const { profile, loading: forumLoading } = useAmbassadorProfile(
    profileData.username,
  );

  const displayProfile = {
    name: profileData.name,
    country: profileData.country,
    city: profileData.city,
    email: profileData.email,
    username: profileData.username,
    bio: profileData.bio_excerpt ?? profile?.bio_excerpt,
    spoId: '',
    discord: '',
    twitter: '',
    github: '',
    href: profile?.href,
  };

  const stats = forumLoading
    ? null
    : profile?.summary.stats || {
        topics_created: 0,
        likes_given: 0,
        likes_received: 0,
        days_visited: 0,
        replies_created: 0,
      };

  function handleWithdrawRole(): void {
    throw new Error('Function not implemented.');
  }

  function handleEditProfile(): void {
    setIsEditModalOpen(true);
  }

  function handleCloseEditModal(): void {
    setIsEditModalOpen(false);
  }

  const handleSaveProfile = async (updatedProfile: any): Promise<void> => {
    try {
      const userAddress = await userWallet!.getChangeAddress();

      const membershipUtxo = await findMemberUtxo(userAddress);

      if (!membershipUtxo) {
        throw new Error('No membership intent UTxO found for this address');
      }

      const tokenUtxo = await findTokenUtxoByMemberUtxo(membershipUtxo);

      if (!tokenUtxo) {
        throw new Error('No token UTxO found for this membership intent');
      }

      const oracleUtxos = await blockfrost.fetchUTxOs(
        ORACLE_TX_HASH,
        ORACLE_OUTPUT_INDEX,
      );

      const oracleUtxo = oracleUtxos[0];

      if (!oracleUtxo) {
        throw new Error('Failed to fetch required oracle UTxO');
      }

      const userAction = new UserActionTx(
        userAddress!,
        userWallet!,
        blockfrost,
        getCatConstants(),
      );

      // Map the profile data to the expected MemberData format
      const userMetadata: MemberData = {
        walletAddress: userAddress,
        fullName: updatedProfile.name || '',
        displayName: updatedProfile.username || '',
        emailAddress: updatedProfile.email || '',
        bio: updatedProfile.bio || '',
        country: updatedProfile.country || '',
        city: updatedProfile.city || '',
      };

      const metadata = membershipMetadata(userMetadata);

      const result = await userAction.updateMemberMetadata(
        oracleUtxo,
        membershipUtxo!,
        tokenUtxo!,
        metadata,
      );

      if (result?.txHex) {
        const txHash = resolveTxHash(result.txHex);

        if (txHash) {
          setTransactionHash(txHash);
          setIsTransactionPending(true);
          setIsEditModalOpen(false);
        } else {
          console.error('Failed to compute transaction hash from txHex');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleTransactionConfirmed = useCallback(
    async (result: TransactionConfirmationResult) => {
      setIsTransactionPending(false);
      setTransactionHash(null);

      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            allUtxos: true,
            oracleAdmins: true,
          }),
        });
      } catch (error) {
        console.error('Cache invalidation error:', error);
      }

      setTimeout(() => {
        syncData('membership_intent');
      }, 2000);
    },
    [syncData],
  );

  const handleTransactionTimeout = useCallback(
    async (result: TransactionConfirmationResult) => {
      setIsTransactionPending(false);
      setTransactionHash(null);

      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            allUtxos: true,
            oracleAdmins: false,
          }),
        });
      } catch (error) {
        console.error('Cache invalidation error:', error);
      }

      setTimeout(() => {
        syncData('membership_intent');
      }, 2000);
    },
    [syncData],
  );

  const handleCloseTransactionOverlay = useCallback(async () => {
    setIsTransactionPending(false);
    setTransactionHash(null);

    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allUtxos: true,
          oracleAdmins: true,
        }),
      });
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }

    setTimeout(() => {
      syncData('membership_intent');
    }, 2000);
  }, [syncData]);

  // Show member-only access if user is not a member
  if (!isMember) {
    return (
      <MemberOnlyAccessCard
        title="Members Only"
        description="Access to the profile dashboard is restricted to approved Cardano Ambassadors. Join our ambassador program to create and manage your profile."
        feature="access your profile dashboard"
      />
    );
  }

  return (
    <div className="bg-background min-h-screen lg:p-6">
      <DashboardHeader />

      <div className="px-6">
        <ProfileHeader
          name={displayProfile.name}
          country={displayProfile.country}
          stats={stats}
        />

        <ProfileDetails
          profile={displayProfile}
          walletAddress={wallet?.address!}
          onWithdrawRole={handleWithdrawRole}
          onEditProfile={handleEditProfile}
        />
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        profile={displayProfile}
        onClose={handleCloseEditModal}
        onSave={handleSaveProfile}
      />

      {/* Transaction Confirmation Overlay */}
      <TransactionConfirmationOverlay
        isVisible={isTransactionPending}
        txHash={transactionHash || undefined}
        title="Updating Profile"
        description="Please wait while your profile is being updated on the blockchain."
        onClose={handleCloseTransactionOverlay}
        onConfirmed={handleTransactionConfirmed}
        onTimeout={handleTransactionTimeout}
      />
    </div>
  );
}
