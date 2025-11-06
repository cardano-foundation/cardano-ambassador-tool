'use client';

import Copyable from '@/components/Copyable';
import { ColumnDef, Table } from '@/components/Table/Table';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import { CopyIcon } from '@/components/atoms/CopyIcon';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Chip from '@/components/atoms/Chip';
import Link from 'next/link';
import DepositToTreasury from '@/components/DepositToTreasury';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { routes } from '@/config/routes';
import { useApp } from '@/context';
import { parseProposalDatum, getCatConstants, getProvider } from '@/utils';
import { useState, useEffect } from 'react';

type ProposalIntent = {
  id: number;
  title: string;
  description: string;
  submittedByAddress: string;
  receiverWalletAddress: string;
  createdAt?: string;
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'ready';
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
    case 'ready':
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
        {value ? `₳${value.toLocaleString()}` : 'N/A'}
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
        {value === 'ready' ? 'Ready for Withdrawal' : value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
      </Chip>
    ),
  },
  {
    header: 'Action',
    sortable: false,
    cell: (value, row) => (
      <Link href={routes.manage.treasurySignoff(row.txHash)} prefetch={true}>
        <Button variant="primary" size="sm">
          View
        </Button>
      </Link>
    ),
  },
];

export default function TreasurySignOffsPage() {
  const { signOfApprovals, dbLoading, treasuryBalance, isTreasuryLoading } = useApp();
  
  // Convert BigInt treasury balance to ADA
  const treasuryBalanceAda = Math.floor(Number(treasuryBalance) / 1_000_000);

  if (dbLoading || isTreasuryLoading) {
    return <div className="p-4">Loading treasury sign-offs...</div>;
  }

  const decodedUtxos = signOfApprovals.map((utxo, idx) => {
    const decodedDatum: ProposalIntent = {
      title: '',
      description: '',
      fundsRequested: 0,
      receiverWalletAddress: '',
      submittedByAddress: '',
      status: 'ready',
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

  // Calculate treasury overview totals using real data
  const totalPendingWithdrawals = decodedUtxos.reduce((sum, utxo) => {
    return sum + (utxo.fundsRequested || 0);
  }, 0);
  const availableBalance = treasuryBalanceAda - totalPendingWithdrawals;
  const hasInsufficientBalance = availableBalance < 0;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <Title level="4" className="text-foreground font-semibold">
              Treasury Sign off Tracker
            </Title>
          </div>

          {/* Treasury Overview Card */}
          <Card>
            <CardContent className="p-6">
              <Title level="5" className="text-foreground mb-6 font-medium">
                Treasury Overview
              </Title>
              <div className="mb-6">
                <Paragraph className="text-muted-foreground text-sm mb-2">
                  Treasury Address
                </Paragraph>
                <Copyable
                  withKey={false}
                  link={`${getCurrentNetworkConfig().explorerUrl}/address/${getCatConstants().scripts.treasury.spend.address}`}
                  value={getCatConstants().scripts.treasury.spend.address}
                  keyLabel={''}
                />
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div className="space-y-2">
                  <Paragraph className="text-muted-foreground text-sm">
                    Total Treasury
                  </Paragraph>
                  <Title level="5" className="text-foreground font-semibold">
                    ₳{treasuryBalanceAda.toLocaleString()}
                  </Title>
                </div>
                <div className="space-y-2">
                  <Paragraph className="text-muted-foreground text-sm">
                    Pending Withdrawals
                  </Paragraph>
                  <Title level="5" className="text-foreground font-semibold">
                    ₳{totalPendingWithdrawals.toLocaleString()}
                  </Title>
                </div>
                <div className="space-y-2">
                  <Paragraph className="text-muted-foreground text-sm">
                    Remaining After All Withdrawals
                  </Paragraph>
                  <Title level="5" className={hasInsufficientBalance ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                    ₳{availableBalance.toLocaleString()}
                  </Title>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deposit to Treasury */}
          <DepositToTreasury />

          {/* Insufficient Balance Warning */}
          {hasInsufficientBalance && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-orange-400 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    !
                  </div>
                  <div className="space-y-1">
                    <Title level="6" className="text-orange-800 font-semibold">
                      Insufficient Treasury Balance
                    </Title>
                    <Paragraph className="text-orange-700 text-sm">
                      The current available balance (₳{Math.abs(availableBalance).toLocaleString()}) is insufficient to cover all pending withdrawals. Please adjust the requested funds before proceeding with sign-off.
                    </Paragraph>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {signOfApprovals.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Paragraph className="text-muted-foreground text-sm">
                  Showing {decodedUtxos.length} of {decodedUtxos.length} proposals
                </Paragraph>
              </div>

              <Table
                data={decodedUtxos}
                columns={proposalIntentColumns}
                pageSize={10}
                searchable={true}
                searchPlaceholder="Search proposal/ambassador"
                context="treasury-signoffs"
                autoSize={true}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Paragraph className="text-muted-foreground">
                  No treasury sign-offs found.
                </Paragraph>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
