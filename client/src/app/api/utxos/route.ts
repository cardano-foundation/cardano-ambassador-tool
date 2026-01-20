import { getCurrentNetworkConfig } from '@/config/cardano';
import { getCatConstants } from '@/utils';
import {
  parseMemberDatum,
  parseMembershipIntentDatum,
  parseProposalDatum,
} from '@/utils/utils';
import { BlockfrostProvider, UTxO } from '@meshsdk/core';
import { scripts } from '@sidan-lab/cardano-ambassador-tool';
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


const catConstants = getCatConstants();

const SCRIPT_ADDRESSES = {
  MEMBERSHIP_INTENT: catConstants.scripts.membershipIntent.spend.address,
  MEMBER_NFT: catConstants.scripts.member.spend.address,
  PROPOSE_INTENT: catConstants.scripts.proposeIntent.spend.address,
  PROPOSAL: catConstants.scripts.proposal.spend.address,
  SIGN_OFF_APPROVAL: catConstants.scripts.signOffApproval.spend.address,
  TREASURY_PAYOUTS: catConstants.scripts.treasury.spend.address,
} as const;

const actionData = {
  sign_of_approval: {
    errorContext: 'sign off approval',
    address: SCRIPT_ADDRESSES.SIGN_OFF_APPROVAL,
  },
  members: {
    errorContext: 'Member',
    address: SCRIPT_ADDRESSES.MEMBER_NFT,
  },
  membership_intent: {
    errorContext: 'Membership Intent',
    address: SCRIPT_ADDRESSES.MEMBERSHIP_INTENT,
  },
  proposals: {
    errorContext: 'Proposal',
    address: SCRIPT_ADDRESSES.PROPOSAL,
  },
  proposal_intent: {
    errorContext: 'Proposal Intent',
    address: SCRIPT_ADDRESSES.PROPOSE_INTENT,
  },
  specific_address_utxos: {
    errorContext: 'Address',
    address: '',
  },
  treasury_payouts: {
    errorContext: 'Treasury Payout',
    address: SCRIPT_ADDRESSES.TREASURY_PAYOUTS,
  },
} as const;

type ContextType = keyof typeof actionData;

type HandlerRequestBody = {
  context: ContextType;
  address: string;
  forceRefresh?: boolean;
};

export async function POST(req: NextRequest): Promise<
  | NextResponse<{
      error: string;
    }>
  | NextResponse<UTxO[]>
> {
  try {
    const body: HandlerRequestBody = await req.json();

    const { context, address, forceRefresh } = body;

    const action = actionData[context];

    if (!action) {
      return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
    }

    const userAddress = address ?? action.address;

    if (forceRefresh) {
      revalidateTag(`utxos-${userAddress}`);
      revalidateTag('all-utxos');
    }

    const utxos = await fetchAddressUTxOs(userAddress);

    const validUtxos =
      context == 'specific_address_utxos' 
        ? utxos
        : utxos.filter((utxo) => utxo.output.plutusData);

    const utxosWithMetadata = await Promise.all(
      validUtxos.map(async (utxo) => {
        if (!utxo.output.plutusData) return utxo;

        try {
          if (
            ['proposals', 'proposal_intent', 'sign_of_approval'].includes(
              context,
            )
          ) {
            const parsed = parseProposalDatum(utxo.output.plutusData);
            if (parsed?.metadata) {
              let filename = null;
              let description = null;
              
              if (parsed.metadata.url) {
                if (parsed.metadata.url.includes('|')) {
                  filename = parsed.metadata.url.split('|')[1];
                } else {
                  filename = parsed.metadata.url.split('/').pop();
                }
              }
              
              if (filename && filename.endsWith('.md')) {
                try {
                  const response = await fetch(
                    `${req.nextUrl.origin}/api/proposal-content?filename=${encodeURIComponent(filename)}`,
                    { next: { revalidate: 3600 } },
                  );
                  if (response.ok) {
                    const data = await response.json();
                    description = data.content;
                  }
                } catch (err) {
                  console.error('Error fetching description:', err);
                }
              }

              return {
                ...utxo,
                parsedMetadata: {
                  ...parsed.metadata,
                  description,
                  memberIndex: parsed.memberIndex,
                },
              };
            }
          } else if (context === 'membership_intent') {
            const parsed = parseMembershipIntentDatum(utxo.output.plutusData);
            if (parsed?.metadata) {
              return {
                ...utxo,
                parsedMetadata: parsed.metadata,
              };
            }
          } else if (context === 'members') {
            const parsed = parseMemberDatum(utxo.output.plutusData);
            if (parsed?.member) {
              return {
                ...utxo,
                parsedMetadata: parsed.member.metadata,
              };
            }
          } else {
            return utxo;
          }
        } catch (error) {
          console.error('Error parsing UTxO metadata:', error);
        }

        return utxo;
      }),
    );

    return NextResponse.json(utxosWithMetadata, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Uncached version - does actual blockchain fetch
async function fetchAddressUTxOsUncached(address: string): Promise<UTxO[]> {
  try {
    const utxos = await blockfrost.fetchAddressUTxOs(address);

    return Array.isArray(utxos) ? utxos : [];
  } catch (error) {
    return [];
  }
}

// Cached version with 1 hour revalidation
const fetchAddressUTxOs = (address: string) =>
  unstable_cache(
    async () => fetchAddressUTxOsUncached(address),
    ['address-utxos', address],
    {
      revalidate: 3600, // Cache for 1 hour
      tags: [`utxos-${address}`, 'all-utxos'],
    },
  )();
