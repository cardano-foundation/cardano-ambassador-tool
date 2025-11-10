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
import { parseProposalDatum, lovelaceToAda, formatAdaAmount } from '@/utils';
import Link from 'next/link';
import EmptyProposalIntentState from './EmptyProposalIntentState';

type UserProposal = {
  id: number;
  title: string;
  description: string;
  receiverWalletAddress: string;
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  fundsRequested: string;
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
    cell: (value, row) => {
      if (!value) return <span className="text-sm text-muted-foreground">No description</span>;
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
        {value ? formatAdaAmount(lovelaceToAda(value)) : 'N/A'}
      </span>
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
  const { proposalIntents, proposals, signOfApprovals, members, userAddress, dbLoading } = useApp();
  
  const userMemberUtxo = members.find((m) => {
    if (!m.parsedMetadata) return false;
    try {
      const metadata = typeof m.parsedMetadata === 'string'
        ? JSON.parse(m.parsedMetadata)
        : m.parsedMetadata;
      return metadata?.walletAddress === userAddress;
    } catch {
      return false;
    }
  });
  
  const allProposalUtxos = [...proposalIntents, ...proposals, ...signOfApprovals];

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

  const userProposals = allProposalUtxos
    .map((utxo, idx) => {
      if (!utxo.parsedMetadata) return null;

      try {
        const metadata = typeof utxo.parsedMetadata === 'string'
          ? JSON.parse(utxo.parsedMetadata)
          : utxo.parsedMetadata;

        if (!metadata || metadata.submittedByAddress !== userAddress) {
          return null;
        }

        const status = signOfApprovals.some(p => p.txHash === utxo.txHash)
          ? 'approved' as const
          : proposals.some(p => p.txHash === utxo.txHash)
          ? 'approved' as const
          : 'pending' as const;

        return {
          id: idx + 1,
          title: metadata.title || '',
          description: metadata.description || '',
          fundsRequested: metadata.fundsRequested || '0',
          receiverWalletAddress: metadata.receiverWalletAddress || '',
          status,
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
