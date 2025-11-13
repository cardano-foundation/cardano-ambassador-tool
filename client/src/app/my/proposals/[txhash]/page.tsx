'use client';
import FormDetails from '@/app/(home)/proposals/components/FormDetails';
import FormFunds from '@/app/(home)/proposals/components/FormFunds';
import FormReview from '@/app/(home)/proposals/components/FormReview';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import TopNav from '@/components/Navigation/TabNav';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import MultisigProgressTracker from '@/components/SignatureProgress/MultisigProgressTracker';
import ProposalDescription from '@/components/ProposalDescription';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context';
import { parseProposalDatum } from '@/utils';
import { storageApiClient } from '@/utils/storageApiClient';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import { AdminDecisionData } from '@types';
import { use, useRef, useState, useEffect } from 'react';

interface PageProps {
  params: Promise<{ txhash: string }>;
}

export default function Page({ params }: PageProps) {
  const { proposalIntents, dbLoading, userAddress } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [adminDecisionData, setAdminDecisionData] = useState<AdminDecisionData | null>(null);
  const { txhash } = use(params);

  const descriptionEditorRef = useRef<any>(null);

  useEffect(() => {
    const loadAdminDecision = async () => {
      if (!txhash) return;
      
      try {
        const decision = await storageApiClient.get<AdminDecisionData>(
          txhash,
          'submissions',
        );
        if (decision) {
          setAdminDecisionData(decision);
        }
      } catch (error) {
        console.error('Failed to load admin decision:', error);
      }
    };

    loadAdminDecision();
  }, [txhash]);

  const proposal = proposalIntents.find((utxo) => utxo.txHash === txhash);

  type ProposalFormData = ProposalData & { description: string };
  let proposalData: ProposalFormData;
  if (proposal && proposal.plutusData) {
    try {
      let metadata: any;
      let description = '';

      if (proposal.parsedMetadata) {
        try {
          const parsed = typeof proposal.parsedMetadata === 'string' 
            ? JSON.parse(proposal.parsedMetadata) 
            : proposal.parsedMetadata;
          metadata = parsed;
          description = parsed.description || '';
        } catch (e) {
          const { metadata: datumMetadata } = parseProposalDatum(proposal.plutusData)!;
          metadata = datumMetadata;
        }
      } else {
        const { metadata: datumMetadata } = parseProposalDatum(proposal.plutusData)!;
        metadata = datumMetadata;
      }

      proposalData = {
        title: metadata?.title,
        url: metadata?.url,
        description,
        fundsRequested: metadata?.fundsRequested || '0',
        receiverWalletAddress: metadata?.receiverWalletAddress,
        submittedByAddress: metadata?.submittedByAddress,
        status: 'pending',
      };
    } catch (error) {
      console.error('Error parsing proposal datum:', error);
      proposalData = {
        title: 'Error Loading Proposal',
        url: '',
        description: '',
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
      description: '',
      fundsRequested: '0',
      receiverWalletAddress: '',
      submittedByAddress: '',
      status: 'pending',
    };
  }

  const [formData, setFormData] = useState<ProposalFormData>({
    ...proposalData,
  });

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

  const isOwner = userAddress && proposalData.submittedByAddress === userAddress;

  if (!isOwner) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Access Denied
          </Title>
          <Paragraph className="text-muted-foreground mb-4">
            You can only view and edit your own proposals.
          </Paragraph>
          <Button variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'funds', label: 'Funds' },
    { id: 'review', label: 'Review' },
  ];

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

  const handleInputChange = (field: keyof ProposalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    setIsEditing(false);
  };

  const handleDiscardChanges = () => {
    setFormData(proposalData);
    setIsEditing(false);
    setActiveTab('details');
  };

  const handleTabNavigation = (direction: 'next' | 'prev') => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
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
                  <Paragraph size="sm" className="text-foreground">
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
                  {proposalData.fundsRequested}
                </Paragraph>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between">
          <Title level="5" className="text-foreground">
            Overview
          </Title>
          <div className="flex gap-3 sm:gap-4">
            {isEditing ? (
              <>
                <div className="text-primary-base">
                  <Button variant="outline" onClick={handleDiscardChanges}>
                    Discard Changes
                  </Button>
                </div>
                <Button variant="primary" size="sm" onClick={handleSaveChanges}>
                  Save proposal
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Proposal
              </Button>
            )}
          </div>
        </div>
        <Card>
          {isEditing ? (
            <>
              <div className="border-border  border-b mx-6 mb-6">
                <TopNav
                  tabs={tabs}
                  activeTabId={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              <div className="bg-card rounded-lg px-6 shadow-sm">
                {activeTab === 'details' && (
                  <FormDetails
                    mode="edit"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    descriptionEditorRef={descriptionEditorRef}
                  />
                )}

                {activeTab === 'funds' && (
                  <FormFunds
                    mode="edit"
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                )}

                {activeTab === 'review' && (
                  <FormReview
                    mode="edit"
                    formData={formData}
                    userAddress={proposalData.submittedByAddress}
                  />
                )}

                <div className="flex items-center justify-between gap-4 pt-6">
                  {activeTab !== 'details' && (
                    <div className="text-primary-base w-1/4">
                      <Button
                        variant="outline"
                        onClick={() => handleTabNavigation('prev')}
                        className="w-full"
                      >
                        Back
                      </Button>
                    </div>
                  )}

                  <div className={activeTab === 'details' ? 'w-full' : 'w-3/4'}>
                    {activeTab !== 'review' ? (
                      <Button
                        variant="primary"
                        onClick={() => handleTabNavigation('next')}
                        className="w-full"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleSaveChanges}
                        className="w-full"
                      >
                        Save Proposal
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
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
                <ProposalDescription
                  content={proposalData.description || 'No description available'}
                  className="text-foreground"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Admin Decision Status - Read Only */}
        {adminDecisionData && (
          <div className="space-y-4">
            <Title level="5" className="text-foreground">
              Admin Decision Status
            </Title>
            <Card>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
                        adminDecisionData.decision === 'approve'
                          ? 'border-green-500 bg-green-50 text-green-500'
                          : 'border-primary-base text-primary-base bg-red-50'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          adminDecisionData.decision === 'approve'
                            ? 'bg-green-500'
                            : 'bg-primary-base'
                        }`}
                      ></span>
                      {adminDecisionData.decision === 'approve'
                        ? 'Approved'
                        : 'Rejected'}
                    </div>
                  </div>
                  <Paragraph size="sm" className="text-muted-foreground">
                    Your proposal has been{' '}
                    {adminDecisionData.decision === 'approve'
                      ? 'approved'
                      : 'rejected'}{' '}
                    by an admin and is now proceeding through the multisig
                    approval process.
                  </Paragraph>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Multisig Progress - Read Only */}
        {adminDecisionData && (
          <div className="space-y-4">
            <Title level="5" className="text-foreground">
              Signature Progress
            </Title>
            <Card>
              <div className="p-6">
                <div className="space-y-3">
                  <Paragraph size="sm" className="text-muted-foreground">
                    Track the progress of required admin signatures for your
                    proposal.
                  </Paragraph>
                  <MultisigProgressTracker
                    txhash={proposal?.txHash}
                    adminDecisionData={adminDecisionData}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
