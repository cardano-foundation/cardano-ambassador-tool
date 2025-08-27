import { CATConstants } from "@sidan-lab/cardano-ambassador-tool";

export function getCatConstants() {
    const network =
        (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "preprod") || "preprod";

    const SETUP_UTXO = {
        oracle: {
            txHash: process.env.NEXT_PUBLIC_ORACLE_SETUP_TX_HASH!,
            outputIndex: parseInt(process.env.NEXT_PUBLIC_ORACLE_SETUP_OUTPUT_INDEX!),
        },
        counter: {
            txHash: process.env.NEXT_PUBLIC_COUNTER_SETUP_TX_HASH!,
            outputIndex: parseInt(
                process.env.NEXT_PUBLIC_COUNTER_SETUP_OUTPUT_INDEX!
            ),
        },
    };

    // Reference Transaction Scripts
    const REF_TX_IN_SCRIPTS = {
        membershipIntent: {
            mint: {
                txHash: process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_OUTPUT_INDEX || "0"
                ),
            },
            spend: {
                txHash: process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_OUTPUT_INDEX || "1"
                ),
            },
        },
        member: {
            mint: {
                txHash: process.env.NEXT_PUBLIC_MEMBER_MINT_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_MEMBER_MINT_OUTPUT_INDEX || "0"
                ),
            },
            spend: {
                txHash: process.env.NEXT_PUBLIC_MEMBER_SPEND_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_MEMBER_SPEND_OUTPUT_INDEX || "1"
                ),
            },
        },
        proposeIntent: {
            mint: {
                txHash: process.env.NEXT_PUBLIC_PROPOSE_INTENT_MINT_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_PROPOSE_INTENT_MINT_OUTPUT_INDEX || "0"
                ),
            },
            spend: {
                txHash: process.env.NEXT_PUBLIC_PROPOSE_INTENT_SPEND_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_PROPOSE_INTENT_SPEND_OUTPUT_INDEX || "1"
                ),
            },
        },
        proposal: {
            mint: {
                txHash: process.env.NEXT_PUBLIC_PROPOSAL_MINT_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_PROPOSAL_MINT_OUTPUT_INDEX || "0"
                ),
            },
            spend: {
                txHash: process.env.NEXT_PUBLIC_PROPOSAL_SPEND_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_PROPOSAL_SPEND_OUTPUT_INDEX || "1"
                ),
            },
        },
        signOffApproval: {
            mint: {
                txHash: process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_OUTPUT_INDEX || "0"
                ),
            },
            spend: {
                txHash: process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_OUTPUT_INDEX || "1"
                ),
            },
        },
        treasury: {
            spend: {
                txHash: process.env.NEXT_PUBLIC_TREASURY_SPEND_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_TREASURY_SPEND_OUTPUT_INDEX || "0"
                ),
            },
            withdrawal: {
                txHash: process.env.NEXT_PUBLIC_TREASURY_WITHDRAWAL_TX_HASH!,
                outputIndex: parseInt(
                    process.env.NEXT_PUBLIC_TREASURY_WITHDRAWAL_OUTPUT_INDEX || "1"
                ),
            },
        },
    };

    return new CATConstants(network, SETUP_UTXO, REF_TX_IN_SCRIPTS);
};