'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '@/hooks/useUserAuth';
import { toast } from '@/components/toast/toast-manager';

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
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading, user } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    if (requireAuth && !isAuthenticated) {
      toast.error('Authentication Required', 'Please connect your wallet to access this page');
      router.push(redirectTo);
      return;
    }

    if (requireAdmin && !isAdmin) {
      toast.error('Admin Access Required', 'You need admin privileges to access this page');
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAuth, requireAdmin, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-base border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
