'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/atoms/Button';
import Title from '@/components/atoms/Title';
import TopNav from '@/components/Navigation/TabNav';
import { useApp } from '@/context';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import DetailsTab from './components/DetailsTab';
import FundsTab from './components/FundsTab';
import ReviewTab from './components/ReviewTab';
import { ProposalFormData } from '@/types/ProposalFormData';

export default function SubmitProposalPage() {
  const router = useRouter();
  const { isAuthenticated, userWallet, userAddress } = useApp();
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [markdownData, setMarkdownData] = useState<any>({});
  const descriptionEditorRef = useRef<any>(null);
  const impactEditorRef = useRef<any>(null);
  const objectivesEditorRef = useRef<any>(null);
  const milestonesEditorRef = useRef<any>(null);
  const budgetBreakdownEditorRef = useRef<any>(null);
  const impactOnEcosystemEditorRef = useRef<any>(null);
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    category: '',
    description: '',
    impactToEcosystem: '',
    objectives: '',
    milestones: '',
    impact: '',
    budgetBreakdown: '',
    fundsRequested: '',
    receiverWalletAddress: ''
  });


  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'funds', label: 'Funds' },
    { id: 'review', label: 'Review' }
  ];
  if (!isAuthenticated) {
    return <SimpleCardanoLoader />;
  }

  const handleInputChange = (field: keyof ProposalFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !userWallet || !userAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submissionData = {
      title: formData.title,
      category: formData.category,
      ...markdownData,
      fundsRequested: formData.fundsRequested,
      receiverWalletAddress: formData.receiverWalletAddress
    };

    console.log('Submitting proposal as MARKDOWN:', submissionData);

    await new Promise(resolve => setTimeout(resolve, 2000));
      
      router.push('/dashboard/submissions');
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTab = () => {
  if (activeTab === 'details') {
    const capturedMarkdown = {
      description: descriptionEditorRef.current?.getMarkdown() || '',
      impactToEcosystem: impactOnEcosystemEditorRef.current?.getMarkdown() || '',
      objectives: objectivesEditorRef.current?.getMarkdown() || '',
      milestones: milestonesEditorRef.current?.getMarkdown() || '',
      impact: impactEditorRef.current?.getMarkdown() || '',
      budgetBreakdown: budgetBreakdownEditorRef.current?.getMarkdown() || '',
    };
    setMarkdownData(capturedMarkdown);
  }

  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
  if (currentIndex < tabs.length - 1) {
    setActiveTab(tabs[currentIndex + 1].id);
  }
};

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  if (isSubmitting) {
    return <SimpleCardanoLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <Title level="5" className="text-foreground">
            Submit a proposal
          </Title>
        </div>
        <div className="mb-8">
          <div className="w-full border-b border-border">
            <TopNav
              tabs={tabs}
              activeTabId={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm ">

          <div className="mb-8">
            {activeTab === "details" && (
              <DetailsTab formData={formData}
              handleInputChange={handleInputChange}
              descriptionEditorRef={descriptionEditorRef}
              impactEditorRef={impactEditorRef}
              objectivesEditorRef={objectivesEditorRef}
              milestonesEditorRef={milestonesEditorRef}
              impactOnEcosystemEditorRef={impactOnEcosystemEditorRef}
              budgetBreakdownEditorRef={budgetBreakdownEditorRef} />
            )}

            {activeTab === "funds" && (
              <FundsTab formData={formData}
              handleInputChange={handleInputChange} />
            )}

            {activeTab === "review" && (
              <ReviewTab formData={formData} />
            )}
          </div>

          {activeTab === 'details' ? (
            <div className=" pt-6">
              <Button
                variant="primary"
                onClick={handleNextTab}
                className="w-full"
              >
                Next
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-6 gap-4">
              {activeTab !== 'details' && (
                <div className="w-1/4 text-primary-base">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousTab}
                    className="w-full"
                  >
                    Back
                  </Button>
                </div>
              )}
              
              {/* Next/Submit Button */}
              <div className={activeTab === 'details' ? "w-full" : "w-3/4"}>
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
    </div>
  );
}