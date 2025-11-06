"use client";

import { Table, ColumnDef } from '@/components/Table/Table';
import Button from '@/components/atoms/Button';
import Link from 'next/link';
import Chip from '@/components/atoms/Chip';
import Title from '@/components/atoms/Title';
import { useState } from 'react';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Copyable from '@/components/Copyable';
import { routes } from '@/config/routes';
import { useApp } from '@/context';
import { parseProposalDatum } from '@/utils';
import { getCurrentNetworkConfig } from '@/config/cardano';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';

type Proposal = {
  id: number;
  title: string;
  details: string;
  receiverWalletAddress: string;
  submittedByAddress: string;
  fundsRequested: number;
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  txHash: string;
};

const getChipVariant = (status: Proposal['status']) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'submitted': return 'default';
    case 'under_review': return 'default';
    case 'approved': return 'success';
    case 'rejected': return 'error';
    default: return 'inactive';
  }
};

const truncateToWords = (text: string, wordCount: number = 8) => {
  if (!text) return 'No description';
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

const proposalColumns: ColumnDef<Proposal>[] = [
  {
    header: '#',
    accessor: 'id',
    sortable: true,
    cell: (value) => (
      <span className="text-muted-foreground text-sm">{value}</span>
    ),
  },
  {
    header: 'Proposal title',
    accessor: 'title',
    sortable: true,
    cell: (value) => (
      <span className="text-foreground text-sm font-medium">{value}</span>
    ),
  },
  {
    header: 'Proposal details',
    accessor: 'details',
    sortable: false,
    cell: (value) => {
      const truncatedValue = truncateToWords(value, 10);
      return (
        <div className="max-w-[400px] text-sm">
          <RichTextDisplay 
            content={truncatedValue} 
            className="prose-sm [&_p]:mb-1 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_strong]:font-semibold" 
          />
        </div>
      );
    },
  },
  {
    header: 'Funds Requested',
    accessor: 'fundsRequested',
    sortable: true,
    cell: (value) => (
      <span className="text-sm">
        {value ? `$${value.toLocaleString()}` : 'N/A'}
      </span>
    ),
  },
  {
    header: 'Submitted By',
    accessor: 'submittedByAddress',
    sortable: false,
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
      <Chip variant={getChipVariant(value)}>
        {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
      </Chip>
    ),
  },
  {
    header: 'Action',
    sortable: false,
    cell: (value, row) => (
      <Link href={routes.proposal(row.txHash)}>
        <Button variant="primary" size="sm">
          View
        </Button>
      </Link>
    ),
  },
];

export default function ProposalsPage() {
  const { proposals, dbLoading } = useApp();

  if (dbLoading) {
    return <SimpleCardanoLoader />;
  }

  const proposalsData: Proposal[] = proposals
    .map((utxo, idx) => {
      if (!utxo.plutusData) return null;

      try {
        const { metadata } = parseProposalDatum(utxo.plutusData)!;

        if (!metadata) return null;

        return {
          id: idx + 1,
          title: metadata.title || 'Untitled Proposal',
          details: metadata.description || 'No description provided',
          receiverWalletAddress: metadata.receiverWalletAddress || '',
          submittedByAddress: metadata.submittedByAddress || '',
          fundsRequested: parseInt(metadata.fundsRequested || '0'),
          status: 'approved' as const,
          txHash: utxo.txHash,
        };
      } catch (error) {
        console.error('Error parsing proposal datum:', error);
        return null;
      }
    })
    .filter(Boolean) as Proposal[];

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Title level="5" className="text-foreground">Community Proposals</Title>
              <Paragraph className="text-sm text-muted-foreground">
                Browse and discover proposals submitted by Cardano ambassadors
                {proposalsData.length > 0 && ` - ${proposalsData.length} found`}
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
                data={proposalsData}
                columns={proposalColumns}
                pageSize={10}
                searchable={true}
                searchPlaceholder="Search proposals..."
                context="proposals"
                autoSize={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
