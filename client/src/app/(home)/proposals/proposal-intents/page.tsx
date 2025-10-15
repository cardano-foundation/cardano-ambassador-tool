"use client";

import { Table, ColumnDef } from '@/components/Table/Table';
import { CopyIcon } from '@/components/atoms/CopyIcon';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import Title from '@/components/atoms/Title';
import Paragraph from '@/components/atoms/Paragraph';
import { useState, useEffect } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { Utxo } from '@types';

type ProposalIntent = {
  id: number;
  title: string;
  description: string;
  proposerAddress: string;
  receiverAddress: string;
  createdAt: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  fundsRequested?: number;
  txHash?: string;
  outputIndex?: number;
};

const getChipVariant = (status: ProposalIntent['status']) => {
  switch (status) {
    case 'draft': return 'default';
    case 'submitted': return 'warning';
    case 'under_review': return 'default';
    case 'approved': return 'success';
    case 'rejected': return 'error';
    default: return 'inactive';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
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
    cell: (value) => <span className="text-sm max-w-[300px]">{truncateToWords(value, 6)}</span>,
  },
  {
    header: 'Submitted by',
    accessor: 'proposerAddress',
    sortable: true,
    cell: (value: string) => (
      <div className="flex items-center gap-2">
        <code className="text-xs">
          {value ? `${value.slice(0, 8)}...${value.slice(-6)}` : 'Unknown'}
        </code>
        {value && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await copyToClipboard(value);
            }}
            className="p-1 rounded  transition-colors"
            title="Copy address"
          >
            <CopyIcon />
          </button>
        )}
      </div>
    ),
  },
  {
    header: 'Funds requested',
    accessor: 'fundsRequested',
    sortable: true,
    cell: (value) => <span className="text-sm">{value ? `$${value.toLocaleString()}` : 'N/A'}</span>,
  },
  {
    header: 'Receiver Address',
    accessor: 'receiverAddress',
    sortable: true,
    cell: (value: string) => (
      <div className="flex items-center gap-2">
        <code className="text-xs">
          {value ? `${value.slice(0, 8)}...${value.slice(-6)}` : 'Unknown'}
        </code>
        {value && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await copyToClipboard(value);
            }}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Copy address"
          >
            <CopyIcon />
          </button>
        )}
      </div>
    ),
  },
  {
    header: 'Action',
    sortable: false,
    cell: (value, row) => (
      <Button variant="primary" size="md">
        View
      </Button>
    ),
  },
];

export default function ProposalIntentsPage() {
  const [proposalIntents, setProposalIntents] = useState<ProposalIntent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { proposalIntents: rawProposalIntents } = useDatabase();

  useEffect(() => {
    console.log("RAW PROPOSAL INTENTS:", rawProposalIntents);
    if (rawProposalIntents) {
      console.log("Count:", rawProposalIntents.length);
      console.log("First item:", rawProposalIntents[0]);
      try {
        setLoading(true);
        const transformedData = transformRawData(rawProposalIntents);
        setProposalIntents(transformedData);
      } catch (err) {
        setError('Failed to process proposal intents data');
      } finally {
        setLoading(false);
      }
    }
  }, [rawProposalIntents]);

  const transformRawData = (rawIntents: Utxo[]): ProposalIntent[] => {
    return rawIntents.map((utxo, index) => ({
      id: index + 1,
      title: `Proposal Intent ${index + 1}`,
      description: 'On-chain proposal intent',
      proposerAddress: utxo.address || 'Unknown',
      receiverAddress: utxo.address || 'Unknown',
      createdAt: new Date().toISOString(),
      status: 'submitted',
      fundsRequested: undefined,
      txHash: utxo.txHash,
      outputIndex: utxo.outputIndex,
    }));
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading proposal intents...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <Title level="5" className="text-foreground">Proposal Intents</Title>
            <Paragraph className="text-sm text-muted-foreground">
              Browse and manage proposal intents submitted by ambassadors
              {proposalIntents.length > 0 && ` - ${proposalIntents.length} found`}
            </Paragraph>
          </div>
          
          <Table
            data={proposalIntents}
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