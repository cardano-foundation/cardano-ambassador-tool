'use client';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import ProposalDescription from '@/components/ProposalDescription';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context';
import { parseProposalDatum, formatAdaAmount } from '@/utils';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import { use } from 'react';

interface PageProps {
  params: Promise<{ txhash: string }>;
}

export default function Page({ params }: PageProps) {
  const { proposals, proposalIntents, signOfApprovals, dbLoading } = useApp();
  const { txhash } = use(params);

  const allProposals = [...proposalIntents, ...proposals, ...signOfApprovals];
  const proposal = allProposals.find((utxo) => utxo.txHash === txhash);

  let proposalData: ProposalData & { description?: string };
  if (proposal && proposal.parsedMetadata) {
    try {
      const metadata = typeof proposal.parsedMetadata === 'string' 
        ? JSON.parse(proposal.parsedMetadata) 
        : proposal.parsedMetadata;
      proposalData = {
        title: metadata?.title,
        url: metadata?.url,
        description: metadata?.description,
        fundsRequested: metadata?.fundsRequested || '0',
        receiverWalletAddress: metadata?.receiverWalletAddress,
        submittedByAddress: metadata?.submittedByAddress,
        status: signOfApprovals.some(p => p.txHash === txhash) 
          ? 'signoff_pending' 
          : proposals.some(p => p.txHash === txhash) 
          ? 'approved' 
          : 'pending',
      };
    } catch (error) {
      console.error('Error parsing proposal metadata:', error);
      proposalData = {
        title: 'Error Loading Proposal',
        url: '',
        fundsRequested: '0',
        receiverWalletAddress: '',
        submittedByAddress: '',
        status: 'pending',
      };
    }
  } else {
    proposalData = {
      title: 'Error Loading Proposal',
      url: '',
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
          <Button variant="primary" onClick={() => window.history.back()} >
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
      case 'signoff_pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'inactive';
    }
  };
  const statusLabel = proposalData.status === 'signoff_pending' 
    ? 'Awaiting Signoff' 
    : proposalData.status.replace('_', ' ');

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
            aria-label={`Status: ${statusLabel}`} 
          >
            {statusLabel}
          </Chip>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-10 sm:flex-row sm:justify-between" >
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
                  <Paragraph size="sm" className="text-foreground" >
                    Not specified
                  </Paragraph>
                )}
              </div>
              <div className="space-y-1.5">
                <Paragraph size="xs" className="">
                  Submitted By
                </Paragraph>
                {proposalData.submittedByAddress ? (
                  <Copyable
                    withKey={false}
                    link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposalData.submittedByAddress}`}
                    value={proposalData.submittedByAddress}
                    keyLabel={''}
                  />
                ) : (
                  <Paragraph size="sm" className="text-foreground" >
                    Not specified
                  </Paragraph>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-7">
              <div className="space-y-1.5">
                <Paragraph size="xs" className="">
                  Funds Requested
                </Paragraph>
                <Paragraph size="sm" className="text-foreground">
                  {proposalData.fundsRequested && proposalData.fundsRequested !== '0' ? formatAdaAmount(proposalData.fundsRequested) : 'N/A'}
                </Paragraph>
              </div>
            </div>
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
                  className="text-foreground"/>
              </div>
              <div className="space-y-6">
                <Title level="6" className="text-foreground">
                  Description
                </Title>
                <ProposalDescription
                  content={proposalData.description || 'No description available'}
                  className="text-foreground"
                />
              </div>
            </div>
          </Card>
      </div>
    </div>
  );
}