import Title from '@/components/atoms/Title';
import Paragraph from '@/components/atoms/Paragraph';
import Copyable from '@/components/Copyable';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import { getCurrentNetworkConfig } from '@/config/cardano';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import { ProposalData, mockProposal } from '@/hooks/UseProposalData'; 
import Link from 'next/link';

interface Props {
  proposal: ProposalData;
  onEdit?: () => void;
  canEdit?: boolean;
}

export default function Page() {
  const proposal = mockProposal;
  const getChipVariant = () => {
  switch (proposal.status) {
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'completed':
      return 'default';
    case 'rejected':
      return 'error';
    default:
      return 'inactive';
  }
};


  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 ">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level="5" className="text-foreground">
          {proposal.title}
        </Title>
        {proposal.status && (
          <Chip
            variant={getChipVariant()}
            size="md"
            className="capitalize"
          >
            {proposal.status}
          </Chip>
        )}
      </div>


      <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="flex-1 space-y-7">
          <div className="space-y-1.5">
            <Paragraph size="xs" className="text-muted-foreground font-light">
              Proposal ID
            </Paragraph>
            <Paragraph size="sm" className="text-foreground">
              {proposal.id}
            </Paragraph>
          </div>

          <div className="space-y-1.5">
            <Paragraph size="xs" className="text-muted-foreground font-light">
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

          {proposal.policyId && (
            <div className="space-y-1.5">
              <Paragraph size="xs" className="text-muted-foreground font-light">
                Policy ID
              </Paragraph>
              <Copyable
                withKey={false}
                link={`${getCurrentNetworkConfig().explorerUrl}/policy/${proposal.policyId}`}
                value={proposal.policyId}
                keyLabel={''}
              />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-7">
          <div className="space-y-1.5">
            <Paragraph size="xs" className="text-muted-foreground font-light">
              Submitted by
            </Paragraph>
            <div className="flex items-start flex-wrap gap-1.5">
              {proposal.submittedBy && (
                <Paragraph size="sm" className="text-foreground">
                  {proposal.submittedBy}
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
                !proposal.submittedBy && (
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
              {proposal.fundsRequested}
            </Paragraph>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Title level="5" className="text-foreground">
          Overview
        </Title>
        <Link href="/proposals/edit">
          <Button 
            variant='primary'
            className="text-white"
          >
            Edit Proposal
          </Button>
        </Link>
      </div>
      <div className="space-y-5">
        <div className="space-y-2.5">
          <Title level="6" className="text-base text-foreground">
            Title
          </Title>
          <RichTextDisplay 
            content={proposal.title} 
            className="text-foreground"
          />
        </div>

        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Description
          </Title>
          <RichTextDisplay 
            content={proposal.description} 
            className="text-foreground"
          />
        </div>

        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Objectives
          </Title>
          <RichTextDisplay 
            content={proposal.objectives} 
            className="text-foreground"
          />
        </div>

        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Milestones
          </Title>
          <RichTextDisplay 
            content={proposal.milestones} 
            className="text-foreground"
          />
        </div>

        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Impact
          </Title>
          <RichTextDisplay 
            content={proposal.impact} 
            className="text-foreground"
          />
        </div>

        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Budget breakdown
          </Title>
          <RichTextDisplay 
            content={proposal.budgetBreakdown} 
            className="text-foreground"
          />
        </div>
      </div>
    </div>
    </div>
  </div>
  );
}