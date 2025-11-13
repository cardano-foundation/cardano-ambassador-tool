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
import { useApp } from '@/context';
import { formatAdaAmount, parseMemberDatum, parseProposalDatum } from '@/utils';
import Link from 'next/link';
import { useState } from 'react';

type Proposal = {
  id: number;
  title: string;
  details: string;
  receiverWalletAddress: string;
  submittedByAddress: string;
  fundsRequested: string;
  status:
    | 'pending'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'signoff_pending'
    | 'treasury_signoff';
  txHash: string;
  progress?: {
    current: number;
    total: number;
    stage: string;
  };
};

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
    case 'treasury_signoff':
      return 'success';
    default:
      return 'inactive';
  }
};

const formatStatus = (status: Proposal['status']) => {
  switch (status) {
    case 'signoff_pending':
      return 'Awaiting Signoff';
    case 'under_review':
      return 'Under Review';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
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
            className="prose-sm [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm [&_p]:mb-1 [&_strong]:font-semibold"
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
  const { proposals, proposalIntents, signOfApprovals, dbLoading, members } =
    useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | Proposal['status']>(
    'all',
  );

  if (dbLoading) {
    return <SimpleCardanoLoader />;
  }

  const completedProposals = members.flatMap((mbr) => {
    const parsed = parseMemberDatum(mbr.plutusData!);
    const proposalsWithValue = Array.from(
      parsed?.member.completion!,
      ([proposal, value]) => ({
        ...proposal,
        status: 'success',
        progress: {
          current: 1,
          total: 3,
          stage: 'Treasury withrawal',
        },
      }),
    );

    return proposalsWithValue;
  });

  console.log({ completedProposals });

  const allProposals = [...proposalIntents, ...proposals, ...signOfApprovals];

  const proposalsData: Proposal[] = allProposals
    .map((utxo, idx) => {
      if (!utxo.plutusData) return null;

      try {
        let metadata: any;
        let description = 'No description provided';

        if (utxo.parsedMetadata) {
          try {
            const parsed =
              typeof utxo.parsedMetadata === 'string'
                ? JSON.parse(utxo.parsedMetadata)
                : utxo.parsedMetadata;
            metadata = parsed;
            description = parsed.description || 'No description provided';
          } catch (e) {
            const { metadata: datumMetadata } = parseProposalDatum(
              utxo.plutusData,
            )!;
            metadata = datumMetadata;
          }
        } else {
          const { metadata: datumMetadata } = parseProposalDatum(
            utxo.plutusData,
          )!;
          metadata = datumMetadata;
        }

        if (!metadata) return null;

        let status: Proposal['status'] = 'pending';
        let progress: Proposal['progress'] | undefined;

        if (signOfApprovals.some((p) => p.txHash === utxo.txHash)) {
          status = 'signoff_pending';
          progress = {
            current: 1,
            total: 3,
            stage: 'Treasury Signoff',
          };
        } else if (proposals.some((p) => p.txHash === utxo.txHash)) {
          status = 'approved';
        } else {
          status = 'pending';
        }

        return {
          id: idx + 1,
          title: metadata.title || 'Untitled Proposal',
          details: description,
          receiverWalletAddress: metadata.receiverWalletAddress || '',
          submittedByAddress: metadata.submittedByAddress || '',
          fundsRequested: metadata.fundsRequested || '0',
          status,
          txHash: utxo.txHash,
          progress,
        };
      } catch (error) {
        console.error('Error parsing proposal datum:', error);
        return null;
      }
    })
    .filter(Boolean) as Proposal[];

  const uniqueProposals = proposalsData.reduce((acc, current) => {
    const existing = acc.find((item) => item.txHash === current.txHash);
    if (!existing) {
      acc.push(current);
    } else {
      const statusPriority = {
        rejected: 1,
        submitted: 3,
        under_review: 1,
        signoff_pending: 3,
        treasury_signoff: 3,
        approved: 2,
        pending: 1,
      };

      if (statusPriority[current.status] > statusPriority[existing.status]) {
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
    }
    return acc;
  }, [] as Proposal[]);

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
    // { value: 'rejected', label: 'Rejected' },
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
