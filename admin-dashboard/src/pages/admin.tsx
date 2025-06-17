import React, { useState, useEffect } from "react";
import { UTxO } from "@meshsdk/core";
import Layout from "@/components/Layout";
import {
  parseMembershipIntentDatum,
  fetchMembershipIntentUtxos,
} from "@/utils/utils";

const MEMBERSHIP_INTENT_ADDRESS =
  process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_ADDRESS ||
  "addr_test1wz60g3e02uj5wj4tw5x0qdncuarcxk6eckha4h05wsrnv5qytd3pm";

// Types
interface AdminState {
  loading: boolean;
  error: string | null;
  result: string | null;
  utxos: UTxO[];
  selectedUtxo: UTxO | null;
  adminsPkh: string[];
  counterUtxoHash: string;
  counterUtxoIndex: string;
}

const Admin = () => {
  // State
  const [state, setState] = useState<AdminState>({
    loading: false,
    error: null,
    result: null,
    utxos: [],
    selectedUtxo: null,
    adminsPkh: [],
    counterUtxoHash: "",
    counterUtxoIndex: "",
  });

  // Fetch UTXOs
  const fetchUtxos = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const utxos = await fetchMembershipIntentUtxos();
      setState((prev) => ({ ...prev, utxos, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to fetch UTXOs",
        loading: false,
      }));
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

      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approveMember",
          membershipIntentUtxo,
          counterUtxoHash: state.counterUtxoHash,
          counterUtxoIndex: state.counterUtxoIndex,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve member");
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {state.utxos.map((utxo, index) => {
            const membershipData = utxo.output.plutusData
              ? parseMembershipIntentDatum(utxo.output.plutusData)
              : null;

            return (
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
                    {utxo.output.amount.find(
                      (asset) => asset.unit === "lovelace"
                    )?.quantity || 0}{" "}
                    lovelace
                  </div>
                  {membershipData && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="font-medium text-blue-600">
                        Membership Intent Details:
                      </div>
                      <div>Full Name: {membershipData.metadata.fullName}</div>
                      <div>
                        Display Name: {membershipData.metadata.displayName}
                      </div>
                      <div>Email: {membershipData.metadata.emailAddress}</div>
                      <div>Wallet: {membershipData.metadata.walletAddress}</div>
                      <div className="mt-1">
                        <span className="font-medium">Bio:</span>
                        <p className="text-gray-600">
                          {membershipData.metadata.bio}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {state.selectedUtxo && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-4 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Selected UTXO</h2>
              <div className="mb-4">
                <div>Tx Hash: {state.selectedUtxo.input.txHash}</div>
                <div>Output Index: {state.selectedUtxo.input.outputIndex}</div>
                {state.selectedUtxo.output.plutusData && (
                  <div className="mt-2">
                    <h3 className="text-lg font-semibold mb-2">
                      Membership Intent Details
                    </h3>
                    {(() => {
                      const membershipData = parseMembershipIntentDatum(
                        state.selectedUtxo.output.plutusData
                      );
                      if (membershipData) {
                        return (
                          <div className="bg-gray-50 p-3 rounded">
                            <div>
                              Full Name: {membershipData.metadata.fullName}
                            </div>
                            <div>
                              Display Name:{" "}
                              {membershipData.metadata.displayName}
                            </div>
                            <div>
                              Email: {membershipData.metadata.emailAddress}
                            </div>
                            <div>
                              Wallet: {membershipData.metadata.walletAddress}
                            </div>
                            <div className="mt-1">
                              <span className="font-medium">Bio:</span>
                              <p className="text-gray-600">
                                {membershipData.metadata.bio}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="text-gray-500">
                          No valid membership intent data
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Counter UTXO</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Counter TxHash"
                    className="flex-1 p-2 rounded border border-gray-300"
                    value={state.counterUtxoHash}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        counterUtxoHash: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="number"
                    placeholder="OutputIndex"
                    className="w-32 p-2 rounded border border-gray-300"
                    value={state.counterUtxoIndex}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        counterUtxoIndex: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (state.selectedUtxo) {
                    handleApproveMember(state.selectedUtxo);
                  }
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={
                  state.loading ||
                  !state.selectedUtxo ||
                  !state.counterUtxoHash ||
                  !state.counterUtxoIndex
                }
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
