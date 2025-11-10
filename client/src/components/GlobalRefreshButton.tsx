'use client';

import { useApp } from '@/context';
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Button from './atoms/Button';

interface GlobalRefreshButtonProps {
  className?: string;
}

export default function GlobalRefreshButton({
  className = '',
}: GlobalRefreshButtonProps) {
  const { syncData, isSyncing, refreshTreasuryBalance } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allUtxos: true,
          allOracle: true,
        }),
      });

      await Promise.all([
        syncData('membership_intent'),
        syncData('proposal_intent'),
        syncData('member'),
        syncData('proposal'),
        refreshTreasuryBalance(),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [syncData, refreshTreasuryBalance]);

  useEffect(() => {
    const handleGlobalRefresh = () => {
      handleRefresh();
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);

    return () => {
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
    };
  }, [handleRefresh]);

  const isLoading = isRefreshing || isSyncing;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isLoading}
      className={`gap-2 ${className}`}
      aria-label={isLoading ? 'Syncing...' : 'Sync'}
    >
      <RefreshCw
        size={16}
        className={`text-primary-base transition-transform duration-200 ${isLoading ? 'animate-spin' : ''}`}
      />
      <span className="text-primary-base">
        {isLoading ? 'Syncing...' : 'Sync'}
      </span>
    </Button>
  );
}
