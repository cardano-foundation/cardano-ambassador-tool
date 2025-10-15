'use client';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import TopNav from '@/components/Navigation/TabNav';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context';
import { parseProposalDatum } from '@/utils';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import { use, useRef, useState } from 'react';
import FormDetails from '../components/FormDetails';
import FormFunds from '../components/FormFunds';
import FormReview from '../components/FormReview';

interface PageProps {
  params: Promise<{ txhash: string }>;
}

export default function Page({ params }: PageProps) {
  const { proposalIntents, dbLoading, userAddress } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const { txhash } = use(params);

  const descriptionEditorRef = useRef<any>(null);

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

  const [formData, setFormData] = useState<ProposalData>(proposalData);

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

  const isOwner =
    userAddress && proposalData.submittedByAddress === userAddress;

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

  const handleInputChange = (field: keyof ProposalData, value: string) => {
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
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex-1 space-y-7">
            {/* <div className="space-y-1.5">
                <Paragraph
                  size="xs"
                  className="text-muted-foreground font-light"
                >
                  Proposal ID
                </Paragraph>
                <Paragraph size="sm" className="text-foreground">
                  {proposal.id}
                </Paragraph>
              </div> */}
            <div className="space-y-1.5">
              <Paragraph size="xs" className="text-muted-foreground font-light">
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
              <Paragraph size="xs" className="text-muted-foreground font-light">
                Submitted by
              </Paragraph>
              <div className="flex flex-wrap items-start gap-1.5">
                {proposalData.submittedByAddress && (
                  <Paragraph size="sm" className="text-foreground">
                    {proposalData.submittedByAddress}
                  </Paragraph>
                )}
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
              <Paragraph size="xs" className="text-muted-foreground font-light">
                Funds Requested
              </Paragraph>
              <Paragraph size="sm" className="text-foreground">
                {proposalData.fundsRequested}
              </Paragraph>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Title level="5" className="text-foreground">
            Overview
          </Title>
          {isOwner && (
            <div className="flex gap-3 sm:gap-4">
              {isEditing ? (
                <>
                  <div className="text-primary-base">
                    <Button variant="outline" onClick={handleDiscardChanges}>
                      Discard Changes
                    </Button>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveChanges}
                  >
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
          )}
        </div>
        {isEditing ? (
          <>
            <div className="border-border w-full border-b">
              <TopNav
                tabs={tabs}
                activeTabId={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
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
                  // proposalId={proposal.id}
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
              <RichTextDisplay
                content={proposalData.description}
                className="text-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
