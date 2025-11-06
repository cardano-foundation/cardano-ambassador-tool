'use client';

import Copyable from '@/components/Copyable';
import { ColumnDef, Table } from '@/components/Table/Table';
import Button from '@/components/atoms/Button';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { routes } from '@/config/routes';
import { useApp } from '@/context';
import { parseProposalDatum } from '@/utils';
import Link from 'next/link';
import EmptyProposalIntentState from './EmptyProposalIntentState';

type UserProposal = {
  id: number;
  title: string;
  description: string;
  submittedByAddress: string;
  receiverWalletAddress: string;
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  fundsRequested?: number;
  txHash: string;
};

const truncateToWords = (text: string, wordCount: number = 6) => {
  if (!text) return 'No description';
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

const userProposalColumns: ColumnDef<UserProposal>[] = [
  {
    header: '#',
    accessor: 'id',
    sortable: true,
    cell: (value) => <span className="text-sm">{value}</span>,
  },
  {
    header: 'Proposal title',
    accessor: 'title',
    sortable: true,
    cell: (value) => <span className="text-sm font-medium">{value}</span>,
  },
  {
    header: 'Project details',
    accessor: 'description',
    sortable: false,
    cell: (value) => {
      const truncatedValue = truncateToWords(value, 8);
      return (
        <div className="max-w-[350px] text-sm">
          <RichTextDisplay
            content={truncatedValue}
            className="prose-sm [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_p]:mb-1 [&_strong]:font-semibold"
          />
        </div>
      );
    },
  },
  {
    header: 'Funds requested',
    accessor: 'fundsRequested',
    sortable: true,
    cell: (value) => (
      <span className="text-sm">
        {value ? `$${value.toLocaleString()}` : 'N/A'}
      </span>
    ),
  },
  {
    header: 'Receiver Address',
    accessor: 'receiverWalletAddress',
    sortable: true,
    cell: (value: string) => (
      <Copyable
        withKey={false}
        link={`${getCurrentNetworkConfig().explorerUrl}/address/${value}`}
        value={value}
        keyLabel=""
      />
    ),
  },
  {
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: (value) => (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
        {value}
      </span>
    ),
  },
  {
    header: 'Action',
    sortable: false,
    cell: (value, row) => (
      <Link href={routes.my.proposals(row.txHash)}>
        <Button variant="primary" size="sm">
          View
        </Button>
      </Link>
    ),
  },
];

export default function ProposalSubmissionsTab() {
  const { proposalIntents, userAddress, dbLoading } = useApp();

  if (dbLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Loading your proposals...
          </Title>
        </div>
      </div>
    );
  }

  const userProposals = proposalIntents
    .map((utxo, idx) => {
      if (!utxo.plutusData) return null;

      try {
        const { metadata } = parseProposalDatum(utxo.plutusData)!;

        if (!metadata || metadata.submittedByAddress !== userAddress) {
          return null;
        }

        return {
          id: idx + 1,
          title: metadata.title || '',
          description: metadata.description || '',
          fundsRequested: parseInt(metadata.fundsRequested || '0'),
          receiverWalletAddress: metadata.receiverWalletAddress || '',
          submittedByAddress: metadata.submittedByAddress || '',
          status: 'pending' as const,
          txHash: utxo.txHash,
        };
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean) as UserProposal[];

  if (userProposals.length === 0) {
    return <EmptyProposalIntentState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Title level="4" className="text-foreground">
            Your Proposal Submissions
          </Title>
          <Paragraph className="text-muted-foreground text-sm">
            Track the status of your submitted proposals
            {userProposals.length > 0 && ` - ${userProposals.length} found`}
          </Paragraph>
        </div>
        <Link href={routes.newProposal} className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full sm:w-auto">
            New Proposal
          </Button>
        </Link>
      </div>

      {/* Mobile-optimized scrollable table container */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table
            data={userProposals}
            columns={userProposalColumns}
            pageSize={10}
            searchable={true}
            searchPlaceholder="Search your proposals..."
            context="your proposals"
            autoSize={true}
          />
        </div>
      </div>
    </div>
  );
}
