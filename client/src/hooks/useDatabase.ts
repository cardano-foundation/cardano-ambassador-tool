'use client';

import { DatabaseManager } from '@/lib/DbManager';
import {
  initUtxoWorker,
  onUtxoWorkerMessage,
  sendUtxoWorkerMessage,
} from '@/lib/utxoWorkerClient';
import { getProvider } from '@/utils';
import {
  deserializeDatum,
  PubKeyAddress,
  ScriptAddress,
  serializeAddressObj,
} from '@meshsdk/core';
import {
  MembershipIntentDatum,
  MembershipMetadata,
} from '@sidan-lab/cardano-ambassador-tool';
import { Utxo } from '@types';
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
  const [signOfApprovals, setSignOfApprovals] = useState<Utxo[]>([]);
  const [treasurySignSettlements, setTreasurySignSettlements] = useState<
    Utxo[]
  >([]);

  const [dbError, setDbError] = useState<string | null>(null);

  // Database initialization and worker setup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDbLoading(false);
    }, 10000);

    try {
      initUtxoWorker();

      const unsubscribe = onUtxoWorkerMessage(async (data) => {
        if (data.db) {
          try {
            clearTimeout(timeoutId);

            await dbManager.initializeDatabase(data.db);
            const memberships_intents =
              dbManager.getUtxosByContext('membership_intent');
            const proposals_intents =
              dbManager.getUtxosByContext('proposal_intent');
            const members = dbManager.getUtxosByContext('members');
            const proposals = dbManager.getUtxosByContext('proposals');
            const sign_of_approvals =
              dbManager.getUtxosByContext('sign_of_approval');
            const treasury_payouts =
              dbManager.getUtxosByContext('treasury_payouts');
            setMembershipIntents(memberships_intents);
            setProposalIntents(proposals_intents);
            setMembers(members);
            setProposals(proposals);
            setSignOfApprovals(sign_of_approvals);
            setTreasurySignSettlements(treasury_payouts);

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
        'members',
        'membership_intent',
        'proposals',
        'proposal_intent',
        'sign_of_approval',
        'treasury_payouts',
      ],
    });
  }

  function syncData(context: string) {
    setIsSyncing(true);
    sendUtxoWorkerMessage({
      action: 'seedAll',
      apiBaseUrl: window.location.origin,
      contexts: [
        'members',
        'membership_intent',
        'proposals',
        'proposal_intent',
        'sign_of_approval',
        'treasury_payouts',
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
      const utxosWithData = membershipIntents.filter((utxo) => utxo.plutusData);

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
    signOfApprovals,
    treasurySignSettlements,

    // Operations
    syncData,
    syncAllData,
    query: queryDb,
    getUtxosByContext,
    findMembershipIntentUtxo,
  };
}
