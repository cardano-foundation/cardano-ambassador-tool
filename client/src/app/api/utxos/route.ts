import { BlockfrostProvider, UTxO } from '@meshsdk/core';
import { scripts } from '@sidan-lab/cardano-ambassador-tool';
import { NextRequest, NextResponse } from 'next/server';

// Validate required environment variables
if (!process.env.BLOCKFROST_API_KEY_PREPROD) {
  throw new Error(
    'BLOCKFROST_API_KEY_PREPROD environment variable is required',
  );
}

const blockfrost = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY_PREPROD,
);

const allScripts = scripts({
  oracle: {
    txHash: process.env.NEXT_PUBLIC_ORACLE_SETUP_TX_HASH!,
    outputIndex: parseInt(process.env.NEXT_PUBLIC_ORACLE_SETUP_OUTPUT_INDEX!),
  },
  counter: {
    txHash: process.env.NEXT_PUBLIC_COUNTER_SETUP_TX_HASH!,
    outputIndex: parseInt(process.env.NEXT_PUBLIC_COUNTER_SETUP_OUTPUT_INDEX!),
  },
});

const SCRIPT_ADDRESSES = {
  MEMBERSHIP_INTENT: allScripts.membershipIntent.spend.address,
  MEMBER_NFT: allScripts.member.spend.address,
  PROPOSE_INTENT: allScripts.proposeIntent.spend.address,
  PROPOSAL: allScripts.proposal.spend.address,
  SIGN_OFF_APPROVAL: allScripts.signOffApproval.spend.address,
} as const;

const POLICY_IDS = {
  MEMBER_NFT: allScripts.member.mint.hash,
} as const;

const actionData = {
  sign_of_approval: {
    errorContext: 'sign off approval',
    address: SCRIPT_ADDRESSES.SIGN_OFF_APPROVAL,
  },
  member: {
    errorContext: 'Member',
    address: SCRIPT_ADDRESSES.MEMBER_NFT,
  },
  membership_intent: {
    errorContext: 'Membership Intent',
    address: SCRIPT_ADDRESSES.MEMBERSHIP_INTENT,
  },
  proposal: {
    errorContext: 'Proposal',
    address: SCRIPT_ADDRESSES.PROPOSAL,
  },
  proposal_intent: {
    errorContext: 'Proposal Intent',
    address: SCRIPT_ADDRESSES.PROPOSE_INTENT,
  },
  specific_address_utxos: {
    errorContext: 'Address',
    address: SCRIPT_ADDRESSES.PROPOSE_INTENT,
  },
} as const;

type ContextType = keyof typeof actionData;

type HandlerRequestBody = {
  context: ContextType;
  address: string;
};

export async function POST(req: NextRequest): Promise<
  | NextResponse<{
      error: string;
    }>
  | NextResponse<UTxO[]>
> {
  try {
    const body: HandlerRequestBody = await req.json();

    const { context, address } = body;

    const action = actionData[context];

    if (!action) {
      return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
    }

    const userAddress = address ?? action.address;

    const utxos = await fetchAddressUTxOs(userAddress);

    const validUtxos =
      context == 'specific_address_utxos'
        ? utxos
        : utxos.filter((utxo) => utxo.output.plutusData);

    return NextResponse.json(validUtxos, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function fetchAddressUTxOs(address: string): Promise<UTxO[]> {
  try {
    const utxos = await blockfrost.fetchAddressUTxOs(address);
    console.log(Array.isArray(utxos));
    // Ensure we always return an array
    return Array.isArray(utxos) ? utxos : [];
  } catch (error) {
    return [];
  }
}
