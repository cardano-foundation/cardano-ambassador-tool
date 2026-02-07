import Card from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import ProposalDescription from '@/components/ProposalDescription';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import { useState } from 'react';
import Button from '@/components/atoms/Button';
import { AdminDecisionData } from '@types';

type ProposalFormData = ProposalData & { description: string };

interface ProposalViewProps {
  proposalData: ProposalFormData;
  setIsEditing: (isEditing: boolean) => void;
  adminDecisionData?: AdminDecisionData | null;
}

export const ProposalView = ({
  proposalData,
  setIsEditing,
  adminDecisionData,
}: ProposalViewProps) => {
  const signingStarted = adminDecisionData?.signers && adminDecisionData.signers.length > 0;

  return (
    <>
      <div className="flex items-center justify-between">
          <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row sm:items-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={!!signingStarted}
              >
                Edit Proposal
              </Button>
              {signingStarted && (
                <span className="text-xs text-amber-600">
                  Editing disabled: Proposal signing has started.
                </span>
              )}
          </div>
        </div>
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
            <ProposalDescription
              content={proposalData.description || 'No description available'}
              className="text-foreground"
            />
          </div>
        </div>
      </Card>
    </>
  );
};
