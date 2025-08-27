'use client';

import { resolveRoles } from '@/lib/auth/roles';
import { IWallet } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { useEffect, useState } from 'react';

export type User = {
  wallet: IWallet;
  roles?: string[];
  address: string;
} | null;

export function useUserAuth() {
  // User state
  const [user, setUserState] = useState<User | null>(null);
  const { setPersist, address, wallet } = useWallet();

  // User management functions
  const setUser = (data: User | null) => {
    if (data) {
      localStorage.setItem('user', JSON.stringify(data));
    } else {
      localStorage.removeItem('user');
    }
    setUserState(data);
  };

  // Load stored user on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user'); 
      }
    }
  }, []);

  // Persist wallet connection
  useEffect(() => {
    setPersist(true);
  }, [setPersist]);

  // Fetch roles when address changes
  useEffect(() => {
    async function fetchRoles() {
      if (address && address.length && wallet) {
        try {
          const roles = await resolveRoles(address);
          console.log({ roles });
          setUser({ wallet, roles, address });
        } catch (error) {
          console.error('Failed to resolve user roles:', error);
          // Still set user without roles
          setUser({ wallet, roles: [], address });
        }
      }
    }
    fetchRoles();
  }, [address, wallet]);

  return {
    user,
    setUser,
    // Helper computed values
    isAuthenticated: !!user,
    userAddress: user?.address,
    userRoles: user?.roles || [],
    userWallet: user?.wallet,
  };
}
