import { UTxO } from '@meshsdk/core';

export class BlockfrostService {
  fetchUtxo = async (txHash: string, outputIndex: number): Promise<UTxO> => {
    try {
      const url = new URL('/api/utxo', window.location.origin);
      url.searchParams.append('txHash', txHash);
      url.searchParams.append('outputIndex', outputIndex.toString());

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          params: {
            txHash,
            outputIndex,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch UTxO');
      }

      const data = await response.json();
      return data.utxos;
    } catch (error) {
      console.error('Error fetching utxo:', error);
      throw error;
    }
  };

  fetchAddressUTxOs = async (address: string): Promise<UTxO[]> => {
    try {

      const response = await fetch(`${window.location.origin}/api/utxos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: 'specific_address_utxos', address }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch address UTxOs');
      }

      const data = await response.json();
      return data.utxos;
    } catch (error) {
      console.error('Error fetching address UTxOs:', error);
      throw error;
    }
  };
}
