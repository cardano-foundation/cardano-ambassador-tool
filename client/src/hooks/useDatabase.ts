"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/redux/hooks";
import {
  selectDbLoading,
  selectIsSyncing,
  selectMembershipIntents,
  selectProposalIntents,
  selectMembers,
  selectProposals,
  selectSignOfApprovals,
  selectTreasuryPayouts,
  setAllData,
  setDbLoading,
  setTreasuryPayouts as setTreasuryPayoutsAction,
  dbInitialized,
  dbInitializationFailed,
  startSync,
} from "../lib/redux/features/data";
import { DatabaseManager } from "../lib/dbManager";
import {
  initUtxoWorker,
  onUtxoWorkerMessage,
  sendUtxoWorkerMessage,
} from "../lib/utxoWorkerClient";
import {
  deserializeDatum,
  PubKeyAddress,
  ScriptAddress,
  serializeAddressObj,
  TransactionInfo,
} from "@meshsdk/core";
import {
  MembershipIntentDatum,
  MembershipMetadata,
} from "@sidan-lab/cardano-ambassador-tool";
import { Utxo } from "@types";
import { getCatConstants } from "../utils/constants";

const { networkId } = getCatConstants();

// ---------- Database operations ----------
const dbManager = DatabaseManager.getInstance();

// Module-level guard: the worker bootstrap + initial seed should fire once
// per browser session. Without this, every component that calls
// `useDatabase()` re-runs the init effect on mount, triggering 7 redundant
// `/api/utxos` and `/api/txs` fetches on every navigation.
let workerBootstrapped = false;

const queryDb = <T = Record<string, unknown>>(
  sql: string,
  params: any[] = [],
): T[] => {
  return dbManager.query<T>(sql, params);
};

const getUtxosByContextFromDb = (contextName: string): Utxo[] => {
  return dbManager.getUtxosByContext(contextName);
};

/**
 * Database hook - now delegates to Redux for state management.
 * Maintains backward compatibility with existing consumers.
 */
export function useDatabase() {
  const dispatch = useAppDispatch();

  // Read from Redux
  const dbLoading = useAppSelector(selectDbLoading);
  const isSyncing = useAppSelector(selectIsSyncing);
  const membershipIntents = useAppSelector(selectMembershipIntents);
  const proposalIntents = useAppSelector(selectProposalIntents);
  const members = useAppSelector(selectMembers);
  const proposals = useAppSelector(selectProposals);
  const signOfApprovals = useAppSelector(selectSignOfApprovals);
  const treasuryPayouts = useAppSelector(selectTreasuryPayouts);

  // Database initialization and worker setup
  useEffect(() => {
    if (workerBootstrapped) return;
    workerBootstrapped = true;

    const timeoutId = setTimeout(() => {
      dispatch(setDbLoading(false));
    }, 10000);

    try {
      initUtxoWorker();

      const unsubscribe = onUtxoWorkerMessage(async (data) => {
        if (data.db) {
          try {
            clearTimeout(timeoutId);

            await dbManager.initializeDatabase(data.db);
            const memberships_intents =
              dbManager.getUtxosByContext("membership_intent");
            const proposals_intents =
              dbManager.getUtxosByContext("proposal_intent");
            const membersData = dbManager.getUtxosByContext("members");
            const proposalsData = dbManager.getUtxosByContext("proposals");
            const sign_of_approvals =
              dbManager.getUtxosByContext("sign_of_approval");
            const treasury_payouts = dbManager.getPayoutUtxos();

            // Dispatch all data to Redux
            dispatch(
              setAllData({
                membershipIntents: memberships_intents,
                proposalIntents: proposals_intents,
                members: membersData,
                proposals: proposalsData,
                signOfApprovals: sign_of_approvals,
                treasuryPayouts: treasury_payouts,
              }),
            );

            dispatch(
              dbInitialized({ isSyncOperation: data.isSyncOperation || false }),
            );
          } catch (err) {
            clearTimeout(timeoutId);
            dispatch(
              dbInitializationFailed(
                err instanceof Error
                  ? err.message
                  : "Database initialization failed",
              ),
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
      dispatch(setDbLoading(false));
    }
  }, [dispatch]);

  // Database operations
  const syncAllData = useCallback(() => {
    sendUtxoWorkerMessage({
      action: "seedAll",
      apiBaseUrl: typeof window !== "undefined" ? window.location.origin : "",
      contexts: [
        "members",
        "membership_intent",
        "proposals",
        "proposal_intent",
        "sign_of_approval",
        "treasury_payouts",
      ],
    });
  }, []);

  const syncData = useCallback(
    (context: string) => {
      dispatch(startSync());
      sendUtxoWorkerMessage({
        action: "seedAll",
        apiBaseUrl: typeof window !== "undefined" ? window.location.origin : "",
        contexts: [
          "members",
          "membership_intent",
          "proposals",
          "proposal_intent",
          "sign_of_approval",
          "treasury_payouts",
        ],
        isSyncOperation: true,
      });
    },
    [dispatch],
  );

  /**
   * Finds a membership intent UTxO for a given address
   * @param address The wallet address to search for
   * @returns The matching UTxO or null if not found
   */
  const findMembershipIntentUtxo = useCallback(
    async (address: string): Promise<Utxo | null> => {
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
              networkId,
            );
            return walletAddress === address;
          } catch (error) {
            console.error("Error processing UTxO:", error);
            return false;
          }
        });

        return matchingUtxo || null;
      } catch (error) {
        console.error("Error fetching or processing UTxOs:", error);
        return null;
      }
    },
    [membershipIntents],
  );

  // Wrapper for getUtxosByContext that reads from Redux
  const getUtxosByContext = useCallback(
    (contextName: string): Utxo[] => {
      switch (contextName) {
        case "membership_intent":
          return membershipIntents;
        case "proposal_intent":
          return proposalIntents;
        case "members":
          return members;
        case "proposals":
          return proposals;
        case "sign_of_approval":
          return signOfApprovals;
        default:
          // Fall back to database manager for unknown contexts
          return getUtxosByContextFromDb(contextName);
      }
    },
    [membershipIntents, proposalIntents, members, proposals, signOfApprovals],
  );

  // Setter for treasury payouts (backward compatibility)
  const setTreasuryPayouts = useCallback(
    (payouts: TransactionInfo[]) => {
      dispatch(setTreasuryPayoutsAction(payouts));
    },
    [dispatch],
  );

  return {
    // State
    dbLoading,
    isSyncing,
    membershipIntents,
    proposalIntents,
    members,
    proposals,
    signOfApprovals,
    treasuryPayouts,
    setTreasuryPayouts,
    // Operations
    syncData,
    syncAllData,
    query: queryDb,
    getUtxosByContext,
    findMembershipIntentUtxo,
  };
}
