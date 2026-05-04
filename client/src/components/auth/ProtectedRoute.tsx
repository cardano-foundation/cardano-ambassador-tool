"use client";

import SimpleCardanoLoader from "../SimpleCardanoLoader";
import { toast } from "../toast/toast-manager";
import { routes } from "../../config/routes";
import { useAppSelector } from "../../lib/redux/hooks";
import {
  selectIsConnected,
  selectIsWalletReady,
} from "../../lib/redux/features/wallet";
import {
  selectIsAdmin,
  selectIsAuthLoading,
  selectIsAuthenticated,
  selectIsHydrated,
} from "../../lib/redux/features/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
  redirectTo = "/",
}: ProtectedRouteProps) {
  // Wallet state from Redux
  const isConnected = useAppSelector(selectIsConnected);
  const isWalletReady = useAppSelector(selectIsWalletReady);

  // Auth state from Redux
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isAuthLoading = useAppSelector(selectIsAuthLoading);
  const isHydrated = useAppSelector(selectIsHydrated);

  const router = useRouter();

  const isUserReady = isHydrated && !isAuthLoading;
  const isFullyReady = isWalletReady && isUserReady;

  useEffect(() => {
    if (!isFullyReady) {
      return;
    }

    // Check auth requirements
    if (requireAuth && !isConnected) {
      toast.error(
        "Authentication Required",
        "Please connect your wallet to access this page",
      );
      router.push(redirectTo);
      return;
    }

    // Check admin requirements - only check if user is authenticated
    if (requireAdmin && isAuthenticated && isAdmin === false) {
      toast.error(
        "Admin Access Required",
        "You need admin privileges to access this page",
      );
      router.push(routes.unauthorized);
      return;
    }
  }, [
    isFullyReady,
    isConnected,
    isAuthenticated,
    isAdmin,
    requireAuth,
    requireAdmin,
    router,
    redirectTo,
  ]);

  // Show loading while initializing
  if (!isFullyReady) {
    return (
      <SimpleCardanoLoader
        message={
          !isWalletReady ? "Initializing wallet..." : "Verifying access..."
        }
      />
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isConnected) {
    return null;
  }

  if (requireAdmin && isAuthenticated && isAdmin === false) {
    return null;
  }

  return <>{children}</>;
}
