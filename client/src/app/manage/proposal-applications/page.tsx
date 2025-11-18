'use client';

import { ColumnDef, Table } from '@/components/Table/Table';
import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import Select from '@/components/atoms/Select';
import Title from '@/components/atoms/Title';
import { routes } from '@/config/routes';
import useProposals from '@/hooks/useProposals';
import { formatAdaAmount } from '@/utils';
import { Proposal } from '@types';
import Link from 'next/link';
import { useState } from 'react';

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

const proposalIntentColumns: ColumnDef<Proposal>[] = [
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
    cell: (value, row) =>
      row.txHash ? (
        <Link href={routes.manage.proposal(row.txHash)} prefetch={true}>
          <Button variant="primary" size="md">
            View
          </Button>
        </Link>
      ) : (
        ''
      ),
  },
];

export default function ProposalIntentsPage() {
  const { allProposals, loading } = useProposals();
  const [statusFilter, setStatusFilter] = useState<'all' | Proposal['status']>(
    'all',
  );

  if (loading) {
    return <div className="p-4">Loading proposals...</div>;
  }

  // Combine all proposal stages

  if (!allProposals.length) {
    return <div className="p-4">No proposals found.</div>;
  }

  // Apply status filter
  const filteredProposals =
    statusFilter === 'all'
      ? allProposals
      : allProposals.filter((proposal) => proposal.status === statusFilter);

  // Count by status for display
  const statusCounts = {
    pending: allProposals.filter((p) => p.status === 'pending').length,
    approved: allProposals.filter((p) => p.status === 'approved').length,
    signoff_pending: allProposals.filter((p) => p.status === 'signoff_pending')
      .length,
    paid_out: allProposals.filter((p) => p.status === 'paid_out').length,
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'paid_out', label: 'Paid Out' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
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
