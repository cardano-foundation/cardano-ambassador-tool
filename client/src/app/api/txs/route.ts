import { getCatConstants } from '@/utils';
import { BlockfrostProvider, TransactionInfo } from '@meshsdk/core';
import { revalidateTag, unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

if (!process.env.BLOCKFROST_API_KEY_PREPROD) {
  throw new Error(
    'BLOCKFROST_API_KEY_PREPROD environment variable is required',
  );
}

const blockfrost = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY_PREPROD,
);

type HandlerRequestBody = {
  forceRefresh?: boolean;
};

export async function POST(req: NextRequest): Promise<
  | NextResponse<{
      error: string;
    }>
  | NextResponse<TransactionInfo[]>
> {
  try {
    const body: HandlerRequestBody = await req.json();

    const { forceRefresh } = body;

    const catConstants = getCatConstants();
    const treasuryAddress = catConstants.scripts.treasury.spend.address;

    if (forceRefresh) {
      revalidateTag(`txs-${treasuryAddress}`);
    }

    const txs = await fetchAddressTxs(treasuryAddress);

    return NextResponse.json(txs, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Uncached version - does actual blockchain fetch
async function fetchAddressUTxOsUncached(
  address: string,
): Promise<TransactionInfo[]> {
  try {
    const txs = await blockfrost.fetchAddressTxs(address);

    return Array.isArray(txs) ? txs : [];
  } catch (error) {
    return [];
  }
}

// Cached version with 1 hour revalidation
const fetchAddressTxs = (address: string) =>
  unstable_cache(
    async () => fetchAddressUTxOsUncached(address),
    ['address-txs', address],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: [`txs-${address}`],
    },
  )();
