'use client';

import Copyable from '@/components/Copyable';
import { ColumnDef, Table } from '@/components/Table/Table';
import Button from '@/components/atoms/Button';
import { CopyIcon } from '@/components/atoms/CopyIcon';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Link from 'next/link';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { routes } from '@/config/routes';
import { useApp } from '@/context';
import { parseProposalDatum } from '@/utils';
import Chip from '@/components/atoms/Chip';

type ProposalIntent = {
  id: number;
  title: string;
  description: string;
  submittedByAddress: string;
  receiverWalletAddress: string;
  createdAt?: string;
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  fundsRequested?: number;
  txHash: string;
  outputIndex?: number;
};

const getChipVariant = (status: ProposalIntent['status']) => {
  switch (status) {
    case 'pending':
      return 'default';
    case 'submitted':
      return 'warning';
    case 'under_review':
      return 'default';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'inactive';
  }
};

const truncateToWords = (text: string, wordCount: number = 6) => {
  if (!text) return 'No description';
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

const proposalIntentColumns: ColumnDef<ProposalIntent>[] = [
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
    cell: (value) => <span className="text-sm">{value}</span>,
  },
  {
    header: 'Project details',
    accessor: 'description',
    sortable: false,
    cell: (value) => {
      const truncatedValue = truncateToWords(value, 6);
      return (
        <div className="max-w-[300px] text-sm">
          <RichTextDisplay 
            content={truncatedValue} 
            className="prose-sm [&_p]:mb-1 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_strong]:font-semibold" 
          />
        </div>
      );
    },
  },
  {
    header: 'Submitted by',
    accessor: 'submittedByAddress',
    sortable: true,
    cell: (value: string) => (
      <Copyable
        withKey={false}
        link={`${getCurrentNetworkConfig().explorerUrl}/address/${value}`}
        value={value}
        keyLabel={''}
      />
    ),
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
        keyLabel={''}
      />
    ),
  },
  {
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: (value) => (
      <Chip variant={getChipVariant(value)}>
        {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
      </Chip>
    ),
  },
  {
    header: 'Action',
    sortable: false,
    cell: (value, row) => (
      <Link href={routes.manage.proposal(row.txHash)} prefetch={true}>
        <Button variant="primary" size="md">
          View
        </Button>
      </Link>
    ),
  },
];

export default function ProposalIntentsPage() {
  const { proposalIntents, proposals, dbLoading } = useApp();

  if (dbLoading) {
    return <div className="p-4">Loading proposals...</div>;
  }

  // Combine both pending proposals (proposalIntents) and approved proposals (proposals)
  const allProposals = [...proposalIntents, ...proposals];

  if (!allProposals.length) {
    return <div className="p-4">No proposals found.</div>;
  }

  const decodedUtxos = allProposals.map((utxo, idx) => {
    const decodedDatum: ProposalIntent = {
      title: '',
      description: '',
      fundsRequested: 0,
      receiverWalletAddress: '',
      submittedByAddress: '',
      status: 'pending',
      id: 0,
      txHash: utxo.txHash,
    };

    if (utxo.plutusData) {
      try {
        const { metadata } = parseProposalDatum(utxo.plutusData)!;

        if (metadata) {
          decodedDatum['title'] = metadata.title || 'Untitled Proposal';
          decodedDatum['description'] = metadata.description || 'No description provided';
          decodedDatum['fundsRequested'] = parseInt(metadata.fundsRequested || '0');
          decodedDatum['receiverWalletAddress'] = metadata.receiverWalletAddress || '';
          decodedDatum['submittedByAddress'] = metadata.submittedByAddress || '';
          decodedDatum['id'] = idx + 1;
          
          // Determine status: if it's in the proposals array, it's approved; if in proposalIntents, it's pending
          decodedDatum['status'] = proposals.some(p => p.txHash === utxo.txHash) ? 'approved' : 'pending';
        }
      } catch (error) {
        console.error('Error parsing proposal datum:', error);
        decodedDatum['title'] = 'Error parsing proposal';
        decodedDatum['description'] = 'Unable to parse proposal data';
      }
    }

    return decodedDatum;
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <Title level="5" className="text-foreground">
              Proposals
            </Title>
            <Paragraph className="text-muted-foreground text-sm">
              Browse and manage all proposals submitted by ambassadors
              {allProposals.length > 0 &&
                ` - ${allProposals.length} found (${proposalIntents.length} pending, ${proposals.length} approved)`}
            </Paragraph>
          </div>

          <Table
            data={decodedUtxos}
            columns={proposalIntentColumns}
            pageSize={10}
            searchable={true}
            searchPlaceholder="Search proposals..."
            context="proposals"
            autoSize={true}
          />
        </div>
      </div>
    </div>
  );
}