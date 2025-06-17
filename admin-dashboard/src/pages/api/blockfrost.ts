import { NextApiRequest, NextApiResponse } from "next";
import { BlockfrostProvider } from "@meshsdk/core";

const blockfrost = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY || "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, params } = req.body;

    switch (action) {
      case "fetchAddressUTxOs": {
        const { address } = params;
        const utxos = await blockfrost.fetchAddressUTxOs(address);
        return res.status(200).json({ utxos });
      }

      case "fetchUTxOs": {
        const { txHash, outputIndex } = params;
        const utxos = await blockfrost.fetchUTxOs(txHash, outputIndex);
        return res.status(200).json({ utxos: utxos[0] });
      }

      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Blockfrost API Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
