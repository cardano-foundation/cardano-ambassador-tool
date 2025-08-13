'use client';

import { useUtxoSync } from '@/hooks/useUtxoSync';
import { initDb, queryDb } from '@/services/dbService';
import { createContext, useContext, useEffect, useState } from 'react';

export interface MembershipIntent {
  id: number;
  created_at: string;
  [key: string]: any;
}

interface DbContextValue {
  loading: boolean;
  intents: MembershipIntent[];
}

const DbContext = createContext<DbContextValue>({
  loading: true,
  intents: [],
});

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [intents, setIntents] = useState<MembershipIntent[]>([]);
  const { syncAllData, syncData } = useUtxoSync();

  useEffect(() => {
    async function loadDbAndQuery() {
      try {
        syncAllData();

        const storedDb = localStorage.getItem('utxoDb');

        if (storedDb) {
          // Load from localStorage
          const uint8Array = new Uint8Array(JSON.parse(storedDb));
          await initDb(uint8Array);

          const rows = queryDb<MembershipIntent>(
            'SELECT * FROM membership_intent ORDER BY created_at DESC',
          );

          setIntents(rows);
        } else {
          console.warn('No DB found in localStorage.');
        }
      } catch (err) {
        console.error('Error loading DB:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDbAndQuery();
  }, []);

  return (
    <DbContext.Provider value={{ loading, intents }}>
      {children}
    </DbContext.Provider>
  );
}

export function useDb() {
  return useContext(DbContext);
}
