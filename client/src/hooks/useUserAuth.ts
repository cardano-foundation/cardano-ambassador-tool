'use client';

import { resolveRoles } from '@/lib/auth/roles';
import { createClientSession, getClientSession, destroyClientSession } from '@/lib/auth/session';
import { IWallet } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { useEffect, useState } from 'react';

export type User = {
  wallet: IWallet;
  roles: string[];
  address: string;
} | null;

export function useUserAuth() {
  // User state
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setPersist, address, wallet, disconnect } = useWallet();

  // Load existing session on mount
  useEffect(() => {
    const existingSession = getClientSession();
    if (existingSession && wallet) {
      setUserState({
        wallet,
        roles: existingSession.roles.map((r: { role: string }) => r.role),
        address: existingSession.address
      });
    }
  }, [wallet]);

  // Persist wallet connection
  useEffect(() => {
    setPersist(true);
  }, [setPersist]);

  // Handle wallet connection and session creation
  useEffect(() => {
    async function handleWalletConnection() {
      if (address && address.length && wallet) {
        setIsLoading(true);
        try {
          const roles = await resolveRoles(address);
          
          // Store session in frontend
          createClientSession(address, roles);
          
          // Set user state
          const userRoles = roles.map(r => r.role);
          setUserState({ wallet, roles: userRoles, address });

        } catch (error) {
          console.error('Failed to resolve user roles:', error);
          setUserState(null);
          destroyClientSession();
        } finally {
          setIsLoading(false);
        }
      } else if (!address && user) {
        // Wallet disconnected, clear user state and session
        setUserState(null);
        destroyClientSession();
      }
    }

    handleWalletConnection();
  }, [address, wallet]);

  const logout = async () => {
    try {
      destroyClientSession();
      disconnect();
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
