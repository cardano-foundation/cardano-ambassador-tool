import { getCatConstants, getProvider } from '@/utils';
import { useCallback, useEffect, useState } from 'react';

export function useTreasuryBalance() {
  const [treasuryBalance, setTreasuryBalance] = useState<bigint>(BigInt(0));
  const [isTreasuryLoading, setIsTreasuryLoading] = useState(true);

  const fetchTreasuryBalance = useCallback(async () => {
    try {
      setIsTreasuryLoading(true);
      const provider = getProvider();
      const catConstants = getCatConstants();
      const treasuryAddress = catConstants.scripts.treasury.spend.address;

      const utxos = await provider.fetchAddressUTxOs(treasuryAddress);
      const totalBalance = utxos.reduce((sum, utxo) => {
        const lovelace = utxo.output.amount.find((asset) => asset.unit === 'lovelace');
        return sum + BigInt(lovelace ? lovelace.quantity : '0');
      }, BigInt(0));

      setTreasuryBalance(totalBalance);
    } catch (error) {
      console.error('Failed to fetch treasury balance:', error);
      setTreasuryBalance(BigInt(0));
    } finally {
      setIsTreasuryLoading(false);
    }
  }, []);

  const refreshTreasuryBalance = useCallback(async () => {
    await fetchTreasuryBalance();
  }, [fetchTreasuryBalance]);

  // Fetch on mount
  useEffect(() => {
    fetchTreasuryBalance();
  }, [fetchTreasuryBalance]);

  // Listen for global refresh events (from successful signoff execution)
  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      if (event.detail?.refreshTreasury) {
        fetchTreasuryBalance();
      }
    };

    window.addEventListener('app:refresh' as any, handleRefresh);

    return () => {
      window.removeEventListener('app:refresh' as any, handleRefresh);
    };
  }, [fetchTreasuryBalance]);

  return {
    treasuryBalance,
    isTreasuryLoading,
    refreshTreasuryBalance,
  };
}
