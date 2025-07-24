import { getCatConstants, getProvider } from "@/utils/utils";
import { stringToHex } from "@meshsdk/core";
import { MembershipMetadata, membershipMetadata, UserActionTx } from "@sidan-lab/cardano-ambassador-tool";

// Environment variables
const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
const ORACLE_OUTPUT_INDEX = parseInt(
    process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || "0"
);

const blockfrost = getProvider();


export class MemberService {
    applyMembership = async (params: { tokenUtxoHash: any, tokenUtxoIndex: any, userData: any }) => {
        const { tokenUtxoHash, tokenUtxoIndex, ...userData } = params;
        const [oracleUtxos, tokenUtxos] = await Promise.all([
            blockfrost.fetchUTxOs(ORACLE_TX_HASH, ORACLE_OUTPUT_INDEX),
            blockfrost.fetchUTxOs(tokenUtxoHash, parseInt(tokenUtxoIndex)),
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
            userData.walletAddress,
            stringToHex(userData.fullName),
            stringToHex(userData.displayName),
            stringToHex(userData.emailAddress),
            stringToHex(userData.bio)
        );

        const result = await userAction.applyMembership(
            oracleUtxo,
            tokenUtxo,
            userData.tokenPolicyId,
            userData.tokenAssetName,
            metadata
        );
        setResult(JSON.stringify(result, null, 2));
    }
}


function setResult(arg0: string) {
    throw new Error("Function not implemented.");
}

