'use client';

import MembershipIntentTimeline from '@/components/MembershipIntentTimeline';
import TopNav from '@/components/Navigation/TabNav';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import TransactionConfirmationOverlay from '@/components/TransactionConfirmationOverlay';
import Button from '@/components/atoms/Button';
import Empty from '@/components/atoms/Empty';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { useApp } from '@/context';
import {
  dbUtxoToMeshUtxo,
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
import { Utxo, TransactionConfirmationResult } from '@types';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

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
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  
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
    refreshAttempts,
  ]);

  const handleRefresh = () => {
    setError(null);
    setRefreshAttempts((prev) => prev + 1);
    syncData('membership_intent');
    syncData('proposal_intent');
  };

  const handleMetadataUpdate = async (userMetadata: MemberData) => {
    try {
      const userAddress = await userWallet!.getChangeAddress();

      const membershipIntentUtxo = await findMembershipIntentUtxo(userAddress);

      if (!membershipIntentUtxo) {
        throw new Error('No membership intent UTxO found for this address');
      }

      // Find token UTxO by membership intent UTxO
      const tokenUtxo = await findTokenUtxoByMembershipIntentUtxo(membershipIntentUtxo);

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
          console.log('Transaction submitted:', { txHash, result });
        } else {
          console.error('Failed to compute transaction hash from txHex');
          console.log('Transaction result:', result);
        }
      } else {
        console.log('Transaction result (no txHex):', result);
      }
    } catch (error) {
      console.error('Error updating membership intent metadata:', error);
      // You might want to show an error toast or message here
      throw error;
    }
  };

  const handleTransactionConfirmed = useCallback((result: TransactionConfirmationResult) => {
    console.log('Transaction confirmed:', result);
    // Clear transaction state first to prevent re-triggering
    setIsTransactionPending(false);
    setTransactionHash(null);
    
    // Delay data refresh to allow state to settle
    setTimeout(() => {
      syncData('membership_intent');
      handleRefresh();
    }, 1000);
  }, [syncData]);

  const handleTransactionTimeout = useCallback((result: TransactionConfirmationResult) => {
    console.log('Transaction confirmation timed out:', result);
    // Clear transaction state first
    setIsTransactionPending(false);
    setTransactionHash(null);
    
    // Still refresh data as transaction might have gone through
    setTimeout(() => {
      syncData('membership_intent');
      handleRefresh();
    }, 1000);
  }, [syncData]);

  const handleCloseTransactionOverlay = useCallback(() => {
    setIsTransactionPending(false);
    setTransactionHash(null);
    
    // Refresh data when closing overlay
    setTimeout(() => {
      syncData('membership_intent');
      handleRefresh();
    }, 1000);
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
        <div className="flex items-center justify-between">
          <TopNav
            tabs={tabs}
            activeTabId={activeTab}
            onTabChange={setActiveTab}
          />
          <div className="px-4 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isSyncing || dbLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
              />
              {isSyncing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'membership-intent' && (
        <div className="">
          {membershipIntentUtxo ? (
            <MembershipIntentTimeline
              readonly={false}
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
                    <Button variant="outline">Browse Proposals</Button>
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
