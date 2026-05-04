"use client";

import SimpleCardanoLoader from "../SimpleCardanoLoader";
import { useAppSelector } from "../../lib/redux/hooks";
import {
  selectIsConnected,
  selectIsWalletReady,
  selectWallet,
  selectWalletAddress,
} from "../../lib/redux/features/wallet";
import { toast } from "../toast/toast-manager";
import { routes } from "../../config/routes";
import { useUserAuth } from "../../hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Auth guard component that protects routes based on wallet connection and admin status.
 * Uses Redux for wallet state and auth state.
 */
export function AuthGuard({
  children,
  requireAdmin = false,
  requireAuth = true,
  redirectTo = "/",
}: AuthGuardProps) {
  const router = useRouter();

  // Wallet state from Redux
  const isConnected = useAppSelector(selectIsConnected);
  const isWalletReady = useAppSelector(selectIsWalletReady);
  const wallet = useAppSelector(selectWallet);
  const address = useAppSelector(selectWalletAddress);

  // User state from hooks
  const { isAdmin, isLoading, user } = useUserAuth({
    wallet,
    address,
    isConnected,
  });

  const isUserReady = !isLoading;
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

    // Check admin requirements - only check if we have a user (not during loading)
    if (requireAdmin && user && isAdmin === false) {
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
    user,
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

  if (requireAdmin && user && isAdmin === false) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
