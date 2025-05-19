import { blockfrost } from "@/lib";
import { BlockfrostProvider, UTxO } from "@meshsdk/core";

export class BlockfrostService {
  blockFrost: BlockfrostProvider;

  getUtxo = async (txHash: string, outputIndex: number): Promise<UTxO> => {
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
