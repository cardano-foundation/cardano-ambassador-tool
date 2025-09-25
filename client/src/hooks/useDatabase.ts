'use client';

import { DatabaseManager } from '@/lib/DbManager';
import {
  initUtxoWorker,
  onUtxoWorkerMessage,
  sendUtxoWorkerMessage,
} from '@/lib/utxoWorkerClient';
import { getProvider } from '@/utils';
import { deserializeDatum, PubKeyAddress, ScriptAddress, serializeAddressObj, UTxO } from '@meshsdk/core';
import {
  MembershipIntentDatum,
  MembershipMetadata,
} from '@sidan-lab/cardano-ambassador-tool';
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

const blockfrostService = getProvider();

const getUtxosByContext = (contextName: string): Utxo[] => {
  return dbManager.getUtxosByContext(contextName);
};

export function useDatabase() {
  // Database state
  const [dbLoading, setDbLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [membershipIntents, setMembershipIntents] = useState<Utxo[]>([]);
  const [proposalIntents, setProposalIntents] = useState<Utxo[]>([]);
  const [members, setMembers] = useState<Utxo[]>([]);
  const [proposals, setProposals] = useState<Utxo[]>([]);

  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);

  // Database initialization and worker setup
  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setDbLoading(false);
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
            const memberships_intents =
              dbManager.getUtxosByContext('membership_intent');
            const proposals_intents =
              dbManager.getUtxosByContext('proposal_intent');
            const members = dbManager.getUtxosByContext('membership_intent');
            const proposals = dbManager.getUtxosByContext('proposal_intent');
            const ambassadors = dbManager.getAmbasaddors();
            setMembershipIntents(memberships_intents);
            setProposalIntents(proposals_intents);
            setMembers(members);
            setProposals(proposals);
            setAmbassadors(ambassadors);
            // Set loading states based on operation type
            if (data.isSyncOperation) {
              setIsSyncing(false);
            } else {
              setDbLoading(false);
            }

            setDbError(null);
          } catch (err) {
            clearTimeout(timeoutId);
            setDbLoading(false);
            setIsSyncing(false);
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
    setIsSyncing(true);
    // Use same pattern as initial load - fetch all contexts fresh
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
      isSyncOperation: true,
    });
  }

  /**
   * Finds a membership intent UTxO for a given address
   * @param address The wallet address to search for
   * @returns The matching UTxO or null if not found
   */
  async function findMembershipIntentUtxo(
    address: string,
  ): Promise<Utxo | null> {
    try {

      const utxosWithData = membershipIntents.filter(
        (utxo) => utxo.plutusData,
      );

      const matchingUtxo = utxosWithData.find((utxo) => {
        try {
          if (!utxo.plutusData) return false;
          const datum: MembershipIntentDatum = deserializeDatum(
            utxo.plutusData,
          );
          const metadataPlutus: MembershipMetadata = datum.fields[1];
          const walletAddress = serializeAddressObj(
            metadataPlutus.fields[0] as unknown as
              | PubKeyAddress
              | ScriptAddress,
          );
          return walletAddress === address;
        } catch (error) {
          console.error('Error processing UTxO:', error);
          return false;
        }
      });

      return matchingUtxo || null;
    } catch (error) {
      console.error('Error fetching or processing UTxOs:', error);
      return null;
    }
  }

  return {
    // State
    dbLoading: dbLoading,
    isSyncing,
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
    findMembershipIntentUtxo,
  };
}
