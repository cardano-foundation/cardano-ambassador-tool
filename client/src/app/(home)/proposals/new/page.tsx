'use client';

import MemberOnlyAccessCard from '@/app/my/_component/MemberOnlyAccessCard';
import Button from '@/components/atoms/Button';
import Modal from '@/components/atoms/Modal';
import Title from '@/components/atoms/Title';
import TopNav from '@/components/Navigation/TabNav';
import CardanoLoaderSVG from '@/components/ui/CardanoLoaderSVG';
import { routes } from '@/config/routes';
import { useApp } from '@/context';
import { useMemberValidation } from '@/hooks/useMemberValidation';
import {
  adaToLovelace,
  dbUtxoToMeshUtxo,
  findTokenUtxoByMemberUtxo,
  getCatConstants,
  getProvider,
  parseAdaInput,
  smoothScrollToElement,
} from '@/utils';
import { resolveTxHash } from '@meshsdk/core';
import {
  ProposalData,
  proposalMetadata,
  UserActionTx,
} from '@sidan-lab/cardano-ambassador-tool';
import { useEffect, useRef, useState } from 'react';
import DetailsTab from './components/DetailsTab';
import FundsTab from './components/FundsTab';
import ReviewTab from './components/ReviewTab';

type ProposalFormData = ProposalData & {
  description: string;
};

