"use client";

import { Table, ColumnDef } from '@/components/Table/Table';
import { CopyIcon } from '@/components/atoms/CopyIcon';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import Title from '@/components/atoms/Title';
import { useState } from 'react';

type Proposal = {
  id: number;
  title: string;
  details: string;
  address: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
};

const proposalsData: Proposal[] = [
  {
    id: 1,
    title: 'Increase Community Fund Allocation',
    details: 'This proposal aims to increase the community fund allocation from 10% to 15% of the total treasury to support more community-driven initiatives and projects that benefit the ecosystem.',
    address: '0x742d35Cc6634C0532925a3b8D4b5b1a4E2b5b3e2',
    status: 'active'
  },
  {
    id: 2,
    title: 'Protocol Upgrade v2.1',
    details: 'Implementation of new security features and performance improvements including gas optimization, enhanced validator rewards, and cross-chain compatibility.',
    address: '0x962d35Cc6634C0532925a3b8D4b5b1a4E2b5b3e4',
    status: 'pending'
  },
  {
    id: 3,
    title: 'Tokenomics Revision',
    details: 'Proposal to revise the token emission schedule and staking rewards to ensure long-term sustainability and better align incentives for network participants.',
    address: '0x142d35Cc6634C0532925a3b8D4b5b1a4E2b5b3e5',
    status: 'rejected'
  },
  {
    id: 4,
    title: 'Tokenomics Revision',
    details: 'Proposal to revise the token emission schedule and staking rewards to ensure long-term sustainability and better align incentives for network participants.',
    address: '0x142d35Cc6634C0532925a3b8D4b5b1a4E2b5b3e5',
    status: 'completed'
  },
];

const getChipVariant = (status: Proposal['status']) => {
  switch (status) {
    case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'default';
      case 'rejected': return 'error';
      default: return 'inactive';
  }
};

const truncateToWords = (text: string, wordCount: number = 8) => {
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      console.error('Failed to copy text: ', fallbackErr);
      return false;
    }
  }
};

const proposalColumns: ColumnDef<Proposal>[] = [
  {
    header: '#',
    accessor: 'id',
    sortable: true,
    cell: (value) => (
      <span className="text-sm">#{value}</span>
    ),
  },
  {
    header: 'Proposal title',
    accessor: 'title',
    sortable: true,
    cell: (value) => (
      <span className="text-sm">{value}</span>
    ),
  },
  {
    header: 'Proposal details',
    accessor: 'details',
    sortable: false,
    cell: (value) => (
      <span className="text-sm max-w-[400px]">{truncateToWords(value, 8)}</span>
    ),
  },
  {
    header: 'Receiver address',
    accessor: 'address',
    sortable: false,
    cell: (value: string) => (
      <div className="flex items-center gap-2">
        <code className="text-xs">
          {value.slice(0, 8)}...{value.slice(-6)}
        </code>
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await copyToClipboard(value);
          }}
          className="p-1 rounded"
          title="copy"
        >
          <CopyIcon />
        </button>
      </div>
    ),
    getCopyText: (value: string) => value,
  },
  {
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: (value) => (
      <Chip variant={getChipVariant(value)}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Chip>
    ),
  },
  {
    header: 'Action',
    sortable: false,
    cell: (value, row) => (
      <Button
        variant="primary"
        size="sm"
      >
        View
      </Button>
    ),
  },
];

export default function ProposalsPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleViewProposal = (proposalId: number) => {
    console.log('View proposal:', proposalId);
  };

  const handleCopyAddress = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedAddress(text);
      
      setTimeout(() => {
        setCopiedAddress(null);
      }, 2000);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Title level="5" className="text-foreground">Proposals</Title>
            {copiedAddress && (
              <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded">
                Address copied to clipboard!
              </div>
            )}
          </div>
          
          <Table
            data={proposalsData}
            columns={proposalColumns}
            pageSize={10}
            searchable={true}
            searchPlaceholder="Search by title, details, or status..."
            onCopy={handleCopyAddress}
            context="proposals"
            autoSize={true}
          />
        </div>
      </div>
    </div>
  );
}