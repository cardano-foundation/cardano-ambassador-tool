'use client';

import Button from '@/components/atoms/Button';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import { ColumnDef, Table } from '@/components/Table/Table';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context/AppContext';
import { parseMembershipIntentDatum } from '@/utils';

interface MembershipIntent {
  id: number;
  memberName: string;
  email: string;
  status: string;
  created_at: string;
}

export default function MembershipIntentPage() {
  const { membershipIntents, dbLoading } = useApp();

  if (dbLoading) {
    return <div className="p-4">Loading membership intents...</div>;
  }

  if (!membershipIntents.length) {
    return <div className="p-4">No membership intents found.</div>;
  }

  // return (
  //   <div className="overflow-x-auto p-4">
  //     <table className="min-w-full rounded-lg border border-gray-700">
  //       <thead>
  //         <tr>
  //           <th className="border border-gray-700 px-4 py-2 text-gray-200">
  //             #
  //           </th>
  //           <th className="border border-gray-700 px-4 py-2 text-gray-200">
  //             Tx Hash
  //           </th>
  //           <th className="border border-gray-700 px-4 py-2 text-gray-200">
  //             Output Index
  //           </th>
  //           <th className="border border-gray-700 px-4 py-2 text-gray-200">
  //             Full Name
  //           </th>
  //           <th className="border border-gray-700 px-4 py-2 text-gray-200">
  //             Display Name
  //           </th>
  //           <th className="border border-gray-700 px-4 py-2 text-gray-200">
  //             Email
  //           </th>
  //           <th className="border border-gray-700 px-4 py-2 text-gray-200">
  //             Wallet
  //           </th>
  //           <th className="border border-gray-700 px-4 py-2 text-gray-200">
  //             Bio
  //           </th>
  //           <th className="border border-gray-700 px-4 py-2 text-gray-200">
  //             Actions
  //           </th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {intents.length === 0 ? (
  //           <tr>
  //             <td colSpan={9} className="py-4 text-center text-gray-400">
  //               No UTXOs found
  //             </td>
  //           </tr>
  //         ) : (
  //           intents.map((utxo, idx) => {
  //             let fullName = '-',
  //               displayName = '-',
  //               email = '-',
  //               wallet = '-',
  //               bio = '-';
  //             if (utxo.plutusData) {
  //               const parsed = parseMembershipIntentDatum(utxo.plutusData);
  //               if (parsed && parsed.metadata) {
  //                 fullName = parsed.metadata.fullName;
  //                 displayName = parsed.metadata.displayName;
  //                 email = parsed.metadata.emailAddress;
  //                 wallet = parsed.metadata.walletAddress;
  //                 bio = parsed.metadata.bio;
  //               }
  //             }
  //             return (
  //               <tr
  //                 key={`${utxo.txHash}-${utxo.outputIndex}`}
  //                 className="cursor-pointer hover:bg-gray-700"
  //               >
  //                 <td className="border border-gray-700 px-4 py-2 text-gray-100">
  //                   {idx + 1}
  //                 </td>
  //                 <td className="border border-gray-700 px-4 py-2 break-all text-gray-100">
  //                   {utxo.txHash}
  //                 </td>
  //                 <td className="border border-gray-700 px-4 py-2 text-gray-100">
  //                   {utxo.outputIndex}
  //                 </td>
  //                 <td className="border border-gray-700 px-4 py-2 text-gray-100">
  //                   {fullName}
  //                 </td>
  //                 <td className="border border-gray-700 px-4 py-2 text-gray-100">
  //                   {displayName}
  //                 </td>
  //                 <td className="border border-gray-700 px-4 py-2 text-gray-100">
  //                   {email}
  //                 </td>
  //                 <td className="border border-gray-700 px-4 py-2 break-all text-gray-100">
  //                   {wallet}
  //                 </td>
  //                 <td className="border border-gray-700 px-4 py-2 text-gray-100">
  //                   {bio}
  //                 </td>
  //                 <td className="border border-gray-700 px-4 py-2 text-gray-100">
  //                   {/* <button
  //                     className="mr-2 rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700"
  //                     onClick={() => handleApproveMember(utxo)}
  //                     disabled={
  //                       state.loading ||
  //                       !state.counterUtxoHash ||
  //                       !state.counterUtxoIndex
  //                     }
  //                   >
  //                     Approve
  //                   </button>
  //                   <button
  //                     className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
  //                     onClick={() => handleRejectMember(utxo)}
  //                     disabled={state.loading}
  //                   >
  //                     Reject
  //                   </button> */}
  //                 </td>
  //               </tr>
  //             );
  //           })
  //         )}
  //       </tbody>
  //     </table>
  //   </div>
  // );

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
        decodedDatum['fullName'] = parsed.metadata.fullName;
        decodedDatum['displayName'] = parsed.metadata.displayName;
        decodedDatum['email'] = parsed.metadata.emailAddress;
        decodedDatum['wallet'] = parsed.metadata.walletAddress;
        decodedDatum['bio'] = parsed.metadata.bio;
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
        <Copyable
          withKey={false}
          link={true}
          value={
            ' Review and manage Membership intent requests submitted by users who wish to become recognized ambassadors.'
          }
          keyLabel={''}
        />
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
