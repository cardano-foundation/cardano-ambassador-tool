'use client';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import ExecuteSignoff from '@/components/ExecuteSignoff';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context';
import { parseProposalDatum, getCatConstants, getProvider } from '@/utils';
import { useState, useEffect } from 'react';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import { use } from 'react';


interface PageProps {
  params: Promise<{ txhash: string }>;
}

export default function TreasurySignoffDetailsPage({ params }: PageProps) {
  const { signOfApprovals, members, dbLoading, treasuryBalance, isTreasuryLoading } = useApp();
  const { txhash } = use(params);

  const proposal = signOfApprovals.find((utxo) => utxo.txHash === txhash);
  const memberUtxo = members.length > 0 ? members[0] : undefined;


  let proposalData: ProposalData;
  if (proposal && proposal.plutusData) {
    try {
      const { metadata } = parseProposalDatum(proposal.plutusData)!;
      proposalData = {
        title: metadata?.title,
        description: metadata?.description,
        fundsRequested: metadata?.fundsRequested || '0',
        receiverWalletAddress: metadata?.receiverWalletAddress,
        submittedByAddress: metadata?.submittedByAddress,
        status: 'ready',
      };
    } catch (error) {
      console.error('Error parsing proposal datum:', error);
      proposalData = {
        title: 'Error Loading Proposal',
        description: 'Could not parse proposal data',
        fundsRequested: '0',
        receiverWalletAddress: '',
        submittedByAddress: '',
        status: 'ready',
      };
    }
  } else {
    proposalData = {
      title: 'Error Loading Proposal',
      description: 'Could not parse proposal data',
      fundsRequested: '0',
      receiverWalletAddress: '',
      submittedByAddress: '',
      status: 'ready',
    };
  }

  // Convert BigInt to ADA for display
  const treasuryBalanceAda = Number(treasuryBalance) / 1_000_000;
  const proposalAmountAda = parseInt(proposalData?.fundsRequested || '0');

  if (dbLoading || isTreasuryLoading) {
    return <SimpleCardanoLoader />;
  }

  if (!proposal || !proposal.plutusData) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Treasury Sign-off Not Found
          </Title>
          <Paragraph className="text-muted-foreground mb-4">
            The treasury sign-off with hash {txhash} could not be found.
          </Paragraph>
          <Button variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getChipVariant = () => {
    switch (proposalData.status) {
      case 'pending':
        return 'warning';
      case 'submitted':
        return 'default';
      case 'under_review':
        return 'default';
      case 'approved':
        return 'success';
      case 'ready':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'inactive';
    }
  };

  return (
    <div className="container px-4 py-2 pb-8 sm:px-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Title level="5" className="text-foreground">
            {proposalData.title}
          </Title>
          <Chip variant={getChipVariant()} size="md" className="capitalize">
            {proposalData.status.replace('_', ' ')}
          </Chip>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div className="flex-1 space-y-7">
              <div className="space-y-1.5">
                <Paragraph size="xs" className="">
                  TxHash
                </Paragraph>
                <Copyable
                  withKey={false}
                  link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposal.txHash}`}
                  value={proposal.txHash}
                  keyLabel={''}
                />
              </div>
              <div className="space-y-1.5">
                <Paragraph size="xs" className="">
                  Receiver wallet
                </Paragraph>
                {proposalData.receiverWalletAddress ? (
                  <Copyable
                    withKey={false}
                    link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposalData.receiverWalletAddress}`}
                    value={proposalData.receiverWalletAddress}
                    keyLabel={''}
                  />
                ) : (
                  <Paragraph size="sm" className="text-foreground">
                    Not specified
                  </Paragraph>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-7">
              <div className="space-y-1.5">
                <Paragraph size="xs" className="">
                  Submitted by
                </Paragraph>
                <div className="flex flex-wrap items-start gap-1.5">
                  {proposalData.submittedByAddress ? (
                    <Copyable
                      withKey={false}
                      link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposalData.submittedByAddress}`}
                      value={proposalData.submittedByAddress}
                      keyLabel={''}
                    />
                  ) : (
                    !proposalData.submittedByAddress && (
                      <Paragraph size="sm" className="text-foreground">
                        Not specified
                      </Paragraph>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Paragraph size="xs" className="">
                  Funds Requested
                </Paragraph>
                <Paragraph size="sm" className="text-foreground">
                  {proposalData.fundsRequested}
                </Paragraph>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treasury Overview Section */}
        <Card>
          <CardContent className="p-6">
            <Title level="5" className="text-foreground mb-4 font-medium">
              Treasury Overview
            </Title>
            <div className="mb-6">
              <Paragraph className="text-muted-foreground text-sm mb-2">
                Treasury Address
              </Paragraph>
              <Copyable
                withKey={false}
                link={`${getCurrentNetworkConfig().explorerUrl}/address/${getCatConstants().scripts.treasury.spend.address}`}
                value={getCatConstants().scripts.treasury.spend.address}
                keyLabel={''}
              />
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-2">
                <Paragraph className="text-muted-foreground text-sm">
                  Total Treasury
                </Paragraph>
                <Title level="6" className="text-foreground font-semibold">
                  ₳{isTreasuryLoading ? '...' : Math.floor(treasuryBalanceAda).toLocaleString()}
                </Title>
              </div>
              <div className="space-y-2">
                <Paragraph className="text-muted-foreground text-sm">
                  Proposal Amount
                </Paragraph>
                <Title level="6" className="text-red-600 font-semibold">
                  ₳{proposalAmountAda.toLocaleString()}
                </Title>
              </div>
              <div className="space-y-2">
                <Paragraph className="text-muted-foreground text-sm">
                  Remaining After Approval
                </Paragraph>
                <Title level="6" className={treasuryBalanceAda < proposalAmountAda ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                  ₳{isTreasuryLoading ? '...' : Math.floor(treasuryBalanceAda - proposalAmountAda).toLocaleString()}
                </Title>
              </div>
            </div>
            
            {/* Insufficient Balance Warning */}
            {!isTreasuryLoading && treasuryBalanceAda < proposalAmountAda && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-orange-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    !
                  </div>
                  <div className="space-y-1">
                    <Paragraph className="text-orange-800 font-semibold text-sm">
                      Insufficient Treasury Balance
                    </Paragraph>
                    <Paragraph className="text-orange-700 text-sm">
                      The current available balance (₳{Math.floor(treasuryBalanceAda).toLocaleString()}) is lower than the requested amount (₳{proposalAmountAda.toLocaleString()}). Please adjust the requested funds before proceeding with sign-off.
                    </Paragraph>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Title level="5" className="text-foreground">
          Overview
        </Title>
        <Card>
          <div className="space-y-5">
            <div className="space-y-2.5">
              <Title level="6" className="text-foreground text-base">
                Title
              </Title>
              <RichTextDisplay
                content={proposalData.title}
                className="text-foreground"
              />
            </div>
            <div className="space-y-6">
              <Title level="6" className="text-foreground">
                Description
              </Title>
              <RichTextDisplay
                content={proposalData.description}
                className="text-foreground"
              />
            </div>
          </div>
        </Card>

        {/* Treasury Withdrawal */}
        <div className="space-y-4">
          <Title level="5" className="text-foreground">
            Treasury Withdrawal
          </Title>
          <Card>
            <div className="p-4">
              <ExecuteSignoff
                signoffApprovalUtxo={proposal}
                memberUtxo={memberUtxo}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
