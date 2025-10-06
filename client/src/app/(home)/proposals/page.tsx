import Title from '@/components/atoms/Title';
import Paragraph from '@/components/atoms/Paragraph';
import Copyable from '@/components/Copyable';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import { getCurrentNetworkConfig } from '@/config/cardano';
import Button from '@/components/atoms/Button';

export interface ProposalData {
  id: string;
  title: string;
  category: string;
  description: string;
  impact: string;
  impactToEcosystem: string;
  objectives: string;
  milestones: string;
  budgetBreakdown: string;
  fundsRequested: string;
  receiverWalletAddress: string;
  submittedBy?: string;
  submittedByAddress?: string;
  status?: 'active' | 'pending' | 'completed' | 'rejected';
  policyId?: string;
}

interface Props {
  proposal: ProposalData;
  onEdit?: () => void;
  canEdit?: boolean;
}

export default function ProposalPage({ 
  proposal, 
  onEdit,
  canEdit = true 
}: Props) {
  const getStatusStyles = () => {
    switch (proposal.status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-500';
      case 'pending':
        return 'bg-orange-50 text-amber-500 border-amber-500';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-500';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-500';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-500';
    }
  };

  return (
    <div className="px-10 pb-7 space-y-7">
      {/* Title and Status */}
      <div className="flex justify-between items-center">
        <Title level="3" className="text-foreground">
          {proposal.title}
        </Title>
        {proposal.status && (
          <div className={`px-3.5 py-1.5 rounded-3xl shadow-sm border ${getStatusStyles()} capitalize text-xs font-normal`}>
            {proposal.status}
          </div>
        )}
      </div>

      {/* Header Info Grid */}
      <div className="flex justify-between gap-10">
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
            <div className="flex items-start gap-1.5">
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

      {/* Overview Section with Edit Button */}
      <div className="flex justify-between items-center">
        <Title level="3" className="text-foreground">
          Overview
        </Title>
        {canEdit && onEdit && (
          <Button 
            onClick={onEdit}
            className="bg-rose-500 hover:bg-rose-600 text-white"
          >
            Edit Proposal
          </Button>
        )}
      </div>

      {/* Content Sections */}
      <div className="space-y-5">
        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
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
  );
}