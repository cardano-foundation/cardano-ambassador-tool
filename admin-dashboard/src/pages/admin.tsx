import { blockfrost, BlockfrostService } from "@/services";
import { deserializeAddress, MeshWallet } from "@meshsdk/core";
import React, { useState, useEffect } from "react";
import { UTxO } from "@meshsdk/core";
import Layout from "@/components/Layout";
import {
  AdminActionTx,
  CATConstants,
} from "@sidan-lab/cardano-ambassador-tool";

const blockfrostService = new BlockfrostService();

// Environment variables
const ADMIN_MNEMONIC_1 = process.env.NEXT_PUBLIC_ADMIN_MNEMONIC_1 || "";
const ADMIN_MNEMONIC_2 = process.env.NEXT_PUBLIC_ADMIN_MNEMONIC_2 || "";
const ADMIN_MNEMONIC_3 = process.env.NEXT_PUBLIC_ADMIN_MNEMONIC_3 || "";

const MEMBERSHIP_INTENT_ADDRESS =
  process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_ADDRESS ||
  "addr_test1wz60g3e02uj5wj4tw5x0qdncuarcxk6eckha4h05wsrnv5qytd3pm";

// Setup UTxOs
const SETUP_UTXO = {
  oracle: {
    txHash:
      process.env.NEXT_PUBLIC_ORACLE_SETUP_TX_HASH ||
      "1f2344f32e3ea769e58394719f3eea9a6170796de75884b80aa8df410a965b08",
    outputIndex: parseInt(
      process.env.NEXT_PUBLIC_ORACLE_SETUP_OUTPUT_INDEX || "1"
    ),
  },
  counter: {
    txHash:
      process.env.NEXT_PUBLIC_COUNTER_SETUP_TX_HASH ||
      "e32a7c0204a2f624934b5fe32b850076787fc9a2d66e91756ff192c6efc774ac",
    outputIndex: parseInt(
      process.env.NEXT_PUBLIC_COUNTER_SETUP_OUTPUT_INDEX || "1"
    ),
  },
};

// Reference Transaction Scripts
const REF_TX_IN_SCRIPTS = {
  membershipIntent: {
    mint: {
      txHash:
        process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_TX_HASH ||
        "394eae3278555db8f77c2b56c82b47a9efe6bf5b713bc8dcdc2f293a74cec02a",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_OUTPUT_INDEX || "0"
      ),
    },
    spend: {
      txHash:
        process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_TX_HASH ||
        "394eae3278555db8f77c2b56c82b47a9efe6bf5b713bc8dcdc2f293a74cec02a",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_OUTPUT_INDEX || "1"
      ),
    },
  },
  member: {
    mint: {
      txHash:
        process.env.NEXT_PUBLIC_MEMBER_MINT_TX_HASH ||
        "79ef5c8906b4419ba59198409bdc6ec3f6a4c297ae70b75022d24b36ff6a07db",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_MEMBER_MINT_OUTPUT_INDEX || "0"
      ),
    },
    spend: {
      txHash:
        process.env.NEXT_PUBLIC_MEMBER_SPEND_TX_HASH ||
        "79ef5c8906b4419ba59198409bdc6ec3f6a4c297ae70b75022d24b36ff6a07db",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_MEMBER_SPEND_OUTPUT_INDEX || "1"
      ),
    },
  },
  proposeIntent: {
    mint: {
      txHash:
        process.env.NEXT_PUBLIC_PROPOSE_INTENT_MINT_TX_HASH ||
        "66ef88ec0a34fca6ce6c083a2b8e5fd80cbd533c6a45fa725a9ed7b59f64f9e6",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_PROPOSE_INTENT_MINT_OUTPUT_INDEX || "0"
      ),
    },
    spend: {
      txHash:
        process.env.NEXT_PUBLIC_PROPOSE_INTENT_SPEND_TX_HASH ||
        "66ef88ec0a34fca6ce6c083a2b8e5fd80cbd533c6a45fa725a9ed7b59f64f9e6",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_PROPOSE_INTENT_SPEND_OUTPUT_INDEX || "1"
      ),
    },
  },
  proposal: {
    mint: {
      txHash:
        process.env.NEXT_PUBLIC_PROPOSAL_MINT_TX_HASH ||
        "15e40234dc2e6edfe10c45f4920e6866901d1aa2af7d95af9ff16aefbfb24137",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_PROPOSAL_MINT_OUTPUT_INDEX || "0"
      ),
    },
    spend: {
      txHash:
        process.env.NEXT_PUBLIC_PROPOSAL_SPEND_TX_HASH ||
        "15e40234dc2e6edfe10c45f4920e6866901d1aa2af7d95af9ff16aefbfb24137",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_PROPOSAL_SPEND_OUTPUT_INDEX || "1"
      ),
    },
  },
  signOffApproval: {
    mint: {
      txHash:
        process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_TX_HASH ||
        "1bf5379292dde4b825842b4c9b96d73d48f2c649fcee91b6c4d72a8cb9196739",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_OUTPUT_INDEX || "0"
      ),
    },
    spend: {
      txHash:
        process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_TX_HASH ||
        "1bf5379292dde4b825842b4c9b96d73d48f2c649fcee91b6c4d72a8cb9196739",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_OUTPUT_INDEX || "1"
      ),
    },
  },
  treasury: {
    spend: {
      txHash:
        process.env.NEXT_PUBLIC_TREASURY_SPEND_TX_HASH ||
        "7e9c7e48dfdd72ff480abe5a00f4ffadfc6f6e8f03861d62816275a12741a474",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_TREASURY_SPEND_OUTPUT_INDEX || "0"
      ),
    },
    withdrawal: {
      txHash:
        process.env.NEXT_PUBLIC_TREASURY_WITHDRAWAL_TX_HASH ||
        "7e9c7e48dfdd72ff480abe5a00f4ffadfc6f6e8f03861d62816275a12741a474",
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_TREASURY_WITHDRAWAL_OUTPUT_INDEX || "1"
      ),
    },
  },
};

