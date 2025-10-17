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

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
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
    header: 'Action',
    sortable: false,
    cell: (value, row) => (
      <Link href={routes.manage.proposalIntent(row.txHash)} prefetch={true}>
        <Button variant="primary" size="md">
          View
        </Button>
      </Link>
    ),
  },
];

export default function ProposalIntentsPage() {
  const { proposalIntents, dbLoading } = useApp();

  if (dbLoading) {
    return <div className="p-4">Loading membership intents...</div>;
  }

  if (!proposalIntents.length) {
    return <div className="p-4">No membership intents found.</div>;
  }

  const decodedUtxos = proposalIntents.map((utxo, idx) => {
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
      const { metadata } = parseProposalDatum(utxo.plutusData)!;

      if (metadata) {
        decodedDatum['title'] = metadata.title!;
        decodedDatum['description'] = metadata.description!;
        decodedDatum['fundsRequested'] = parseInt(metadata.fundsRequested!);
        decodedDatum['receiverWalletAddress'] = metadata.receiverWalletAddress!;
        decodedDatum['submittedByAddress'] = metadata.submittedByAddress!;
        decodedDatum['id'] = idx + 1;
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
              Proposal Intents
            </Title>
            <Paragraph className="text-muted-foreground text-sm">
              Browse and manage proposal intents submitted by ambassadors
              {proposalIntents.length > 0 &&
                ` - ${proposalIntents.length} found`}
            </Paragraph>
          </div>

          <Table
            data={decodedUtxos}
            columns={proposalIntentColumns}
            pageSize={10}
            searchable={true}
            searchPlaceholder="Search proposals..."
            context="proposal intents"
            autoSize={true}
          />
        </div>
      </div>
    </div>
  );
}
