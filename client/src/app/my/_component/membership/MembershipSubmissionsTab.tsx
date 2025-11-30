'use client';

import OwnerMembershipTimeline from '@/components/Timelines/OwnerMembershipTimeline';
import TransactionConfirmationOverlay from '@/components/TransactionConfirmationOverlay';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { useApp } from '@/context';
import { useMemberValidation } from '@/hooks';
import {
  findMembershipIntentUtxo,
  findTokenUtxoByMembershipIntentUtxo,
  getCatConstants,
  getProvider,
  parseMembershipIntentDatum,
} from '@/utils';
import { resolveTxHash } from '@meshsdk/core';
import {
  MemberData,
  membershipMetadata,
  UserActionTx,
} from '@sidan-lab/cardano-ambassador-tool';
import { TransactionConfirmationResult, Utxo } from '@types';
import { useCallback, useEffect, useState } from 'react';
import EmptyMembershipState from './EmptyMembershipState';
import MemberStatusCard from './MemberStatusCard';

export default function MembershipSubmissionsTab() {
  const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
  const ORACLE_OUTPUT_INDEX = parseInt(
    process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
  );

  const blockfrost = getProvider();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membershipIntentUtxo, setMembershipIntentUtxo] = useState<Utxo | null>(
    null,
  );
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const {
    membershipIntents,
    dbLoading,
    isSyncing,
    userAddress,
    isAuthenticated,
    userWallet,
    syncData,
  } = useApp();
  const { memberUtxo, memberData } = useMemberValidation();

  useEffect(() => {
    if (dbLoading || !isAuthenticated) {
      return;
    }

    if (!userAddress) {
      setError('User address not available. Please connect your wallet.');
      setLoading(false);
      return;
    }

    const userMembershipIntent = membershipIntents.find((intent) => {
      if (!intent.plutusData) {
        return false;
      }

      try {
        const parsed = parseMembershipIntentDatum(intent.plutusData);
        return parsed?.metadata.walletAddress === userAddress;
      } catch (parseError) {
        return false;
      }
    });

    setMembershipIntentUtxo(userMembershipIntent || null);
    setLoading(false);
  }, [userAddress, membershipIntents, dbLoading, isAuthenticated, isSyncing]);

  const handleMetadataUpdate = async (userMetadata: MemberData) => {
    try {
      if (!userAddress) {
        return;
      }
      const membershipIntentUtxo = await findMembershipIntentUtxo(userAddress);

      if (!membershipIntentUtxo) {
        throw new Error(
          'No membership application UTxO found for this address',
        );
      }

      const tokenUtxo =
        await findTokenUtxoByMembershipIntentUtxo(membershipIntentUtxo);

      if (!tokenUtxo) {
        throw new Error('No token UTxO found for this membership application');
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

      const metadata = membershipMetadata({
        walletAddress: userMetadata.walletAddress,
        fullName: userMetadata.fullName || '',
        displayName: userMetadata.displayName || '',
        emailAddress: userMetadata.emailAddress || '',
        bio: userMetadata.bio || '',
        country: userMetadata.country || '',
        city: userMetadata.city || '',
        x_handle: userMetadata.x_handle || '',
        github: userMetadata.github || '',
        discord: userMetadata.discord || '',
        spo_id: userMetadata.spo_id || '',
      });

      const result = await userAction.updateMembershipIntentMetadata(
        oracleUtxo,
        tokenUtxo!,
        membershipIntentUtxo!,
        metadata,
      );

      if (result?.txHex) {
        const txHash = resolveTxHash(result.txHex);

        if (txHash) {
          setTransactionHash(txHash);
          setIsTransactionPending(true);
        } else {
          console.error('Failed to compute transaction hash from txHex');
        }
      }
    } catch (error) {
      console.error('Error updating membership application metadata:', error);
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

  if (loading || dbLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Loading membership status...
          </Title>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Unable to Load Membership Status
          </Title>
          <Paragraph className="text-muted-foreground">{error}</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {memberUtxo && memberData && <MemberStatusCard />}

      {membershipIntentUtxo ? (
        <OwnerMembershipTimeline
          intentUtxo={membershipIntentUtxo}
          onSave={handleMetadataUpdate}
        />
      ) : (
        !memberUtxo && <EmptyMembershipState />
      )}

      <TransactionConfirmationOverlay
        isVisible={isTransactionPending}
        txHash={transactionHash || undefined}
        title="Updating Membership Application"
        description="Please wait while your membership application metadata is being updated on the blockchain."
        onClose={handleCloseTransactionOverlay}
        onConfirmed={handleTransactionConfirmed}
        onTimeout={handleTransactionTimeout}
      />
    </div>
  );
}
