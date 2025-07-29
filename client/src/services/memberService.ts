import { getCatConstants } from "@/utils";
import { getProvider } from "@/utils";
import { IWallet, stringToHex } from "@meshsdk/core";
import { MembershipMetadata, membershipMetadata, UserActionTx } from "@sidan-lab/cardano-ambassador-tool";
import { MemberMetadata, MembershipIntentPayoad } from "@types";

// Environment variables
const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
const ORACLE_OUTPUT_INDEX = parseInt(
    process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || "0"
);

const blockfrost = getProvider();

export const applyMembership = async (payload: MembershipIntentPayoad) => {
        const { tokenUtxoHash, tokenUtxoIndex, address, wallet, tokenPolicyId, tokenAssetName, userMetadata } = payload;

        const [oracleUtxos, tokenUtxos] = await Promise.all([
            blockfrost.fetchUTxOs(ORACLE_TX_HASH, ORACLE_OUTPUT_INDEX),
            blockfrost.fetchUTxOs(tokenUtxoHash, tokenUtxoIndex),
        ]);

        const oracleUtxo = oracleUtxos[0];
        const tokenUtxo = tokenUtxos[0];
        if (!oracleUtxo || !tokenUtxo) {
            throw new Error("Failed to fetch required UTxOs");
        }
        const userAction = new UserActionTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
        );

        const metadata: MembershipMetadata = membershipMetadata(
            address,
            stringToHex(userMetadata.fullname),
            stringToHex(userMetadata.displayName),
            stringToHex(userMetadata.email),
            stringToHex(userMetadata.bio)
        );

        const result = await userAction.applyMembership(
            oracleUtxo,
            tokenUtxo,
            tokenPolicyId,
            tokenAssetName,
            metadata
        );

        return result;
}

export const updateMembershipIntentMetadata = async (metadata: MemberMetadata, wallet: IWallet, address: string) => {
        // Find membership intent UTxO by wallet address
        const userAddress = await wallet.getChangeAddress();
        const membershipIntentUtxo = await import("@/utils/utils").then(
            (utils) => utils.findMembershipIntentUtxo(userAddress)
        );
        if (!membershipIntentUtxo) {
            throw new Error("No membership intent UTxO found for this address");
        }
        // Find token UTxO by membership intent UTxO
        const tokenUtxo = await import("@/utils/utils").then((utils) =>
            utils.findTokenUtxoByMembershipIntentUtxo(membershipIntentUtxo)
        );
        if (!tokenUtxo) {
            throw new Error("No token UTxO found for this membership intent");
        }
        // Find oracle UTxO
        const oracleUtxos = await blockfrost.fetchUTxOs(
            ORACLE_TX_HASH,
            ORACLE_OUTPUT_INDEX
        );
        const oracleUtxo = oracleUtxos[0];
        if (!oracleUtxo) {
            throw new Error("Failed to fetch required oracle UTxO");
        }
        const userAction = new UserActionTx(
            userAddress,
            wallet,
            blockfrost,
            getCatConstants()
        );
        const userMetadata = membershipMetadata(
            address,
            stringToHex(metadata.fullname),
            stringToHex(metadata.displayName),
            stringToHex(metadata.email),
            stringToHex(metadata.bio)
        );
        const result = await userAction.updateMembershipIntentMetadata(
            oracleUtxo,
            tokenUtxo,
            membershipIntentUtxo,
            userMetadata
        );
        return result;
}

export const updateMemberMetadata = async (metadata: MemberMetadata, wallet: IWallet, address:string) => {
        // Find member UTxO by wallet address
        const userAddress = await wallet.getChangeAddress();
        const memberUtxo = await import("@/utils/utils").then((utils) =>
            utils.findMemberUtxo(userAddress)
        );
        if (!memberUtxo) {
            throw new Error("No member UTxO found for this address");
        }
        // Find token UTxO by member UTxO
        const tokenUtxo = await import("@/utils/utils").then((utils) =>
            utils.findTokenUtxoByMemberUtxo(memberUtxo)
        );
        if (!tokenUtxo) {
            throw new Error("No token UTxO found for this member");
        }
        // Find oracle UTxO
        const oracleUtxos = await blockfrost.fetchUTxOs(
            ORACLE_TX_HASH,
            ORACLE_OUTPUT_INDEX
        );
        const oracleUtxo = oracleUtxos[0];
        if (!oracleUtxo) {
            throw new Error("Failed to fetch required oracle UTxO");
        }
        const userAction = new UserActionTx(
            userAddress,
            wallet,
            blockfrost,
            getCatConstants()
        );
        const userMetadata = membershipMetadata(
            address,
            stringToHex(metadata.fullname),
            stringToHex(metadata.displayName),
            stringToHex(metadata.email),
            stringToHex(metadata.bio)
        );
        const result = await userAction.updateMemberMetadata(
            oracleUtxo,
            memberUtxo,
            tokenUtxo,
            userMetadata
        );
        return result;
}
