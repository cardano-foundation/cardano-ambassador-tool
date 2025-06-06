import { BlockfrostProvider, UTxO } from "@meshsdk/core";

export const blockfrost = new BlockfrostProvider(
  process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || ""
);

export class BlockfrostService {
  blockFrost: BlockfrostProvider;

  fetchUtxo = async (txHash: string, outputIndex: number): Promise<UTxO> => {
    try {
      const utxo = await this.blockFrost.fetchUTxOs(txHash, outputIndex);
      return utxo[0];
    } catch (error) {
      console.error("Error fetching utxo:", error);
      throw error;
    }
  };

  constructor() {
    this.blockFrost = blockfrost;
  }
}
