'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import {
  selectIsConnected,
  selectIsWalletReady,
} from '@/lib/redux/features/wallet';
import { toast } from '@/components/toast/toast-manager';
import { routes } from '@/config/routes';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Auth guard component that protects routes based on wallet connection and admin status.
 * Uses Redux for wallet state and AppContext for user/admin state (until Phase 7).
 */
export function AuthGuard({
  children,
  requireAdmin = false,
  requireAuth = true,
  redirectTo = '/',
}: AuthGuardProps) {
  const router = useRouter();

  // Wallet state from Redux
  const isConnected = useAppSelector(selectIsConnected);
  const isWalletReady = useAppSelector(selectIsWalletReady);

  // User state from Context (will move to Redux in Phase 7)
  const { isAdmin, isLoading, user } = useApp();

  const isUserReady = !isLoading;
  const isFullyReady = isWalletReady && isUserReady;

  useEffect(() => {
    if (!isFullyReady) {
      return;
    }

    // Check auth requirements
    if (requireAuth && !isConnected) {
      toast.error(
        'Authentication Required',
        'Please connect your wallet to access this page',
      );
      router.push(redirectTo);
      return;
    }

    // Check admin requirements - only check if we have a user (not during loading)
    if (requireAdmin && user && isAdmin === false) {
      toast.error(
        'Admin Access Required',
        'You need admin privileges to access this page',
      );
      router.push(routes.unauthorized);
      return;
    }
  }, [isFullyReady, isConnected, user, isAdmin, requireAuth, requireAdmin, router, redirectTo]);

  // Show loading while initializing
  if (!isFullyReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="border-primary-base h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
          <span className="text-muted-foreground text-sm">
            {!isWalletReady ? 'Initializing wallet...' : 'Loading user roles...'}
          </span>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isConnected) {
    return null;
  }

  if (requireAdmin && user && isAdmin === false) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
