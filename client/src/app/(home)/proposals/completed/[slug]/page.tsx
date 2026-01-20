'use client';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import ProposalDescription from '@/components/ProposalDescription';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import { getCurrentNetworkConfig } from '@/config/cardano';
import useProposals from '@/hooks/useProposals';
import { formatAdaAmount } from '@/utils';
import { use } from 'react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CompletedProposalPage({ params }: PageProps) {
  const { allProposals, loading } = useProposals();
  const { slug } = use(params);

  // Find the completed proposal by slug
  const proposal = allProposals.find(
    (p) => p.status === 'paid_out' && p.slug === slug,
  );

  if (loading) {
    return <SimpleCardanoLoader />;
  }

  if (!proposal) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Completed Proposal Not Found
          </Title>
          <Paragraph className="text-muted-foreground mb-4">
            The completed proposal with identifier "{slug}" could not be found.
          </Paragraph>
          <Button variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getChipVariant = () => {
    switch (proposal.status) {
      case 'paid_out':
        return 'success';
      default:
        return 'inactive';
    }
  };

  const statusLabel = 'Completed & Paid Out';

  return (
    <div className="container px-4 py-2 pb-8 sm:px-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Title level="5" className="text-foreground">
            {proposal.title}
          </Title>
          <Chip
            variant={getChipVariant()}
            size="md"
            className="capitalize"
            aria-label={`Status: ${statusLabel}`}
          >
            {statusLabel}
          </Chip>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div className="flex-1 space-y-7">
              <div className="space-y-1.5">
                <Paragraph size="xs">Status</Paragraph>
                <Paragraph size="sm" className="text-foreground">
                  ✅ Completed.
                </Paragraph>
              </div>
              <div className="space-y-1.5">
                <Paragraph size="xs">Receiver Wallet</Paragraph>
                {proposal.receiverWalletAddress ? (
                  <Copyable
                    withKey={false}
                    link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposal.receiverWalletAddress}`}
                    value={proposal.receiverWalletAddress}
                    keyLabel=""
                  />
                ) : (
                  <Paragraph size="sm" className="text-foreground">
                    Not specified
                  </Paragraph>
                )}
              </div>
              <div className="space-y-1.5">
                <Paragraph size="xs">Submitted By</Paragraph>
                {proposal.submittedByAddress ? (
                  <Copyable
                    withKey={false}
                    link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposal.submittedByAddress}`}
                    value={proposal.submittedByAddress}
                    keyLabel=""
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
                <Paragraph size="xs">Funds Requested & Transferred</Paragraph>
                <Paragraph size="sm" className="text-foreground">
                  {proposal.fundsRequested && proposal.fundsRequested !== '0'
                    ? formatAdaAmount(proposal.fundsRequested)
                    : 'N/A'}
                </Paragraph>
              </div>
              {proposal.url && (
                <div className="space-y-1.5">
                  <Paragraph size="xs">Project URL</Paragraph>
                  <a
                    href={proposal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 break-all text-sm underline"
                  >
                    {proposal.url}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                content={proposal.title}
                className="text-foreground"
              />
            </div>
            <div className="space-y-6">
              <Title level="6" className="text-foreground">
                Description
              </Title>
              <ProposalDescription
                content={proposal.description || 'No description available'}
                className="text-foreground"
              />
            </div>
          </div>
        </Card>

        {/* Success message */}
        <Card>
          <CardContent>
            <div className="flex items-start space-x-3">
              <div className="text-green-500 text-2xl">✅</div>
              <div className="space-y-1">
                <Title level="6" className="text-foreground">
                  Proposal Completed Successfully
                </Title>
                <Paragraph size="sm" className="text-muted-foreground">
                  This proposal has been fully executed. The requested funds
                  have been transferred from the treasury to the specified
                  receiver wallet. The proposal is now part of the permanent
                  record of completed community projects.
                </Paragraph>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}