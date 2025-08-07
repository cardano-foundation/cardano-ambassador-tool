import { parseMemberDatum, parseMembershipIntentDatum, parseProposalDatum } from "@/utils";
import { BlockfrostProvider, UTxO } from "@meshsdk/core";
import { scripts } from "@sidan-lab/cardano-ambassador-tool";
import { NextRequest, NextResponse } from 'next/server';


const blockfrost = new BlockfrostProvider(
    process.env.BLOCKFROST_API_KEY_PREPROD || ""
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

export const SCRIPT_ADDRESSES = {
    MEMBERSHIP_INTENT: allScripts.membershipIntent.spend.address,
    MEMBER_NFT: allScripts.member.spend.address,
    PROPOSE_INTENT: allScripts.proposeIntent.spend.address,
    PROPOSAL: allScripts.proposal.spend.address,
    SIGN_OFF_APPROVAL: allScripts.signOffApproval.spend.address,
} as const;

export const POLICY_IDS = {
    MEMBER_NFT: allScripts.member.mint.hash,
} as const;

const actionData = {
    sign_of_approval: {
        parser: parseProposalDatum,
        errorContext: "sign off approval",
        address: SCRIPT_ADDRESSES.SIGN_OFF_APPROVAL,
    },
    member: {
        parser: parseMemberDatum,
        errorContext: "Member",
        address: SCRIPT_ADDRESSES.MEMBER_NFT,
    },
    membership_intent: {
        parser: parseMembershipIntentDatum,
        errorContext: "Membership Intent",
        address: SCRIPT_ADDRESSES.MEMBERSHIP_INTENT,
    },
    proposal: {
        parser: parseProposalDatum,
        errorContext: "Proposal",
        address: SCRIPT_ADDRESSES.PROPOSAL,
    },
    proposal_intent: {
        parser: parseMemberDatum,
        errorContext: "Proposal Intent",
        address: SCRIPT_ADDRESSES.PROPOSE_INTENT,
    },
} as const;

type ContextType = keyof typeof actionData;

type HandlerRequestBody = {
    context: ContextType;
    params?: {
        address: string
    }
};

export async function POST(req: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<UTxO[]>> {

    try {
        const body: HandlerRequestBody = await req.json();

        const { context, params } = body;

        const action = actionData[context];

        if (!action) {
            return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
        }

        const userAddress = params?.address ?? action.address;
        
        const utxos = await fetchAddressUTxOs(userAddress);

        const validUtxos = await Promise.all(
            utxos
                .filter((utxo) => utxo.output.plutusData)
                .map(async (utxo) => {
                    try {
                        const parsed = action.parser(utxo.output?.plutusData ?? '');

                        if (!parsed) return null;
                        return utxo;
                    } catch (error) {
                        console.error(`Error parsing ${action.errorContext} UTxO:`, error);
                        return null;
                    }
                })
        );

        const filtered = validUtxos.filter((utxo): utxo is UTxO => utxo !== null);

        return NextResponse.json(filtered, { status: 200 });
    } catch (error) {
        console.error('Error in POST /api/utxos:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function fetchAddressUTxOs(address: string): Promise<UTxO[]> {
    const utxos = await blockfrost.fetchAddressUTxOs(address);
    return utxos;
}

