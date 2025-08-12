'use client';

import { resolveRoles } from '@/lib/auth/roles';
import { IWallet } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { createContext, useContext, useEffect, useState } from 'react';

type User = {
  wallet: IWallet;
  roles?: string[];
  address: string;
} | null;

const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { setPersist, address, wallet } = useWallet();

  const updateUser = (data: User | null) => {
    if (data) {
      localStorage.setItem('user', JSON.stringify(data));
    } else {
      localStorage.removeItem('user');
    }
    setUser(data);
  };

  // Load stored user first
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // Persist wallet connection
  useEffect(() => {
    setPersist(true);
  }, [setPersist]);

  // Fetch roles when address changes
  useEffect(() => {
    async function fetchRoles() {
      if (address && address.length) {
        const roles = await resolveRoles(address);

        console.log({ roles });

        updateUser({ wallet, roles, address });
      }
    }
    fetchRoles();
  }, [address, wallet]);

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
