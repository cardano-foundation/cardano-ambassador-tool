'use client';

import { ColumnDef, Table } from '@/components/Table/Table';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import Select from '@/components/atoms/Select';
import Title from '@/components/atoms/Title';
import { routes } from '@/config/routes';
import { useApp } from '@/context';
import { formatAdaAmount, parseProposalDatum } from '@/utils';
import Link from 'next/link';
import { useState } from 'react';

type ProposalIntent = {
  id: number;
  title: string;
  url: string;
  receiverWalletAddress: string;
  createdAt?: string;
  status:
    | 'pending'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'signoff_pending';
  fundsRequested?: string;
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
    case 'signoff_pending':
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
    accessor: 'url',
    sortable: false,
    cell: (value) => {
      if (!value)
        return (
          <span className="text-muted-foreground text-sm">No details</span>
        );
      return (
        <div className="max-w-[300px] text-sm">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-base flex items-center gap-1 hover:underline"
          >
            See more
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
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
        {value && value !== '0' ? formatAdaAmount(value) : 'N/A'}
      </span>
    ),
  },
  {
    header: 'Status',
    accessor: 'status',
    sortable: true,
    cell: (value) => (
      <Chip variant={getChipVariant(value)} className="text-nowrap">
        {value === 'signoff_pending'
          ? 'Awaiting Signoff'
          : value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
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
  const { proposalIntents, proposals, signOfApprovals, dbLoading } = useApp();
  const [statusFilter, setStatusFilter] = useState<
    'all' | ProposalIntent['status']
  >('all');

  if (dbLoading) {
    return <div className="p-4">Loading proposals...</div>;
  }

  // Combine all proposal stages
  const allProposals = [...proposalIntents, ...proposals, ...signOfApprovals];

  if (!allProposals.length) {
    return <div className="p-4">No proposals found.</div>;
  }

  const decodedUtxos = allProposals.map((utxo, idx) => {
    const decodedDatum: ProposalIntent = {
      title: '',
      url: '',
      fundsRequested: '0',
      receiverWalletAddress: '',
      status: 'pending',
      id: 0,
      txHash: utxo.txHash,
    };

    if (utxo.plutusData) {
      try {
        const { metadata } = parseProposalDatum(utxo.plutusData)!;

        if (metadata) {
          decodedDatum['title'] = metadata.title || 'Untitled Proposal';
          decodedDatum['url'] = metadata.url || '';
          decodedDatum['fundsRequested'] = metadata.fundsRequested || '0';
          decodedDatum['receiverWalletAddress'] =
            metadata.receiverWalletAddress || '';
          decodedDatum['id'] = idx + 1;

          decodedDatum['status'] = signOfApprovals.some(
            (p) => p.txHash === utxo.txHash,
          )
            ? 'signoff_pending'
            : proposals.some((p) => p.txHash === utxo.txHash)
              ? 'approved'
              : 'pending';
        }
      } catch (error) {
        console.error('Error parsing proposal datum:', error);
        decodedDatum['title'] = 'Error parsing proposal';
        decodedDatum['url'] = '';
      }
    }

    return decodedDatum;
  });

  // Remove duplicates based on txHash (keep the most advanced status)
  const uniqueProposals = decodedUtxos.reduce((acc, current) => {
    const existing = acc.find((item) => item.txHash === current.txHash);
    if (!existing) {
      acc.push(current);
    } else {
      const statusPriority = {
        rejected: 1,
        submitted: 3,
        under_review: 1,
        signoff_pending: 3,
        approved: 2,
        pending: 1,
      };
      if (statusPriority[current.status] > statusPriority[existing.status]) {
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
    }
    return acc;
  }, [] as ProposalIntent[]);

  // Apply status filter
  const filteredProposals =
    statusFilter === 'all'
      ? uniqueProposals
      : uniqueProposals.filter((proposal) => proposal.status === statusFilter);

  // Count by status for display
  const statusCounts = {
    pending: uniqueProposals.filter((p) => p.status === 'pending').length,
    approved: uniqueProposals.filter((p) => p.status === 'approved').length,
    signoff_pending: uniqueProposals.filter(
      (p) => p.status === 'signoff_pending',
    ).length,
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'signoff_pending', label: 'Awaiting Signoff' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <Title level="5" className="text-foreground">
              Proposals
            </Title>
            <Paragraph className="text-muted-foreground text-sm">
              Browse and manage all proposals at every stage of the process
            </Paragraph>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Filter by status:
            </span>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as typeof statusFilter)
              }
              options={statusOptions.map((option) => ({
                ...option,
                label:
                  option.value !== 'all' &&
                  statusCounts[option.value as keyof typeof statusCounts] > 0
                    ? `${option.label} (${statusCounts[option.value as keyof typeof statusCounts]})`
                    : option.label,
              }))}
              placeholder="Select status..."
              className="w-48"
            />
          </div>

          <Table
            data={filteredProposals}
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
