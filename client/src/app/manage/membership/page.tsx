'use client';

import Button from '@/components/atoms/Button';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import { ColumnDef, Table } from '@/components/Table/Table';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context/AppContext';
import { parseMembershipIntentDatum } from '@/utils';

export default function MembershipIntentPage() {
  const { membershipIntents, dbLoading } = useApp();

  if (dbLoading) {
    return <div className="p-4">Loading membership intents...</div>;
  }

  if (!membershipIntents.length) {
    return <div className="p-4">No membership intents found.</div>;
  }

  const decodedUtxos = membershipIntents.map((utxo, idx) => {
    let decodedDatum: {
      fullName: string;
      displayName: string;
      email: string;
      wallet: string;
      bio: string;
      index?: number;
    } = {
      fullName: '',
      displayName: '',
      email: '',
      wallet: '',
      bio: '',
    };

    if (utxo.plutusData) {
      const parsed = parseMembershipIntentDatum(utxo.plutusData);

      if (parsed && parsed.metadata) {
        decodedDatum['fullName'] = parsed.metadata.name!;
        decodedDatum['displayName'] = parsed.metadata.forum_username!;
        decodedDatum['email'] = parsed.metadata.email!;
        decodedDatum['wallet'] = parsed.metadata.address!;

        decodedDatum['bio'] = parsed.metadata.bio!;
        decodedDatum['index'] = idx;
      }
    }

    return { ...utxo, ...decodedDatum };
  });

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
        <span className="text-neutral font-medium">{value}</span>
      ),
    },
    {
      header: 'Action',
      sortable: true,
      copyable: true,
      cell: (value: string) => (
        <Button variant={'primary'} size="sm" className="text-nowrap">
          {'View intent'}
        </Button>
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
