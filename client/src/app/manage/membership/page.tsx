'use client';

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
  const { intents, dbLoading } = useApp();

  if (dbLoading) {
    return <div className="p-4">Loading membership intents...</div>;
  }

  if (!intents.length) {
    return <div className="p-4">No membership intents found.</div>;
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full rounded-lg border border-gray-700">
        <thead>
          <tr>
            <th className="border border-gray-700 px-4 py-2 text-gray-200">
              #
            </th>
            <th className="border border-gray-700 px-4 py-2 text-gray-200">
              Tx Hash
            </th>
            <th className="border border-gray-700 px-4 py-2 text-gray-200">
              Output Index
            </th>
            <th className="border border-gray-700 px-4 py-2 text-gray-200">
              Full Name
            </th>
            <th className="border border-gray-700 px-4 py-2 text-gray-200">
              Display Name
            </th>
            <th className="border border-gray-700 px-4 py-2 text-gray-200">
              Email
            </th>
            <th className="border border-gray-700 px-4 py-2 text-gray-200">
              Wallet
            </th>
            <th className="border border-gray-700 px-4 py-2 text-gray-200">
              Bio
            </th>
            <th className="border border-gray-700 px-4 py-2 text-gray-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {intents.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-4 text-center text-gray-400">
                No UTXOs found
              </td>
            </tr>
          ) : (
            intents.map((utxo, idx) => {
              let fullName = '-',
                displayName = '-',
                email = '-',
                wallet = '-',
                bio = '-';
              if (utxo.plutusData) {
                const parsed = parseMembershipIntentDatum(utxo.plutusData);
                if (parsed && parsed.metadata) {
                  fullName = parsed.metadata.fullName;
                  displayName = parsed.metadata.displayName;
                  email = parsed.metadata.emailAddress;
                  wallet = parsed.metadata.walletAddress;
                  bio = parsed.metadata.bio;
                }
              }
              return (
                <tr
                  key={`${utxo.txHash}-${utxo.outputIndex}`}
                  className="cursor-pointer hover:bg-gray-700"
                >
                  <td className="border border-gray-700 px-4 py-2 text-gray-100">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 break-all text-gray-100">
                    {utxo.txHash}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-gray-100">
                    {utxo.outputIndex}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-gray-100">
                    {fullName}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-gray-100">
                    {displayName}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-gray-100">
                    {email}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 break-all text-gray-100">
                    {wallet}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-gray-100">
                    {bio}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-gray-100">
                    {/* <button
                      className="mr-2 rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700"
                      onClick={() => handleApproveMember(utxo)}
                      disabled={
                        state.loading ||
                        !state.counterUtxoHash ||
                        !state.counterUtxoIndex
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                      onClick={() => handleRejectMember(utxo)}
                      disabled={state.loading}
                    >
                      Reject
                    </button> */}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
