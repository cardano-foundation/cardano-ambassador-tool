'use client';

import { useApp } from '@/context';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import Button from './atoms/Button';

interface GlobalRefreshButtonProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'outline' | 'primary' | 'secondary';
  className?: string;
}

/**
 * Global refresh button that:
 * 1. Invalidates all caches (UTxOs, oracle admins)
 * 2. Syncs data from blockchain via worker
 * 3. Shows loading state during refresh
 */
export default function GlobalRefreshButton({
  size = 'sm',
  showLabel = false,
  variant = 'outline',
  className = '',
}: GlobalRefreshButtonProps) {
  const { syncData, isSyncing } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // 1. Invalidate all caches for fresh data from blockchain
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allUtxos: true, // Refresh all UTxO caches
          oracleAdmins: true, // Refresh oracle admin cache
        }),
      });

      // 2. Sync data from worker for all contexts
      await Promise.all([
        syncData('membership_intent'),
        syncData('proposal_intent'),
        syncData('member'),
        syncData('proposal'),
      ]);

      // Small delay to ensure state updates
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoading = isRefreshing || isSyncing;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isLoading}
      className={`flex items-center gap-2 ${className}`}
      title="Refresh data from blockchain"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {showLabel && (
        <span className="text-sm">
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </span>
      )}
    </Button>
  );
}
