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
import ApproveSignoff from '@/components/ApproveSignoff';
import FinalizeSignoffApproval from '@/components/FinalizeSignoffApproval';
import ExecuteSignoff from '@/components/ExecuteSignoff';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context';
import { formatAdaAmount, parseProposalDatum } from '@/utils';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import { AdminDecisionData } from '@types';
import { use, useState } from 'react';

interface PageProps {
  params: Promise<{ txhash: string }>;
}

export default function Page({ params }: PageProps) {
  const { proposalIntents, proposals, signOfApprovals, members, dbLoading } = useApp();
  const [adminDecisionData, setAdminDecisionData] = useState<AdminDecisionData | null>(null);
  const [signoffDecisionData, setSignoffDecisionData] = useState<AdminDecisionData | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isSignoffFinalized, setIsSignoffFinalized] = useState(false);
  const { txhash } = use(params);


  const allProposals = [...proposalIntents, ...proposals, ...signOfApprovals];
  const proposal = allProposals.find((utxo) => utxo.txHash === txhash);

  const signoffApprovalUtxo = signOfApprovals.find((utxo) => utxo.txHash === txhash);
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
        status: signOfApprovals.some(p => p.txHash === txhash)
          ? 'signoff_pending'
          : proposals.some(p => p.txHash === txhash)
          ? 'approved'
          : 'pending',
      };
    } catch (error) {
      console.error('Error parsing proposal datum:', error);
      const isApproved = proposals.some(p => p.txHash === txhash);
      proposalData = {
        title: 'Error Loading Proposal',
        description: 'Could not parse proposal data',
        fundsRequested: '0',
        receiverWalletAddress: '',
        submittedByAddress: '',
        status: isApproved ? 'approved' : 'pending',
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
      case 'signoff_pending':
        return 'warning';
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
  const handleSignoffDecisionUpdate = (data: AdminDecisionData | null) => {
    setSignoffDecisionData(data);
  };
  const handleSignoffFinalizationComplete = () => {
    setIsSignoffFinalized(true);
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
                <Paragraph size="sm" className="text-foreground">
                  {formatAdaAmount(proposalData.fundsRequested)}
                </Paragraph>
              </div>
            </div>
          </CardContent>
        </Card>
        <div role="region" aria-label="Proposal overview">
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
        {proposalData.status === 'pending' && (
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
        )}
        {adminDecisionData && proposalData.status === 'pending' && (
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
        {adminDecisionData && proposalData.status === 'pending' && (
          <div className="space-y-4">
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

        {/* Signoff Workflow for Approved Proposals */}
        {proposalData.status === 'approved' && (
          <>
            {/* Step 1: Approve Signoff */}
            <div className="space-y-4">
              <Title level="5" className="text-foreground">
                Signoff Approval
              </Title>
              <Card>
                <div className="p-6">
                  <ApproveSignoff
                    proposalUtxo={proposal}
                    onDecisionUpdate={handleSignoffDecisionUpdate}
                    aria-label="Approve signoff for proposal"
                  />
                </div>
              </Card>
            </div>

            {/* Step 2: Multisig Progress for Signoff */}
            {signoffDecisionData && (
              <div className="space-y-4">
                <Title level="5" className="text-foreground">
                  Signoff Multisig Progress
                </Title>
                <Card>
                  <div className="p-6">
                    <MultisigProgressTracker
                      txhash={proposal?.txHash}
                      adminDecisionData={signoffDecisionData}
                      aria-label="Signoff multisignature progress tracker"
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* Step 3: Finalize Signoff Approval */}
            {signoffDecisionData && (
              <div className="space-y-4">
                <Title level="5" className="text-foreground">
                  Execute Signoff Approval
                </Title>
                <Card>
                  <div className="p-6">
                    <FinalizeSignoffApproval
                      txhash={proposal?.txHash}
                      adminDecisionData={signoffDecisionData}
                      onFinalizationComplete={handleSignoffFinalizationComplete}
                      aria-label="Execute signoff approval"
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* Step 4: Final SignOff (Multisig) - Requires Admin API or Server-side Implementation */}
            {signoffApprovalUtxo && (
              <div className="space-y-4">
                <Title level="5" className="text-foreground">
                  Final Treasury Withdrawal
                </Title>
                <Card>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                            i
                          </div>
                          <div className="space-y-2">
                            <Title
                              level="6"
                              className="font-semibold text-blue-800"
                            >
                              Admin Multi-signature Required
                            </Title>
                            <Paragraph className="text-sm text-blue-700">
                              The final treasury withdrawal (SignOff) requires
                              multiple admin signatures and cannot be executed
                              directly from the browser. This step needs to be
                              completed using the admin dashboard or server-side
                              API with access to admin wallets.
                            </Paragraph>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
