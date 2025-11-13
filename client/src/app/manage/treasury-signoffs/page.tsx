'use client';

import Copyable from '@/components/Copyable';
import { ColumnDef, Table } from '@/components/Table/Table';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import Chip from '@/components/atoms/Chip';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { routes } from '@/config/routes';
import { useApp } from '@/context';
import { getCatConstants, parseProposalDatum, lovelaceToAda, formatAdaAmount } from '@/utils';
import Link from 'next/link';

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
    | 'ready';
  fundsRequested: string;
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
    accessor: 'url',
    sortable: false,
    cell: (value) => {
      if (!value) return <span className="text-sm text-muted-foreground">No details</span>;
      return (
        <div className="max-w-[300px] text-sm">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-base hover:underline flex items-center gap-1"
          >
            See more
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
      <Chip variant={getChipVariant(value)}>
        {value === 'ready'
          ? 'Ready for Withdrawal'
          : value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
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
  const { signOfApprovals, dbLoading, treasuryBalance, isTreasuryLoading } =
    useApp();

  // Convert BigInt treasury balance to ADA
  const treasuryBalanceAda = Math.floor(Number(treasuryBalance) / 1_000_000);

  if (dbLoading || isTreasuryLoading) {
    return <div className="p-4">Loading treasury sign-offs...</div>;
  }

  const decodedUtxos = signOfApprovals.map((utxo, idx) => {
    const decodedDatum: ProposalIntent = {
      title: '',
      url: '',
      fundsRequested: '0',
      receiverWalletAddress: '',
      status: 'ready',
      id: 0,
      txHash: utxo.txHash,
    };

    if (utxo.plutusData) {
      const { metadata } = parseProposalDatum(utxo.plutusData)!;

      if (metadata) {
        decodedDatum['title'] = metadata.title!;
        decodedDatum['url'] = metadata.url!;
        decodedDatum['fundsRequested'] = metadata.fundsRequested || '0';
        decodedDatum['receiverWalletAddress'] = metadata.receiverWalletAddress!;
        decodedDatum['id'] = idx + 1;
      }
    }

    return decodedDatum;
  });


  const totalPendingWithdrawals = decodedUtxos.reduce((sum, utxo) => {
    const adaAmount = parseFloat(utxo.fundsRequested || '0');
    return sum + (isNaN(adaAmount) ? 0 : adaAmount);
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
                <Paragraph className="text-muted-foreground mb-2 text-sm">
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
                  <Title
                    level="5"
                    className={
                      hasInsufficientBalance
                        ? 'font-semibold text-red-600'
                        : 'font-semibold text-green-600'
                    }
                  >
                    ₳{availableBalance.toLocaleString()}
                  </Title>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Deposit to Treasury */}{/* Insufficient Balance Warning */}
          {hasInsufficientBalance && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white">
                    !
                  </div>
                  <div className="space-y-1">
                    <Title level="6" className="font-semibold text-orange-800">
                      Insufficient Treasury Balance
                    </Title>
                    <Paragraph className="text-sm text-orange-700">
                      The current available balance (₳
                      {Math.abs(availableBalance).toLocaleString()}) is
                      insufficient to cover all pending withdrawals. Please
                      adjust the requested funds before proceeding with
                      sign-off.
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
                  Showing {decodedUtxos.length} of {decodedUtxos.length}{' '}
                  proposals
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
