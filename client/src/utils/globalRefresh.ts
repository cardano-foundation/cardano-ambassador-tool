import React from 'react';

/**
 * Global refresh utilities
 * 
 * These functions allow any component to trigger a global refresh
 * that will be picked up by the GlobalRefreshButton component.
 */

/**
 * Emits a global refresh event that triggers data refresh across the app
 * 
 * Usage:
 * ```typescript
 * import { emitGlobalRefresh } from '@/utils/globalRefresh';
 * 
 * // Trigger refresh after successful transaction
 * await submitTransaction();
 * emitGlobalRefresh();
 * ```
 */
export function emitGlobalRefresh(): void {
  const event = new CustomEvent('globalRefresh', {
    bubbles: true,
    detail: {
      timestamp: Date.now(),
      source: 'manual'
    }
  });
  
  window.dispatchEvent(event);
}

/**
 * Emits a global refresh event with a delay
 * Useful when you want to refresh after UI updates have completed
 * 
 * @param delay - Delay in milliseconds (default: 1000ms)
 */
export function emitGlobalRefreshWithDelay(delay: number = 1000): void {
  setTimeout(() => {
    emitGlobalRefresh();
  }, delay);
}

/**
 * Hook to listen for global refresh events in custom components
 * 
 * Usage:
 * ```typescript
 * import { useGlobalRefreshListener } from '@/utils/globalRefresh';
 * 
 * function MyComponent() {
 *   useGlobalRefreshListener(() => {
 *     // Custom refresh logic
 *     refetchData();
 *   });
 * 
 *   return <div>...</div>;
 * }
 * ```
 */
export function useGlobalRefreshListener(callback: () => void): void {
  React.useEffect(() => {
    const handleGlobalRefresh = () => {
      callback();
    };

    window.addEventListener('globalRefresh', handleGlobalRefresh);
    
    return () => {
      window.removeEventListener('globalRefresh', handleGlobalRefresh);
    };
  }, [callback]);
}

