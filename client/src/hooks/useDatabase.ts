'use client';

import { DatabaseManager } from '@/lib/DbManager';
import {
  initUtxoWorker,
  onUtxoWorkerMessage,
  sendUtxoWorkerMessage,
} from '@/lib/utxoWorkerClient';
import { Ambassador, Utxo } from '@types';
import { useEffect, useState } from 'react';

// ---------- Database operations ----------
const dbManager = DatabaseManager.getInstance();

const queryDb = <T = Record<string, unknown>>(
  sql: string,
  params: any[] = [],
): T[] => {
  return dbManager.query<T>(sql, params);
};

const getUtxosByContext = (contextName: string): Utxo[] => {
  return dbManager.getUtxosByContext(contextName);
};

export function useDatabase() {
  // Database state
  const [dbLoading, setDbLoading] = useState(true);
  const [membershipIntents, setMembershipIntents] = useState<Utxo[]>([]);
  const [proposalIntents, setProposalIntents] = useState<Utxo[]>([]);
  const [members, setMembers] = useState<Utxo[]>([]);
  const [proposals, setProposals] = useState<Utxo[]>([]);

  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  // Database initialization and worker setup
  useEffect(() => {
    console.log('[DB] Starting database initialization...');

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn(
        '[DB] Database loading timeout - proceeding without full data',
      );
      setDbLoading(false);
      setDbError('Database loading timed out');
    }, 10000); // 10 second timeout

    try {
      // Initialize worker
      initUtxoWorker();

      // Listen for DB updates from worker
      const unsubscribe = onUtxoWorkerMessage(async (data) => {
        if (data.db) {
          try {
            clearTimeout(timeoutId); // Cancel timeout

            // Use the DatabaseManager to initialize
            await dbManager.initializeDatabase(data.db);

            // Query the initialized database
            const membershipIntents =
              dbManager.getUtxosByContext('membership_intent');
            const proposalIntents =
              dbManager.getUtxosByContext('proposal_intent');
            const members =
              dbManager.getUtxosByContext('membership_intent');
            const proposals =
              dbManager.getUtxosByContext('proposal_intent');
            const ambassadors = dbManager.getAmbasaddors();

            setMembershipIntents(membershipIntents);
            setProposalIntents(proposalIntents);
            setMembers(members);
            setProposals(proposals);
            setAmbassadors(ambassadors);
            setDbLoading(false);
            setDbError(null);
          } catch (err) {
            clearTimeout(timeoutId);
            setDbLoading(false);
            setDbError(
              err instanceof Error
                ? err.message
                : 'Database initialization failed',
            );
          }
        }
      });

      // Request worker to seed all data
      syncAllData();

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[DB] Error setting up database worker:', error);
      setDbLoading(false);
    }
  }, []);

  // Database operations
  function syncAllData() {
    sendUtxoWorkerMessage({
      action: 'seedAll',
      apiBaseUrl: window.location.origin,
      contexts: [
        'member',
        'membership_intent',
        'proposal',
        'proposal_intent',
        'sign_of_approval',
        'ambassadors',
      ],
    });
  }

  function syncData(context: string) {
    sendUtxoWorkerMessage({
      action: 'seed',
      apiBaseUrl: window.location.origin,
      context,
    });
  }

  return {
    // State
    dbLoading: dbLoading,
    membershipIntents,
    proposalIntents,
    members,
    proposals,

    ambassadors,

    // Operations
    syncData,
    syncAllData,
    query: queryDb,
    getUtxosByContext,
  };
}
