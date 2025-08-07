import { BlockfrostProvider, UTxO } from "@meshsdk/core";
import { NextApiRequest, NextApiResponse } from "next";

const blockfrost = new BlockfrostProvider(
    process.env.BLOCKFROST_API_KEY_PREPROD || ""
);


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { address } = req.body;

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Address missing!" });
    }

    try {
        const utxos = await blockfrost.fetchAddressUTxOs(address);
        return utxos;
    } catch (error) {
        console.error("Blockfrost API Error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}


async function fetchUTxO(txHash: string, outputIndex: number): Promise<UTxO[]> {
    const utxos = await blockfrost.fetchUTxOs(txHash, outputIndex);
    return utxos;

}


