import { BlockfrostProvider, UTxO } from '@meshsdk/core';

const isServer = typeof window === 'undefined';

export class BlockfrostService {

  private blockfrost?: BlockfrostProvider;

  constructor() {
    if (isServer && process.env.BLOCKFROST_API_KEY_PREPROD) {
      this.blockfrost = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY_PREPROD);
    }
  }

  fetchUtxo = async (txHash: string, outputIndex?: number): Promise<UTxO> => {
    if (isServer && this.blockfrost) {
      const utxos = await this.blockfrost.fetchUTxOs(txHash, outputIndex);
      return utxos[0];
    }

    const url = new URL('/api/utxo', window.location.origin);
    url.searchParams.append('txHash', txHash);
    url.searchParams.append('outputIndex', outputIndex!.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: { txHash, outputIndex } }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch UTxO');
    }

    const data = await response.json();
    return data.utxos;
  };

  fetchAddressUTxOs = async (address: string): Promise<UTxO[]> => {
    if (isServer && this.blockfrost) {
      const utxos = await this.blockfrost.fetchAddressUTxOs(address);
      return Array.isArray(utxos) ? utxos : [];
    }

    const response = await fetch(`${window.location.origin}/api/utxos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context: 'specific_address_utxos', address }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch address UTxOs');
    }

    return await response.json();
  };
}
