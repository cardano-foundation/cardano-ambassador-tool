import Button from '@/components/atoms/Button';
import ErrorAccordion from '@/components/ErrorAccordion';
import FormDetails from '@/app/(home)/proposals/_components/FormDetails';
import FormFunds from '@/app/(home)/proposals/_components/FormFunds';
import FormReview from '@/app/(home)/proposals/_components/FormReview';
import TopNav from '@/components/navigation/TabNav';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import { RefObject, useState } from 'react';
import { StateFeedback } from './StateFeedback';

type ProposalFormData = ProposalData & { description: string };

interface EditProposalFormProps {
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
  descriptionEditorRef: RefObject<any>;
  handleDiscardChanges: () => void;
  handleSaveChanges: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

export const EditProposalForm = ({
  formData,
  handleInputChange,
  descriptionEditorRef,
  handleDiscardChanges,
  handleSaveChanges,
  isSubmitting,
  error,
}: EditProposalFormProps) => {
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'funds', label: 'Funds' },
    { id: 'review', label: 'Review' },
  ];

  const handleTabNavigation = (direction: 'next' | 'prev') => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <>
         <div className="flex items-center justify-between">
          <div className="flex gap-3 sm:gap-4">
            
                <div className="text-primary-base">
                  <Button variant="outline" onClick={handleDiscardChanges}>
                    Discard Changes
                  </Button>
                </div>
           
          </div>
        </div>

      {error && (
        <ErrorAccordion 
          message={error} 
          isVisible={true} 
          className="mb-4"
        />
      )}

      <div className="border-border mx-6 mb-6 border-b">
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
            userAddress={formData.submittedByAddress}
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
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Saving...' : 'Save Proposal'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
