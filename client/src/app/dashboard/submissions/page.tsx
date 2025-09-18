'use client';

import MembershipIntentTimeline from '@/components/MembershipIntentTimeline';
import TopNav from '@/components/Navigation/TabNav';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import Button from '@/components/atoms/Button';
import Empty from '@/components/atoms/Empty';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { useApp } from '@/context';
import {
  dbUtxoToMeshUtxo,
  getCatConstants,
  getProvider,
  parseMembershipIntentDatum,
} from '@/utils';
import {
  MemberData,
  membershipMetadata,
  UserActionTx,
} from '@sidan-lab/cardano-ambassador-tool';
import { Utxo } from '@types';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SubmissionsPage() {
  const tabs = [
    { id: 'membership', label: 'Membership Intent' },
    { id: 'proposals', label: 'Proposal' },
  ];

  const [activeTab, setActiveTab] = useState('membership');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [membershipUtxo, setMembershipUtxo] = useState<Utxo | null>(null);
  const [proposalUtxo, setProposalUtxo] = useState<Utxo | null>(null);
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
        return;
      }
      const parsed = parseMembershipIntentDatum(intent.plutusData);

      return parsed?.metadata.address === userAddress;
    });

    // Find proposal intent UTXO that belongs to the current user
    const userProposalIntent = proposalIntents.find((intent) => {
      if (!intent.plutusData) {
        return;
      }
      const parsed = parseMembershipIntentDatum(intent.plutusData);
      return parsed?.metadata.address === userAddress;
    });

    setMembershipUtxo(userMembershipIntent || null);
    setProposalUtxo(userProposalIntent || null);
    setLoading(false);
  }, [
    userAddress,
    membershipIntents,
    proposalIntents,
    dbLoading,
    isAuthenticated,
  ]);

  const handleRefresh = () => {
    console.log('[Submissions] Starting refresh...');
    setError(null); // Clear any existing errors
    
    // Sync membership intent data specifically
    syncData('membership_intent');
    
    // Also sync proposal intents if needed
    syncData('proposal_intent');
  };

  const handleMetadatUpdate = async (userMetadata: MemberData) => {
    const blockfrost = getProvider();
    const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
    const ORACLE_OUTPUT_INDEX = parseInt(
      process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
    );

    if (!membershipUtxo) {
      throw new Error('No token UTxO found for this membership intent');
      return;
    }

    const tokenUtxo = await import('@/utils/utils').then((utils) =>
      utils.findTokenUtxoByMembershipIntentUtxo(membershipUtxo),
    );

    console.log({ tokenUtxo, userMetadata, membershipUtxo });

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

    if (!userAddress || !userWallet) {
      throw new Error('User address or wallet not available');
    }

    const userAction = new UserActionTx(
      userAddress!,
      userWallet!,
      blockfrost,
      getCatConstants(),
    );
    const metadata = membershipMetadata({
      address: userAddress!,
      ...userMetadata,
    });

    const result = await userAction.updateMembershipIntentMetadata(
      oracleUtxo,
      tokenUtxo,
      dbUtxoToMeshUtxo(membershipUtxo),
      metadata,
    );

    // setResult(JSON.stringify(result, null, 2));
  };

  if (loading || dbLoading) {
    return <SimpleCardanoLoader />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Unable to Load Submissions
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

      {activeTab === 'membership' && (
        <div className="">
          {membershipUtxo ? (
            <MembershipIntentTimeline
              readonly={false}
              intentUtxo={membershipUtxo}
              onSave={handleMetadatUpdate}
            />
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <Empty />
              <div className="mt-6 max-w-md text-center">
                <Title level="6" className="text-foreground mb-3">
                  No Membership Submission
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

      {activeTab === 'proposals' && (
        <div className="">
          {proposalUtxo ? (
            <div className="bg-card rounded-lg border p-6">
              <Title level="3" className="text-foreground mb-4">
                Your Proposal Submission
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
                  No Proposal Submissions
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
    </div>
  );
}
