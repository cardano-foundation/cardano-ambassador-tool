'use client';

import { useApp } from '@/context';
import { RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface GlobalRefreshButtonProps {
  size?: number;
  className?: string;
}

/**
 * Global refresh button that:
 * 1. Invalidates all caches (UTxOs, oracle admins)
 * 2. Syncs data from blockchain via worker
 * 3. Shows loading state during refresh
 */
export default function GlobalRefreshButton({
  size = 20,
  className = '',
}: GlobalRefreshButtonProps) {
  const { syncData, isSyncing } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // 1. Invalidate all caches for fresh data from blockchain
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allUtxos: true, // Refresh all UTxO caches
          allOracle: true,
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
  }, [syncData]);

  // Listen for global refresh events
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
  const tooltipText = isLoading ? 'Refreshing...' : 'Refresh data from blockchain';

  return (
    <div className="group relative inline-block  ">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-200 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={tooltipText}
      >
        <RefreshCw 
          size={size} 
          className={`text-muted-foreground transition-transform duration-200 ${isLoading ? 'animate-spin' : 'group-hover:text-primary'} mx-auto`} 
        />
      </button>
      
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className=" outline-border rounded border px-2 py-1 text-xs whitespace-nowrap shadow-md">
          {tooltipText}
        </div>
      </div>
    </div>
  );
}
