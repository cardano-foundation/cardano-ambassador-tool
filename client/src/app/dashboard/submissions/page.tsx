'use client';

import TopNav from '@/components/Navigation/TabNav';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import OwnerMembershipTimeline from '@/components/Timelines/OwnerMembershipTimeline';
import TransactionConfirmationOverlay from '@/components/TransactionConfirmationOverlay';
import GlobalRefreshButton from '@/components/GlobalRefreshButton';
import Button from '@/components/atoms/Button';
import Empty from '@/components/atoms/Empty';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { useApp } from '@/context';
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
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function IntentSubmissionsPage() {
  const tabs = [
    { id: 'membership-intent', label: 'Membership Intent' },
    { id: 'proposal-intent', label: 'Proposal Intent' },
  ];

  const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
  const ORACLE_OUTPUT_INDEX = parseInt(
    process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
  );

  const blockfrost = getProvider();

  const [activeTab, setActiveTab] = useState('membership-intent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membershipIntentUtxo, setMembershipIntentUtxo] = useState<Utxo | null>(
    null,
  );
  const [proposalIntentUtxo, setProposalIntentUtxo] = useState<Utxo | null>(
    null,
  );

  // Transaction confirmation states
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const {
    membershipIntents,
    proposalIntents,
    dbLoading,
    isSyncing,
    userAddress,
    isAuthenticated,
    userWallet,
    syncData,
  } = useApp();

  useEffect(() => {
    if (dbLoading || !isAuthenticated) {
      return;
    }

    if (!userAddress) {
      setError('User address not available. Please connect your wallet.');
      setLoading(false);
      return;
    }

    // Find membership intent UTXO that belongs to the current user
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

    // Find proposal intent UTXO that belongs to the current user
    const userProposalIntent = proposalIntents.find((intent) => {
      if (!intent.plutusData) {
        return false;
      }
      try {
        // TODO: Add proper proposal intent datum parser
        const parsed = parseMembershipIntentDatum(intent.plutusData);
        return parsed?.metadata.walletAddress === userAddress;
      } catch (parseError) {
        return false;
      }
    });

    setMembershipIntentUtxo(userMembershipIntent || null);
    setProposalIntentUtxo(userProposalIntent || null);
    setLoading(false);
  }, [
    userAddress,
    membershipIntents,
    proposalIntents,
    dbLoading,
    isAuthenticated,
    isSyncing,
  ]);


  const handleMetadataUpdate = async (userMetadata: MemberData) => {
    try {
      const userAddress = await userWallet!.getChangeAddress();

      const membershipIntentUtxo = await findMembershipIntentUtxo(userAddress);

      if (!membershipIntentUtxo) {
        throw new Error('No membership intent UTxO found for this address');
      }

      // Find token UTxO by membership intent UTxO
      const tokenUtxo =
        await findTokenUtxoByMembershipIntentUtxo(membershipIntentUtxo);

      if (!tokenUtxo) {
        throw new Error('No token UTxO found for this membership intent');
      }

      // Find oracle UTxO
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
      });

      const result = await userAction.updateMembershipIntentMetadata(
        oracleUtxo,
        tokenUtxo!,
        membershipIntentUtxo!,
        metadata,
      );

      if (result?.txHex) {
        // Compute transaction hash from the transaction hex
        const txHash = resolveTxHash(result.txHex);

        if (txHash) {
          setTransactionHash(txHash);
          setIsTransactionPending(true);
                  } else {
          console.error('Failed to compute transaction hash from txHex');
                  }
      } else {
      }
    } catch (error) {
      console.error('Error updating membership intent metadata:', error);
      // You might want to show an error toast or message here
      throw error;
    }
  };

  const handleTransactionConfirmed = useCallback(
    async (result: TransactionConfirmationResult) => {
      // Clear transaction state first to prevent re-triggering
      setIsTransactionPending(false);
      setTransactionHash(null);

      // Invalidate cache before syncing to ensure fresh data
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            allUtxos: true,
            oracleAdmins: true 
          }),
        });
      } catch (error) {
        console.error('Cache invalidation error:', error);
      }

      // Delay data refresh to allow blockchain to settle and cache to clear
      setTimeout(() => {
        syncData('membership_intent');
      }, 2000); // Increased delay for blockchain propagation
    },
    [syncData],
  );

  const handleTransactionTimeout = useCallback(
    async (result: TransactionConfirmationResult) => {
      // Clear transaction state first
      setIsTransactionPending(false);
      setTransactionHash(null);

      // Invalidate cache before syncing (transaction might have gone through)
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            allUtxos: true,
            oracleAdmins: false 
          }),
        });
      } catch (error) {
        console.error('Cache invalidation error:', error);
      }

      // Still refresh data as transaction might have gone through
      setTimeout(() => {
        syncData('membership_intent');
      }, 2000);
    },
    [syncData],
  );

  const handleCloseTransactionOverlay = useCallback(async () => {
    setIsTransactionPending(false);
    setTransactionHash(null);

    // Invalidate cache before syncing
    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          allUtxos: true,
          oracleAdmins: true 
        }),
      });
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }

    // Refresh data when closing overlay
    setTimeout(() => {
      syncData('membership_intent');
    }, 2000);
  }, [syncData]);

  if (loading || dbLoading) {
    return <SimpleCardanoLoader />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Unable to Load Intent Submissions
          </Title>
          <Paragraph className="text-muted-foreground">{error}</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-2 pb-8 sm:space-y-6 sm:px-6">
      <div className="border-border bg-card border-b">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <TopNav
              tabs={tabs}
              activeTabId={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          <GlobalRefreshButton
            showLabel
            className="text-primary-base! mr-4 mb-2"
          />
        </div>
      </div>

      {activeTab === 'membership-intent' && (
        <div className="">
          {membershipIntentUtxo ? (
            <OwnerMembershipTimeline
              intentUtxo={membershipIntentUtxo}
              onSave={handleMetadataUpdate}
            />
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <Empty />
              <div className="mt-6 max-w-md text-center">
                <Title level="6" className="text-foreground mb-3">
                  No Membership Intent Submission
                </Title>
                <Paragraph className="text-muted-foreground mb-4">
                  You haven't submitted a membership intent yet. Start your
                  journey to become a Cardano Ambassador by submitting your
                  application.
                </Paragraph>
                <Paragraph className="text-muted-foreground mb-6 text-sm">
                  Just submitted an application? Click the refresh button above
                  to check for your latest submission.
                </Paragraph>
                <Link href="/sign-up">
                  <Button variant="primary" size="lg">
                    Become an Ambassador
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'proposal-intent' && (
        <div className="">
          {proposalIntentUtxo ? (
            <div className="bg-card rounded-lg border p-6">
              <Title level="3" className="text-foreground mb-4">
                Your Proposal Intent Submission
              </Title>
              <Paragraph className="text-muted-foreground">
                Proposal timeline and details will be displayed here.
              </Paragraph>
              {/* TODO: Add ProposalTimeline component similar to MembershipIntentTimeline */}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <Empty />
              <div className="mt-6 max-w-md text-center">
                <Title level="6" className="text-foreground mb-3">
                  No Proposal Intent Submissions
                </Title>
                <Paragraph className="text-muted-foreground mb-6">
                  You haven't submitted any proposals yet. Share your ideas and
                  contribute to the Cardano ecosystem by submitting a proposal.
                </Paragraph>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/proposals/new">
                    <Button variant="primary">Submit Proposal</Button>
                  </Link>
                  <Link href="/proposals">
                    <Button variant="outline" className="text-primary-base!">
                      Browse Proposals
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Confirmation Overlay */}
      <TransactionConfirmationOverlay
        isVisible={isTransactionPending}
        txHash={transactionHash || undefined}
        title="Updating Membership Intent"
        description="Please wait while your membership intent metadata is being updated on the blockchain."
        onClose={handleCloseTransactionOverlay}
        onConfirmed={handleTransactionConfirmed}
        onTimeout={handleTransactionTimeout}
      />
    </div>
  );
}
