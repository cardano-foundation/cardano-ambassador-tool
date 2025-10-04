'use server';

import { findOracleUtxo } from '@/utils';
import { deserializeAddress, deserializeDatum } from '@meshsdk/core';
import { OracleDatum } from '@sidan-lab/cardano-ambassador-tool';
import { unstable_cache, revalidateTag } from 'next/cache';

function getAdminPubKeyHashes(): string[] {
  const adminList = Object.keys(process.env)
    .filter((key) => key.startsWith('ADMIN_WALLET'))
    .map((key) => {
      try {
        const address = process.env[key];
        if (!address) return null;
        return deserializeAddress(address).pubKeyHash;
      } catch (error) {
        console.error(`Error deserializing admin address ${key}:`, error);
        return null;
      }
    })
    .filter(Boolean) as string[];

  return adminList;
}

export async function resolveRoles(address: string): Promise<
  {
    role: string;
  }[]
> {
  const roles: { role: string }[] = [];

  try {
    // Get admin pub key hashes from environment
    const adminsPubKeyHashes = getAdminPubKeyHashes();

    // Get user's pub key hash
    const userPubKeyHash = deserializeAddress(address).pubKeyHash;

    // Check if user is admin
    if (adminsPubKeyHashes.includes(userPubKeyHash)) {
      roles.push({ role: 'admin' });
    } else {
    }
  } catch (error) {
    console.error('Error resolving user roles:', error);
  }

  return roles;
}

// Internal function that does the actual fetching
async function fetchAdminsFromOracle(): Promise<{
  adminPubKeyHashes: string[];
  minsigners: number | BigInt;
} | null> {
  try {
    const oracleUtxo = await findOracleUtxo();
    const plutusData = oracleUtxo!.output.plutusData!;
    const datum: OracleDatum = deserializeDatum(plutusData);
    const minsigners = Number(datum.fields[2].int);
    const adminPubKeyHashes: string[] = datum.fields[0].list.map((item) => {
      return item.bytes;
    });

    return {
      adminPubKeyHashes,
      minsigners,
    };
  } catch (error) {
    console.error('Error finding admins from oracle:', error);
    return null;
  }
}

// Cached version with 24 hour revalidation
// This is cached because oracle data rarely changes
export const findAdminsFromOracle = unstable_cache(
  fetchAdminsFromOracle,
  ['oracle-admins'],
  {
    revalidate: 86400, 
    tags: ['oracle-admins'], 
  }
);

/**
 * Manually invalidate the oracle admins cache
 * Call this function when you know the oracle data has been updated on-chain
 * @example
 * // After updating oracle on blockchain
 * await invalidateOracleAdminsCache();
 */
export async function invalidateOracleAdminsCache(): Promise<void> {
  revalidateTag('oracle-admins');
}
