'use client';

import { ColumnDef, Table } from '@/components/Table/Table';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import Empty from '@/components/atoms/Empty';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Select from '@/components/atoms/Select';
import Title from '@/components/atoms/Title';
import { routes } from '@/config/routes';
import { useApp } from '@/context';
import useProposals from '@/hooks/useProposals';
import { formatAdaAmount } from '@/utils';
import { Proposal } from '@types';
import Link from 'next/link';
import { useState } from 'react';

const truncateToWords = (text: string, wordCount: number = 6) => {
  if (!text) return 'No description';
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

const getChipVariant = (status: Proposal['status']) => {
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
    case 'paid_out':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'inactive';
  }
};

const userProposalColumns: ColumnDef<Proposal>[] = [
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
      if (!value)
        return (
          <span className="text-muted-foreground text-sm">No description</span>
        );
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
      <span className="text-sm">{value ? formatAdaAmount(value) : 'N/A'}</span>
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
    cell: (value, row) =>
      row.txHash ? (
        <Link href={routes.my.proposals(row.txHash)}>
          <Button variant="primary" size="sm">
            View
          </Button>
        </Link>
      ) : (
        ''
      ),
  },
];

export default function ProposalSubmissionsTab({
  address,
}: {
  address?: string;
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | Proposal['status']>(
    'all',
  );
  const { userAddress } = useApp();

  const { allProposals, loading } = useProposals();

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'paid_out', label: 'Paid Out' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'signoff_pending', label: 'Awaiting Signoff' },
    { value: 'rejected', label: 'Rejected' },
  ];

  if (loading) {
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

  const userProposals = allProposals
    .filter((proposal) => {
      return proposal.submittedByAddress === (address || userAddress);
    })
    .map((proposal, index) => ({
      ...proposal,
      id: index + 1,
    }));

  // Apply status filter
  const filteredProposals =
    statusFilter === 'all'
      ? userProposals
      : userProposals.filter((proposal) => proposal.status === statusFilter);

  // Count by status for display
  const statusCounts = {
    pending: userProposals.filter((p) => p.status === 'pending').length,
    approved: userProposals.filter((p) => p.status === 'approved').length,
    signoff_pending: userProposals.filter((p) => p.status === 'signoff_pending')
      .length,
    paid_out: userProposals.filter((p) => p.status === 'paid_out').length,
  };

  if (userProposals.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Empty />
        <div className="mt-6 max-w-md text-center">
          <Title level="6" className="text-foreground mb-3">
            No Proposal Submissions
          </Title>
          <Paragraph className="text-muted-foreground mb-6">
            You haven't submitted any proposals yet. Share your ideas and
            contribute to the Cardano ecosystem by submitting a proposal.
          </Paragraph>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={routes.newProposal}>
              <Button variant="primary">Submit Proposal</Button>
            </Link>
            <Link href={routes.proposals}>
              <Button variant="outline" className="text-primary-base!">
                Browse Proposals
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Filter by status:</span>
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

      {/* Mobile-optimized scrollable table container */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px]">
          <Table
            data={filteredProposals}
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