// Types
interface AdminState {
  loading: boolean;
  error: string | null;
  result: string | null;
  utxos: UTxO[];
  selectedUtxo: UTxO | null;
  adminsPkh: string[];
}

// Helper functions
const getWallet = (mnemonic: string): MeshWallet => {
  return new MeshWallet({
    networkId: 0,
    fetcher: blockfrost,
    submitter: blockfrost,
    key: {
      type: "mnemonic",
      words: mnemonic.split(","),
    },
  });
};

const getCatConstants = () => {
  const network =
    (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "preprod") || "preprod";
  return new CATConstants(network, SETUP_UTXO, REF_TX_IN_SCRIPTS);
};

const Admin = () => {
  // Initialize wallets
  const admin1 = getWallet(ADMIN_MNEMONIC_1);
  const admin2 = getWallet(ADMIN_MNEMONIC_2);
  const admin3 = getWallet(ADMIN_MNEMONIC_3);

  // State
  const [state, setState] = useState<AdminState>({
    loading: false,
    error: null,
    result: null,
    utxos: [],
    selectedUtxo: null,
    adminsPkh: [],
  });

  // Get admin public key hashes
  const getAdminsPks = async (): Promise<string[]> => {
    try {
      const addr1 = await admin1.getChangeAddress();
      const pkh1 = deserializeAddress(addr1).pubKeyHash;

      const addr2 = await admin2.getChangeAddress();
      const pkh2 = deserializeAddress(addr2).pubKeyHash;

      const addr3 = await admin3.getChangeAddress();
      const pkh3 = deserializeAddress(addr3).pubKeyHash;

      return [pkh1, pkh2, pkh3];
    } catch (error) {
      throw new Error("Failed to get admin public key hashes");
    }
  };

  // Fetch UTXOs
  const fetchUtxos = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const utxos = await blockfrost.fetchAddressUTxOs(
        MEMBERSHIP_INTENT_ADDRESS
      );
      setState((prev) => ({ ...prev, utxos, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to fetch UTXOs",
        loading: false,
      }));
    }
  };

  // Fetch specific UTXO
  const fetchUtxo = async (
    hash: string,
    index: string,
    label: string
  ): Promise<UTxO> => {
    if (!hash || !index) {
      throw new Error(
        `Please provide both Transaction Hash and Output Index for ${label}`
      );
    }
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const utxo = await blockfrostService.fetchUtxo(hash, parseInt(index));
      setState((prev) => ({ ...prev, loading: false }));
      return utxo;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: JSON.stringify(error, null, 2),
        loading: false,
      }));
      throw error;
    }
  };

  // Handle approve member action
  const handleApproveMember = async (membershipIntentUtxo: UTxO) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        result: null,
      }));

      // Fetch required UTXOs
      const [oracleUtxo, counterUtxo] = await Promise.all([
        fetchUtxo(
          process.env.NEXT_PUBLIC_ORACLE_TX_HASH ||
            "5419ad9bb41f9b8d78a1fcfe885e3f45801af848280a1835c0d6b4db295a2553",
          process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || "0",
          "Oracle UTxO"
        ),
        fetchUtxo(
          process.env.NEXT_PUBLIC_COUNTER_TX_HASH ||
            "1bd1503b7ad956fb44476c92128684c4880cb886b0cd73f83557d107663558d3",
          process.env.NEXT_PUBLIC_COUNTER_OUTPOUT_INDEX || "0",
          "Counter UTxO"
        ),
      ]);

      // Get admin public key hashes
      const adminsPkh = state.adminsPkh;

      // Create and execute transaction
      const address = await admin2.getChangeAddress();
      const adminAction = new AdminActionTx(
        address,
        admin2,
        blockfrost,
        getCatConstants()
      );

      const unsignedTx = await adminAction.approveMember(
        oracleUtxo,
        counterUtxo,
        membershipIntentUtxo,
        adminsPkh
      );

      if (!unsignedTx) {
        throw new Error("Failed to create transaction");
      }

      // Multi-sign transaction
      const admin1SignedTx = await admin1.signTx(unsignedTx.txHex, true);
      const admin12SignedTx = await admin2.signTx(admin1SignedTx, true);
      const allSignedTx = await admin3.signTx(admin12SignedTx, true);

      // Submit transaction
      await admin2.submitTx(allSignedTx);

      setState((prev) => ({
        ...prev,
        result: "Member approved successfully",
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to approve member",
        loading: false,
      }));
    }
  };

  // Initial setup
  useEffect(() => {
    const initialize = async () => {
      try {
        const adminsPkh = await getAdminsPks();
        setState((prev) => ({ ...prev, adminsPkh }));
        await fetchUtxos();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to initialize",
        }));
      }
    };
    initialize();
  }, []);

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {state.loading && (
          <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center">
            Loading...
          </div>
        )}

        {state.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {state.error}
          </div>
        )}

        {state.result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {state.result}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={fetchUtxos}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={state.loading}
          >
            Refresh UTXOs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.utxos.map((utxo, index) => (
            <div
              key={`${utxo.input.txHash}-${utxo.input.outputIndex}`}
              className={`border rounded p-4 cursor-pointer transition-colors ${
                state.selectedUtxo === utxo
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-500"
              }`}
              onClick={() =>
                setState((prev) => ({ ...prev, selectedUtxo: utxo }))
              }
            >
              <div className="font-semibold mb-2">UTXO #{index + 1}</div>
              <div className="text-sm break-all">
                <div>Tx Hash: {utxo.input.txHash}</div>
                <div>Output Index: {utxo.input.outputIndex}</div>
                <div>
                  Amount:{" "}
                  {utxo.output.amount.find((asset) => asset.unit === "lovelace")
                    ?.quantity || 0}{" "}
                  lovelace
                </div>
              </div>
            </div>
          ))}
        </div>

        {state.selectedUtxo && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Selected UTXO</h2>
              <div className="mb-4">
                <div>Tx Hash: {state.selectedUtxo.input.txHash}</div>
                <div>Output Index: {state.selectedUtxo.input.outputIndex}</div>
              </div>
              <button
                onClick={() => {
                  if (state.selectedUtxo) {
                    handleApproveMember(state.selectedUtxo);
                  }
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={state.loading || !state.selectedUtxo}
              >
                {state.loading ? "Processing..." : "Approve Member"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
