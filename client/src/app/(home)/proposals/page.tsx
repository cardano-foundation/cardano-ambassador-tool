'use client';

import Button from '@/components/atoms/Button';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Select from '@/components/atoms/Select';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import { ColumnDef, Table } from '@/components/Table/Table';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { routes } from '@/config/routes';
import useProposals from '@/hooks/useProposals';
import { formatAdaAmount } from '@/utils';
import { Proposal } from '@types';
import { ArrowUpRightFromSquare } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const getChipVariant = (status: Proposal['status']) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'submitted':
      return 'default';
    case 'under_review':
      return 'default';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'signoff_pending':
      return 'success';
    case 'paid_out':
      return 'success';
    default:
      return 'inactive';
  }
};

const formatStatus = (status: Proposal['status']) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
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
            <ArrowUpRightFromSquare className="size-4" />
          </a>
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
        {value && value !== '0' ? formatAdaAmount(value) : 'N/A'}
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
    cell: (value, row) => (
      <div className="space-y-1">
        <Chip variant={getChipVariant(value)} className="text-nowrap">
          {formatStatus(value)}
        </Chip>
      </div>
    ),
  },
  {
    header: 'Action',
    sortable: false,
    cell: (value, row) => {
      if (row.txHash) {
        return (
          <Link href={routes.proposal(row.txHash)}>
            <Button variant="primary" size="sm">
              View
            </Button>
          </Link>
        );
      } else if (row.status === 'paid_out' && row.slug) {
        return (
          <Link href={routes.completedProposal(row.slug)}>
            <Button variant="primary" size="sm">
              View
            </Button>
          </Link>
        );
      }
      return '';
    },
  },
];

export default function ProposalsPage() {
  const { allProposals, loading } = useProposals();
  const [statusFilter, setStatusFilter] = useState<'all' | Proposal['status']>(
    'all',
  );

  if (loading) {
    return <SimpleCardanoLoader />;
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
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Title level="5" className="text-foreground">
                Community Proposals
              </Title>
              <Paragraph className="text-muted-foreground text-sm">
                Browse and discover all proposals at every stage of the process.
              </Paragraph>
            </div>
            <Link href={routes.newProposal} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                New Proposal
              </Button>
            </Link>
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

          {/* Mobile-optimized scrollable table container */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <Table
                data={filteredProposals}
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
