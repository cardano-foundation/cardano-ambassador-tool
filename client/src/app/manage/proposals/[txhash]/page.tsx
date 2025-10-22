'use client';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import MultisigProgressTracker from '@/components/SignatureProgress/MultisigProgressTracker';
import ApproveReject from '@/components/RejectApprove';
import FinalizeDecision from '@/components/FinalizeDecision';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context';
import { parseProposalDatum } from '@/utils';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import { AdminDecisionData } from '@types';
import { use, useState } from 'react';

interface PageProps {
  params: Promise<{ txhash: string }>;
}

export default function Page({ params }: PageProps) {
  const { proposalIntents, dbLoading } = useApp();
  const [adminDecisionData, setAdminDecisionData] = useState<AdminDecisionData | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const { txhash } = use(params);

  const proposal = proposalIntents.find((utxo) => utxo.txHash === txhash);

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
        status: 'pending',
      };
    } catch (error) {
      console.error('Error parsing proposal datum:', error);
      proposalData = {
        title: 'Error Loading Proposal',
        description: 'Could not parse proposal data',
        fundsRequested: '0',
        receiverWalletAddress: '',
        submittedByAddress: '',
        status: 'pending',
      };
    }
  } else {
    proposalData = {
      title: 'Error Loading Proposal',
      description: 'Could not parse proposal data',
      fundsRequested: '0',
      receiverWalletAddress: '',
      submittedByAddress: '',
      status: 'pending',
    };
  }

  if (dbLoading) {
    return <SimpleCardanoLoader />;
  }

  if (!proposal || !proposal.plutusData) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Proposal Not Found
          </Title>
          <Paragraph className="text-muted-foreground mb-4">
            The proposal with hash {txhash} could not be found.
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
      case 'rejected':
        return 'error';
      default:
        return 'inactive';
    }
  };

  const handleAdminDecisionUpdate = (data: AdminDecisionData | null) => {
    setAdminDecisionData(data);
  };
  const handleFinalizationComplete = () => {
    setIsFinalized(true);
  };
  const statusLabel = proposalData.status.replace('_', ' ');
  return (
    <div className="container px-4 py-2 pb-8 sm:px-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Title level="5" className="text-foreground">
            {proposalData.title}
          </Title>
          <Chip 
            variant={getChipVariant()} 
            size="md" 
            className="capitalize"
            aria-label={`Current status: ${statusLabel}`}
          >
            {statusLabel}
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
                  Receiver Wallet
                </Paragraph>
                {proposalData.receiverWalletAddress ? (
                  <Copyable
                    withKey={false}
                    link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposalData.receiverWalletAddress}`}
                    value={proposalData.receiverWalletAddress}
                    keyLabel={''}
                  />
                ) : (
                  <Paragraph 
                    size="sm" 
                    className="text-foreground"
                    aria-label="Receiver wallet address not specified"
                  >
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
                <Paragraph 
                  size="sm" 
                  className="text-foreground"
                >
                  {proposalData.fundsRequested}
                </Paragraph>
              </div>
            </div>
          </CardContent>
        </Card>
        <div 
          role="region"
          aria-label="Proposal overview"
        >
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
        </div>
        <div className="space-y-4">
          <Title level="5" className="text-foreground">
            Admin Review
          </Title>
          <Card>
            <div className="p-6">
              <ApproveReject
                intentUtxo={proposal}
                context={'ProposalIntent'}
                onDecisionUpdate={handleAdminDecisionUpdate}
                aria-label="Approve or reject proposal"
              />
            </div>
          </Card>
        </div>
        {adminDecisionData && (
          <div className="space-y-4">
            <Title level="5" className="text-foreground">
              Multisig Progress
            </Title>
            <Card>
              <div className="p-6">
                <MultisigProgressTracker
                  txhash={proposal?.txHash}
                  adminDecisionData={adminDecisionData}
                  aria-label="Multisignature progress tracker"
                />
              </div>
            </Card>
          </div>
        )}
        {adminDecisionData && (
          <div 
            className="space-y-4"
            role="region"
            aria-label="Finalize decision section"
          >
            <Title level="5" className="text-foreground">
              Finalize Decision
            </Title>
            <Card>
              <div className="p-6">
                <FinalizeDecision
                  txhash={proposal?.txHash}
                  adminDecisionData={adminDecisionData}
                  context={'ProposalIntent'}
                  onFinalizationComplete={handleFinalizationComplete}
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}