export default function SubmitProposalPage() {
  const {
    isAuthenticated,
    userWallet,
    memberUtxo,
    userAddress,
    showTxConfirmation,
  } = useApp();
  const { isMember, isLoading: memberLoading } = useMemberValidation();
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markdownData, setMarkdownData] = useState<any>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState<string>('');
  const [githubFilename, setGithubFilename] = useState<string>('');
  const descriptionEditorRef = useRef<any>(null);
  const impactEditorRef = useRef<any>(null);
  const objectivesEditorRef = useRef<any>(null);
  const milestonesEditorRef = useRef<any>(null);
  const budgetBreakdownEditorRef = useRef<any>(null);
  const impactOnEcosystemEditorRef = useRef<any>(null);
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
  const ORACLE_OUTPUT_INDEX = parseInt(
    process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
  );

  const blockfrost = getProvider();
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    description: '',
    url: '',
    fundsRequested: '',
    receiverWalletAddress: '',
    submittedByAddress: userAddress || '',
    status: 'pending',
  });

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'funds', label: 'Funds' },
    { id: 'review', label: 'Review' },
  ];

  useEffect(() => {
    if (
      userAddress &&
      (!formData.submittedByAddress || formData.submittedByAddress === '')
    ) {
      setFormData((prev) => ({
        ...prev,
        submittedByAddress: userAddress,
      }));
    }
  }, [userAddress]);

  if (!isMember) {
    return (
      <MemberOnlyAccessCard
        title="Members Only: Submit Proposals"
        description="Only approved Cardano Ambassadors can submit proposals to the community. Join our ambassador program to contribute your ideas and help shape the Cardano ecosystem."
        feature="submit proposals"
      />
    );
  }

  const handleInputChange = (field: keyof ProposalFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    let filename = '';

    try {
      setIsSubmitting(true);

      const saveResponse = await fetch('/api/proposal-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          submitterAddress: userAddress,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(
          errorData.details || 'Failed to save proposal to GitHub',
        );
      }

      const saveData = await saveResponse.json();
      filename = saveData.data.filename;
      setGithubFilename(filename);

      if (!memberUtxo) {
        throw new Error(
          'No membership application UTxO found for this address',
        );
      }
      const mbrUtxo = dbUtxoToMeshUtxo(memberUtxo);
      const tokenUtxo = await findTokenUtxoByMemberUtxo(mbrUtxo);

      if (!tokenUtxo) {
        throw new Error('No token UTxO found for this membership application');
      }

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

      const cleanAdaAmount = parseAdaInput(formData.fundsRequested);
      const lovelaceAmount = adaToLovelace(cleanAdaAmount);

      const githubUrl = `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO}/blob/${process.env.NEXT_PUBLIC_GITHUB_BRANCH}/proposals-applications/content/${filename}`;

      const metadataFormData: ProposalData = {
        title: formData.title,
        url: githubUrl,
        fundsRequested: lovelaceAmount.toString(),
        receiverWalletAddress: formData.receiverWalletAddress,
        submittedByAddress: formData.submittedByAddress,
        status: formData.status,
      };
      const metadata = proposalMetadata(metadataFormData);

      const result = await userAction.proposeProject(
        oracleUtxo,
        tokenUtxo,
        mbrUtxo,
        lovelaceAmount,
        formData.receiverWalletAddress,
        metadata,
      );

      const txHash = resolveTxHash(result.txHex);

      showTxConfirmation({
        txHash,
        title: 'Proposal Submitted',
        description:
          'Your proposal has been submitted. Please wait for blockchain confirmation.',
        onConfirmed: () => {
          setShowConfirmation(true);
        },
        onTimeout: async () => {
          if (filename) {
            await fetch('/api/proposal-content', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename }),
            }).catch((err) =>
              console.error('Failed to rollback GitHub file:', err),
            );
          }

          setError(
            'Transaction confirmation timed out. Your proposal may still be processed.',
          );
          setShowError(true);
        },
      });
    } catch (error: any) {
      if (filename) {
        await fetch('/api/proposal-content', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename }),
        }).catch((err) =>
          console.error('Failed to rollback GitHub file:', err),
        );
      }

      setError(error.message || 'Failed to submit proposal. Please try again.');
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollUp = () => {
    smoothScrollToElement(scrollTargetRef);
  };

  const handleNextTab = () => {
    if (activeTab === 'details') {
      const capturedMarkdown = {
        description: descriptionEditorRef.current?.getMarkdown() || '',
        impactToEcosystem:
          impactOnEcosystemEditorRef.current?.getMarkdown() || '',
        objectives: objectivesEditorRef.current?.getMarkdown() || '',
        milestones: milestonesEditorRef.current?.getMarkdown() || '',
        impact: impactEditorRef.current?.getMarkdown() || '',
        budgetBreakdown: budgetBreakdownEditorRef.current?.getMarkdown() || '',
      };
      setMarkdownData(capturedMarkdown);
    }

    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
      scrollUp();
    }
  };

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
      scrollUp();
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div ref={scrollTargetRef} className="mb-8 text-center">
          <Title level="5" className="text-foreground">
            Submit a proposal
          </Title>
        </div>
        <div className="mb-8">
          <div className="border-border w-full border-b">
            <TopNav
              tabs={tabs}
              activeTabId={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
          <div className="mb-8">
            {activeTab === 'details' && (
              <DetailsTab
                formData={formData}
                handleInputChange={handleInputChange}
                descriptionEditorRef={descriptionEditorRef}
              />
            )}

            {activeTab === 'funds' && (
              <FundsTab
                formData={formData}
                handleInputChange={handleInputChange}
              />
            )}

            {activeTab === 'review' && <ReviewTab formData={formData} />}
          </div>

          {activeTab === 'details' ? (
            <div className="pt-6">
              <Button
                variant="primary"
                onClick={handleNextTab}
                className="w-full"
              >
                Next
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 pt-6">
              {activeTab !== 'details' && (
                <div className="text-primary-base w-1/4">
                  <Button
                    variant="outline"
                    onClick={handlePreviousTab}
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
                    onClick={handleNextTab}
                    className="w-full"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit proposal'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal - shown after transaction confirmation */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Proposal Confirmed!"
        description="Your proposal has been confirmed on the blockchain"
        size="lg"
        actions={[
          {
            label: 'View My Submissions',
            variant: 'primary',
            onClick: () => {
              setShowConfirmation(false);
              window.location.href = routes.my.submissions;
            },
          },
          {
            label: 'Close',
            variant: 'outline',
            onClick: () => setShowConfirmation(false),
          },
        ]}
      >
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-foreground mb-4">
            Your proposal "{formData.title}" has been successfully confirmed on
            the blockchain and is now pending review.
          </p>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Submission Error"
        description="There was an issue submitting your proposal"
        actions={[
          {
            label: 'Try Again',
            variant: 'primary',
            onClick: () => setShowError(false),
          },
        ]}
      >
        <div className="py-4 text-center">
          <p className="text-foreground">{error}</p>
        </div>
      </Modal>

      {/* Loading Overlay */}
      <Modal
        isOpen={isSubmitting}
        onClose={() => {}}
        title="Submitting Proposal"
        description=" Please hold on as we do some magic"
        actions={[]}
      >
        <CardanoLoaderSVG size={64} />
      </Modal>
    </div>
  );
}
