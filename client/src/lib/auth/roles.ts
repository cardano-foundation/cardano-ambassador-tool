'use server';

import { BlockfrostService } from '@/services/blockfrostService';
import type { UTxO } from '@meshsdk/core';
import { deserializeAddress, deserializeDatum } from '@meshsdk/core';
import {
  getOracleAdmins,
  OracleDatum,
} from '@sidan-lab/cardano-ambassador-tool';
import { revalidateTag, unstable_cache } from 'next/cache';

const blockfrost = new BlockfrostService();

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

// ============================================================================
// Oracle UTxO Utilities
// ============================================================================

/**
 * Internal function to fetch oracle UTxO without cache
 * @returns The oracle UTxO or null if not found
 */
async function fetchOracleUtxoUncached(): Promise<UTxO | null> {
  try {
    const utxo = await blockfrost.fetchUtxo(
      process.env.NEXT_PUBLIC_ORACLE_TX_HASH!,
      parseInt(process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX!),
    );

    if (!utxo?.output?.plutusData) {
      return null;
    }

    return utxo;
  } catch (error) {
    console.error('Error fetching oracle UTxO:', error);
    return null;
  }
}

/**
 * Fetches the oracle UTxO with 24-hour caching
 * Oracle UTxO rarely changes, so long-term caching is appropriate
 *
 * @returns The oracle UTxO or null if not found
 */
export const findOracleUtxo = unstable_cache(
  fetchOracleUtxoUncached,
  ['oracle-utxo'],
  {
    revalidate: 86400, // 24 hours
    tags: ['oracle-utxo', 'oracle-data'],
  },
);

// ============================================================================
// Oracle Admin Data
// ============================================================================

// Internal function that does the actual fetching
async function fetchAdminsFromOracle(): Promise<{
  adminAddresses: string[];
  minsigners: number | BigInt;
} | null> {
  try {
    const oracleUtxo = await findOracleUtxo();
    const plutusData = oracleUtxo!.output.plutusData!;
    const datum: OracleDatum = deserializeDatum(plutusData);
    const minsigners = Number(datum.fields[2].int);
    const adminAddresses = getOracleAdmins(oracleUtxo!);

    return {
      adminAddresses,
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
  },
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

/**
 * Manually invalidate the oracle UTxO cache
 * Call this function when you know the oracle UTxO has been updated on-chain
 * @example
 * // After updating oracle on blockchain
 * await invalidateOracleUtxoCache();
 */
export async function invalidateOracleUtxoCache(): Promise<void> {
  revalidateTag('oracle-utxo');
}

/**
 * Manually invalidate all oracle-related caches (UTxO + admins)
 * Convenience function to clear all oracle data at once
 * @example
 * // After any oracle update on blockchain
 * await invalidateAllOracleCache();
 */
export async function invalidateAllOracleCache(): Promise<void> {
  revalidateTag('oracle-data'); // Clears both oracle-utxo and oracle-admins via shared tag
  revalidateTag('oracle-admins');
  revalidateTag('oracle-utxo');
}
