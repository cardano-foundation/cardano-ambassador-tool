'use client';

import Button from '@/components/atoms/Button';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import UserAvatar from '@/components/atoms/UserAvatar';
import Copyable from '@/components/Copyable';
import { ColumnDef, Table } from '@/components/Table/Table';
import { useApp } from '@/context/AppContext';
import { getCountryByCode, parseMemberDatum } from '@/utils';
import Link from 'next/link';

export default function ManageAmbassadorsPage() {
  const { members, dbLoading } = useApp();

  if (dbLoading) {
    return <div className="p-4">Loading ambassadors...</div>;
  }

  if (!members || members.length === 0) {
    return <div className="p-4">No Ambassadors Found</div>;
  }

  const decodedUtxos = members
    ?.map((utxo: any) => {
      const decodedDatum: {
        fullName: string;
        displayName: string;
        country: string;
        address: string;
        utxoHash: any;
      } = {
        fullName: '',
        displayName: '',
        country: '',
        utxoHash: '',
        address: '',
      };

      if (utxo.plutusData) {
        const { member } = parseMemberDatum(utxo.plutusData)!;

        const memberMetadata = member.metadata;

        if (member && memberMetadata) {
          decodedDatum['fullName'] = memberMetadata.fullName!;
          decodedDatum['displayName'] = memberMetadata.displayName!;
          decodedDatum['country'] = memberMetadata.country!;
          decodedDatum['address'] = memberMetadata.walletAddress!;
          decodedDatum['utxoHash'] = utxo?.txHash!;
        }

        console.log(memberMetadata.walletAddress);
        
      }
      return { ...utxo, ...decodedDatum };
    })
    .filter((utxo) => utxo.address && utxo.address.trim() !== '');

  const getCountryFlag = (code: string): string => {
    if (!code) return 'https://flagcdn.com/w40/un.png';
    return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  };

  const ambassadorId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '');
  };

  const columns: ColumnDef<(typeof decodedUtxos)[number]>[] = [
    {
      header: 'Ambassador',
      accessor: 'fullName',
      sortable: true,
      cell: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <UserAvatar size="size-10" name={value} />
          <p className="flex flex-col gap-1">
            <span className="font-sm font-bold">{value}</span>
            <span className="text-neutral font-normal">{row?.displayName}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Country',
      accessor: 'country',
      sortable: true,
      cell: (value: string) => (
        <div>
          <img
            src={getCountryFlag(value)}
            alt={value}
            className="mr-2 inline size-6 rounded-full"
          />
          <span className="text-neutral font-normal">
            {getCountryByCode(value)?.name||''}
          </span>
        </div>
      ),
    },
    {
      header: 'Utxo Hash',
      accessor: 'utxoHash',
      sortable: false,
      cell: (value: string) => (
        <Copyable withKey={false} value={value} keyLabel={''} />
      ),
    },
    {
      header: 'Action',
      accessor: 'fullName',
      cell: (value: string, row: any) => {
        const name = row.displayName || value;
        return (
          <Link href={`/ambassadors/${ambassadorId(name)}`}>
            <Button variant="primary" size="sm" className="text-nowrap">
              View Ambassador
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 px-4 py-2 pb-8 sm:space-y-6 sm:px-6">
      <div className="space-y-3 sm:space-y-4">
        <Title level="2" className="text-xl sm:text-2xl">
          Manage Ambassadors
        </Title>
        <Paragraph
          size="base"
          className="text-muted-foreground max-w-4xl text-sm sm:text-base"
        >
          Review and manage Cardano ambassadors.
        </Paragraph>
      </div>
      <section className="w-full overflow-x-auto">
        <Table
          data={decodedUtxos}
          columns={columns}
          pageSize={10}
          searchable={true}
          context="ambassadors"
        />
      </section>
    </div>
  );
}
