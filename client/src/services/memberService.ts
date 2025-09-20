'use client';

import { getProvider } from '@/utils';

// Environment variables
const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
const ORACLE_OUTPUT_INDEX = parseInt(
  process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
);

const blockfrost = getProvider();

// export const updateMembershipIntentMetadata = async (
//   metadata: MemberMetadata,
//   wallet: IWallet,
//   address: string,
// ) => {
//   // Find membership intent UTxO by wallet address
//   const userAddress = await wallet.getChangeAddress();
//   const membershipIntentUtxo = await import('@/utils/utils').then((utils) =>
//     utils.findMembershipIntentUtxo(userAddress),
//   );
//   if (!membershipIntentUtxo) {
//     throw new Error('No membership intent UTxO found for this address');
//   }
//   // Find token UTxO by membership intent UTxO
//   const tokenUtxo = await import('@/utils/utils').then((utils) =>
//     utils.findTokenUtxoByMembershipIntentUtxoMesh(membershipIntentUtxo),
//   );
//   if (!tokenUtxo) {
//     throw new Error('No token UTxO found for this membership intent');
//   }
//   // Find oracle UTxO
//   const oracleUtxos = await blockfrost.fetchUTxOs(
//     ORACLE_TX_HASH,
//     ORACLE_OUTPUT_INDEX,
//   );
//   const oracleUtxo = oracleUtxos[0];
//   if (!oracleUtxo) {
//     throw new Error('Failed to fetch required oracle UTxO');
//   }
//   const userAction = new UserActionTx(
//     userAddress,
//     wallet,
//     blockfrost,
//     getCatConstants(),
//   );
//   const userMetadata = membershipMetadata({
//       address: stringToHex(address),
//       name: stringToHex(metadata.fullname),
//       forum_username: stringToHex(metadata.displayName),
//       email: stringToHex(metadata.email),
//       bio: stringToHex(metadata.bio),
//       country: stringToHex(''), // default empty
//       city: stringToHex(''), // default empty
//     }
//   );
//   const result = await userAction.updateMembershipIntentMetadata(
//     oracleUtxo,
//     tokenUtxo,
//     membershipIntentUtxo,
//     userMetadata,
//   );
//   return result;
// };

// export const updateMemberMetadata = async (
//   metadata: MemberMetadata,
//   wallet: IWallet,
//   address: string,
// ) => {
//   // Find member UTxO by wallet address
//   const userAddress = await wallet.getChangeAddress();
//   const memberUtxo = await import('@/utils/utils').then((utils) =>
//     utils.findMemberUtxo(userAddress),
//   );
//   if (!memberUtxo) {
//     throw new Error('No member UTxO found for this address');
//   }
//   // Find token UTxO by member UTxO
//   const tokenUtxo = await import('@/utils/utils').then((utils) =>
//     utils.findTokenUtxoByMemberUtxo(memberUtxo),
//   );
//   if (!tokenUtxo) {
//     throw new Error('No token UTxO found for this member');
//   }
//   // Find oracle UTxO
//   const oracleUtxos = await blockfrost.fetchUTxOs(
//     ORACLE_TX_HASH,
//     ORACLE_OUTPUT_INDEX,
//   );
//   const oracleUtxo = oracleUtxos[0];
//   if (!oracleUtxo) {
//     throw new Error('Failed to fetch required oracle UTxO');
//   }
//   const userAction = new UserActionTx(
//     userAddress,
//     wallet,
//     blockfrost,
//     getCatConstants(),
//   );
//   const userMetadata = membershipMetadata({
//     address: stringToHex(address),
//     name: stringToHex(metadata.fullname),
//     forum_username: stringToHex(metadata.displayName),
//     email: stringToHex(metadata.email),
//     bio: stringToHex(metadata.bio),
//     country: stringToHex(''), // default empty
//     city: stringToHex(''), // default empty
//   });
//   const result = await userAction.updateMemberMetadata(
//     oracleUtxo,
//     memberUtxo,
//     tokenUtxo,
//     userMetadata,
//   );
//   return result;
// };
