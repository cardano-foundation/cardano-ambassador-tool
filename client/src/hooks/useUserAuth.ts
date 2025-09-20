'use client';

import { resolveRoles } from '@/lib/auth/roles';
import {
  createClientSession,
  destroyClientSession,
  getClientSession,
} from '@/lib/auth/session';
import { IWallet } from '@meshsdk/core';
import { useEffect, useState } from 'react';

export type User = {
  wallet: IWallet;
  roles: string[];
  address: string;
} | null;

interface UseUserAuthProps {
  wallet: IWallet | null;
  address: string | null;
  isConnected: boolean;
}

export function useUserAuth({
  wallet,
  address,
  isConnected,
}: UseUserAuthProps) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle wallet connection and session management
  useEffect(() => {
    async function handleWalletConnection() {
      if (!isConnected || !wallet || !address) {
        setUserState(null);
        destroyClientSession();
        return;
      }

      // Check for existing session
      const existingSession = getClientSession();
      if (existingSession && existingSession.address === address) {
        setUserState({
          wallet,
          roles: existingSession.roles.map((r: { role: string }) => r.role),
          address: existingSession.address,
        });
        return;
      }

      // Resolve roles for new connection
      setIsLoading(true);
      try {
        const roles = await resolveRoles(address);
        createClientSession(address, roles);
        setUserState({
          wallet,
          roles: roles.map((r) => r.role),
          address,
        });
      } catch (error) {
        setUserState(null);
        destroyClientSession();
      } finally {
        setIsLoading(false);
      }
    }

    handleWalletConnection();
  }, [address, wallet, isConnected]);

  const logout = async () => {
    try {
      localStorage.removeItem('user_session');
      setUserState(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return {
    user,
    isLoading,
    logout,
    // Helper computed values
    isAuthenticated: !!user && !!user.address,
    userAddress: user?.address,
    userRoles: user?.roles || [],
    userWallet: user?.wallet,
    isAdmin: user?.roles.includes('admin') || false,
  };
}
