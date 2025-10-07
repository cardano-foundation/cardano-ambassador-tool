'use client';

import Button from '@/components/atoms/Button';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import { ColumnDef, Table } from '@/components/Table/Table';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context/AppContext';
import { parseMembershipIntentDatum } from '@/utils';
import Link from 'next/link';

export default function ManageAmbassadorsPage() {
  const { members, dbLoading } = useApp();

  if (dbLoading) {
    return <div className="p-4">Loading membership intents...</div>;
  }

  if (!members.length) {
    return <div className="p-4">No membership intents found.</div>;
  }

  const decodedUtxos = members
    .map((utxo, idx) => {
      const decodedDatum: {
        fullName: string;
        displayName: string;
        email: string;
        address: string;
        bio: string;
        index?: number;
      } = {
        fullName: '',
        displayName: '',
        email: '',
        address: '',
        bio: '',
      };

      if (utxo.plutusData) {
        const parsed = parseMembershipIntentDatum(utxo.plutusData);

        if (parsed && parsed.metadata) {
          decodedDatum['fullName'] = parsed.metadata.fullName!;
          decodedDatum['displayName'] = parsed.metadata.displayName!;
          decodedDatum['email'] = parsed.metadata.emailAddress!;
          decodedDatum['address'] = parsed.metadata.walletAddress!;
          decodedDatum['bio'] = parsed.metadata.bio!;
          decodedDatum['index'] = idx;
        }
      }

      return { ...utxo, ...decodedDatum };
    })
    .filter((utxo) => utxo.address && utxo.address.trim() !== '');

  const columns: ColumnDef<(typeof decodedUtxos)[number]>[] = [
    {
      header: '#',
      accessor: 'index',
      sortable: true,
      cell: (value: string) => (
        <span className="text-neutral font-normal">{value}</span>
      ),
    },
    {
      header: 'Tx Hash',
      accessor: 'txHash',
      sortable: false,
      // copyable: true,
      cell: (value: string) => (
        <Copyable
          withKey={false}
          link={`${getCurrentNetworkConfig().explorerUrl}/transaction/${value}`}
          value={value}
          keyLabel={''}
        />
      ),
    },
    {
      header: 'Address',
      accessor: 'address',
      sortable: false,
      // copyable: true,
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
      header: 'Full Name',
      accessor: 'fullName',
      sortable: true,
      cell: (value: string) => (
        <span className="text-neutral font-normal">{value}</span>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
      cell: (value: string) => (
        <span className="text-neutral font-normal">{value}</span>
      ),
    },
    {
      header: 'Bio',
      accessor: 'bio',
      sortable: true,
      cell: (value: string) => (
        <span className="text-neutral truncate font-medium text-ellipsis">
          {value}
        </span>
      ),
    },
    {
      header: 'Action',
      sortable: true,
      copyable: true,
      accessor: 'txHash',
      cell: (value: string) => (
        <Link href={`/manage/memberships/${value}`}>
          <Button variant={'primary'} size="sm" className="text-nowrap">
            {'View intent'}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4 px-4 py-2 pb-8 sm:space-y-6 sm:px-6">
      <div className="space-y-3 sm:space-y-4">
        <Title level="2" className="text-xl sm:text-2xl">
          Membership intent
        </Title>
        <Paragraph
          size="base"
          className="text-muted-foreground max-w-4xl text-sm sm:text-base"
        >
          Review and manage Membership intent requests submitted by users who
          wish to become recognized ambassadors.
        </Paragraph>
      </div>
      {/* Scrollable container */}
      <section className="w-full overflow-x-auto">
        <Table
          data={decodedUtxos}
          columns={columns}
          pageSize={10}
          searchable={true}
          context="membership intents"
        />
      </section>
    </div>
  );
}
