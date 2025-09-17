'use client';

import { toast } from '@/components/toast/toast-manager';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireAuth = true,
  redirectTo = '/',
}: ProtectedRouteProps) {
  const { isAdmin, wallet, isLoading, user, isAuthenticated } = useApp();
  const router = useRouter();

  const isWalletReady = wallet.hasAttemptedAutoConnect && !wallet.isConnecting;
  const isUserReady = !isLoading;
  const isFullyReady = isWalletReady && isUserReady;

  useEffect(() => {
    if (!isFullyReady) {
      return;
    }

    // Check auth requirements
    if (requireAuth && !wallet.isConnected) {
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
      router.push('/unauthorized');
      return;
    }
  }, [
    isFullyReady,
    wallet.isConnected,
    user,
    isAdmin,
    requireAuth,
    requireAdmin,
  ]);

  // Show loading while initializing
  if (!isFullyReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="border-primary-base h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
          <span className="text-muted-foreground text-sm">
            {!isWalletReady
              ? 'Initializing wallet...'
              : 'Loading user roles...'}
          </span>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !wallet.isConnected) {
    return null;
  }

  if (requireAdmin && user && isAdmin === false) {
    return null;
  }

  return <>{children}</>;
}
