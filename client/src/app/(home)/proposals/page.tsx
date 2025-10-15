'use client';
import { useState, useRef } from 'react';
import Title from '@/components/atoms/Title';
import Paragraph from '@/components/atoms/Paragraph';
import Copyable from '@/components/Copyable';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import { getCurrentNetworkConfig } from '@/config/cardano';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import TopNav from '@/components/Navigation/TabNav';
import { mockProposal } from '@/hooks/UseProposalData';
import FormDetails from './components/FormDetails';
import FormFunds from './components/FormFunds';
import FormReview from './components/FormReview';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';

export default function Page() {
  const proposal = mockProposal;
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const descriptionEditorRef = useRef<any>(null);

  const [formData, setFormData] = useState<ProposalData>(proposal);

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'funds', label: 'Funds' },
    { id: 'review', label: 'Review' }
  ];

  const getChipVariant = () => {
    switch (proposal.status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'default';
      case 'rejected': return 'error';
      default: return 'inactive';
    }
  };

  const handleInputChange = (field: keyof ProposalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    console.log('Saving edited proposal...', formData);
    setIsEditing(false);
  };

  const handleDiscardChanges = () => {
    setFormData(proposal);
    setIsEditing(false);
    setActiveTab('details');
  };

  const handleTabNavigation = (direction: 'next' | 'prev') => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Title level="5" className="text-foreground">
              {proposal.title}
            </Title>
            <Chip variant={getChipVariant()} size="md" className="capitalize">
              {proposal.status}
            </Chip>
          </div>
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div className="flex-1 space-y-7">
              <div className="space-y-1.5">
                <Paragraph
                  size="xs"
                  className="text-muted-foreground font-light"
                >
                  Proposal ID
                </Paragraph>
                {/* <Paragraph size="sm" className="text-foreground">{proposal.id}</Paragraph> */}
              </div>
              <div className="space-y-1.5">
                <Paragraph
                  size="xs"
                  className="text-muted-foreground font-light"
                >
                  Receiver wallet
                </Paragraph>
                {proposal.receiverWalletAddress ? (
                  <Copyable
                    withKey={false}
                    link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposal.receiverWalletAddress}`}
                    value={proposal.receiverWalletAddress}
                    keyLabel={''}
                  />
                ) : (
                  <Paragraph size="sm" className="text-foreground">
                    Not specified
                  </Paragraph>
                )}
              </div>
              {/* {proposal.policyId && (
                <div className="space-y-1.5">
                  <Paragraph size="xs" className="text-muted-foreground font-light">Policy ID</Paragraph>
                  <Copyable
                    withKey={false}
                    link={`${getCurrentNetworkConfig().explorerUrl}/policy/${proposal.policyId}`}
                    value={proposal.policyId}
                    keyLabel={''}
                  />
                </div>
              )} */}
            </div>

            <div className="flex-1 space-y-7">
              <div className="space-y-1.5">
                <Paragraph
                  size="xs"
                  className="text-muted-foreground font-light"
                >
                  Submitted by
                </Paragraph>
                <div className="flex flex-wrap items-start gap-1.5">
                  {proposal.submittedByAddress && (
                    <Paragraph size="sm" className="text-foreground">
                      {proposal.submittedByAddress}
                    </Paragraph>
                  )}
                  {proposal.submittedByAddress ? (
                    <Copyable
                      withKey={false}
                      link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposal.submittedByAddress}`}
                      value={proposal.submittedByAddress}
                      keyLabel={''}
                    />
                  ) : (
                    !proposal.submittedByAddress && (
                      <Paragraph size="sm" className="text-foreground">
                        Not specified
                      </Paragraph>
                    )
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Paragraph
                  size="xs"
                  className="text-muted-foreground font-light"
                >
                  Funds Requested
                </Paragraph>
                <Paragraph size="sm" className="text-foreground">
                  {proposal.fundsRequested}
                </Paragraph>
              </div>
            </div>
          </div>

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
                    userAddress={proposal.submittedByAddress}
                    // proposalId={proposal}
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
                  content={proposal.title}
                  className="text-foreground"
                />
              </div>
              <div className="space-y-6">
                <Title level="6" className="text-foreground">
                  Description
                </Title>
                <RichTextDisplay
                  content={proposal.description}
                  className="text-foreground"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}