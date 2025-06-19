import React, { useState, useEffect } from "react";
import { UTxO } from "@meshsdk/core";
import Layout from "@/components/Layout";
import {
  parseMembershipIntentDatum,
  fetchMembershipIntentUtxos,
  fetchProposeIntentUtxos,
  fetchProposalUtxos,
  fetchSignOffApprovalUtxos,
  parseProposalDatum,
  findMemberUtxoByAssetName,
} from "@/utils/utils";

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

  // New state for ProposeIntent and Proposal UTXOs
  const [proposeIntentUtxos, setProposeIntentUtxos] = useState<UTxO[]>([]);
  const [proposalUtxos, setProposalUtxos] = useState<UTxO[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [signOffApprovalUtxos, setSignOffApprovalUtxos] = useState<UTxO[]>([]);

  // Fetch all UTXOs (membership intent, propose intent, proposal, sign off approval)
  const fetchAllUtxos = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      setLoadingExtra(true);
      const [utxos, proposeIntent, proposal, signOffApproval] =
        await Promise.all([
          fetchMembershipIntentUtxos(),
          fetchProposeIntentUtxos(),
          fetchProposalUtxos(),
          fetchSignOffApprovalUtxos(),
        ]);
      setState((prev) => ({ ...prev, utxos, loading: false }));
      setProposeIntentUtxos(proposeIntent);
      setProposalUtxos(proposal);
      setSignOffApprovalUtxos(signOffApproval);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to fetch UTXOs",
        loading: false,
      }));
    } finally {
      setLoadingExtra(false);
    }
  };

  // Helper to call admin API
  async function callAdminAction(action: string, params: any) {
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...params }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Action failed");
    return data;
  }

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

  // Handler functions for ProposeIntent UTXOs
  const handleApproveProposal = async (utxo: UTxO) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        result: null,
        error: null,
      }));
      const result = await callAdminAction("approveProposal", {
        proposeIntentUtxo: utxo,
      });
      setState((prev) => ({
        ...prev,
        result: "Proposal approved: " + JSON.stringify(result),
        loading: false,
      }));
      fetchAllUtxos();
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const handleRejectProposal = async (utxo: UTxO) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        result: null,
        error: null,
      }));
      const result = await callAdminAction("rejectProposal", {
        proposeIntentUtxo: utxo,
      });
      setState((prev) => ({
        ...prev,
        result: "Proposal rejected: " + JSON.stringify(result),
        loading: false,
      }));
      fetchAllUtxos();
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, loading: false }));
    }
  };

  // Handler functions for Proposal UTXOs
  const handleApproveSignOff = async (utxo: UTxO) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        result: null,
        error: null,
      }));
      const result = await callAdminAction("approveSignOff", {
        proposalUtxo: utxo,
      });
      setState((prev) => ({
        ...prev,
        result: "SignOff approved: " + JSON.stringify(result),
        loading: false,
      }));
      fetchAllUtxos();
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, loading: false }));
    }
  };

  // Handler functions for SignOffApproval UTxOs
  const handleSignOff = async (utxo: UTxO) => {
    try {
      // Get member asset name from proposal datum
      if (!utxo.output.plutusData) throw new Error("Missing proposal datum");
      const proposalData = parseProposalDatum(utxo.output.plutusData);
      if (!proposalData) throw new Error("Invalid proposal datum");

      // Find member UTxO using the asset name from proposal
      const memberUtxo = await findMemberUtxoByAssetName(
        proposalData.datum.fields[2].int.toString()
      );
      if (!memberUtxo) throw new Error("Member UTxO not found");

      setState((prev) => ({
        ...prev,
        loading: true,
        result: null,
        error: null,
      }));
      const result = await callAdminAction("SignOff", {
        proposalUtxo: utxo,
        signOffApprovalUtxo: utxo,
        memberUtxo,
      });
      setState((prev) => ({
        ...prev,
        result: "SignOff completed: " + JSON.stringify(result),
        loading: false,
      }));
      fetchAllUtxos();
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, loading: false }));
    }
  };

  // Initial setup
  useEffect(() => {
    fetchAllUtxos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Table render helpers
  const renderProposalTable = (
    utxos: UTxO[],
    title: string,
    type: "proposeIntent" | "proposal"
  ) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-2 text-gray-100">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                #
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Tx Hash
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Output Index
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Project Details
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {utxos.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-4 text-gray-400 bg-gray-800"
                >
                  No UTXOs found
                </td>
              </tr>
            ) : (
              utxos.map((utxo, idx) => {
                let projectDetails = "-";
                if (utxo.output.plutusData) {
                  const parsed = parseProposalDatum(utxo.output.plutusData);
                  if (parsed && parsed.metadata) {
                    projectDetails = parsed.metadata.projectDetails;
                  }
                }
                const isSelected = state.selectedUtxo === utxo;
                return (
                  <tr
                    key={`${utxo.input.txHash}-${utxo.input.outputIndex}`}
                    className={`cursor-pointer ${
                      isSelected ? "bg-blue-900" : "hover:bg-gray-700"
                    }`}
                    onClick={() =>
                      setState((prev) => ({ ...prev, selectedUtxo: utxo }))
                    }
                  >
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100 break-all">
                      {utxo.input.txHash}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {utxo.input.outputIndex}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100 break-all">
                      {projectDetails}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {type === "proposeIntent" ? (
                        <>
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveProposal(utxo);
                            }}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectProposal(utxo);
                            }}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded mr-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveSignOff(utxo);
                            }}
                          >
                            Approve SignOff
                          </button>
                          <button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSignOff(utxo);
                            }}
                          >
                            SignOff
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMembershipIntentTable = (utxos: UTxO[]) => (
    <div className="mb-10">
      <h2 className="text-lg font-semibold mb-2 text-gray-100">
        Membership Intent UTXOs
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                #
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Tx Hash
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Output Index
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Full Name
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Display Name
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Email
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Wallet
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Bio
              </th>
            </tr>
          </thead>
          <tbody>
            {utxos.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-4 text-gray-400 bg-gray-800"
                >
                  No UTXOs found
                </td>
              </tr>
            ) : (
              utxos.map((utxo, idx) => {
                let fullName = "-",
                  displayName = "-",
                  email = "-",
                  wallet = "-",
                  bio = "-";
                if (utxo.output.plutusData) {
                  const parsed = parseMembershipIntentDatum(
                    utxo.output.plutusData
                  );
                  if (parsed && parsed.metadata) {
                    fullName = parsed.metadata.fullName;
                    displayName = parsed.metadata.displayName;
                    email = parsed.metadata.emailAddress;
                    wallet = parsed.metadata.walletAddress;
                    bio = parsed.metadata.bio;
                  }
                }
                const isSelected = state.selectedUtxo === utxo;
                return (
                  <tr
                    key={`${utxo.input.txHash}-${utxo.input.outputIndex}`}
                    className={`cursor-pointer ${
                      isSelected ? "bg-blue-900" : "hover:bg-gray-700"
                    }`}
                    onClick={() =>
                      setState((prev) => ({ ...prev, selectedUtxo: utxo }))
                    }
                  >
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100 break-all">
                      {utxo.input.txHash}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {utxo.input.outputIndex}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {fullName}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {displayName}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {email}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100 break-all">
                      {wallet}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {bio}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSignOffApprovalTable = (utxos: UTxO[]) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-2 text-gray-100">
        SignOff Approval UTXOs
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                #
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Tx Hash
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Output Index
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Project Details
              </th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {utxos.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-4 text-gray-400 bg-gray-800"
                >
                  No UTXOs found
                </td>
              </tr>
            ) : (
              utxos.map((utxo, idx) => {
                let projectDetails = "-";
                if (utxo.output.plutusData) {
                  const parsed = parseProposalDatum(utxo.output.plutusData);
                  if (parsed && parsed.metadata) {
                    projectDetails = parsed.metadata.projectDetails;
                  }
                }
                const isSelected = state.selectedUtxo === utxo;
  return (
                  <tr
                    key={`${utxo.input.txHash}-${utxo.input.outputIndex}`}
                    className={`cursor-pointer ${
                      isSelected ? "bg-blue-900" : "hover:bg-gray-700"
                    }`}
                    onClick={() =>
                      setState((prev) => ({ ...prev, selectedUtxo: utxo }))
                    }
                  >
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100 break-all">
                      {utxo.input.txHash}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      {utxo.input.outputIndex}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100 break-all">
                      {projectDetails}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      <button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSignOff(utxo);
                        }}
                      >
                        SignOff
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {state.loading && (
          <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center">
            Loading...
          </div>
        )}
        {loadingExtra && (
          <div className="fixed top-0 left-0 right-0 bg-blue-400 text-white p-2 text-center z-50">
            Loading proposal/proposeIntent UTXOs...
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
            onClick={fetchAllUtxos}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={state.loading || loadingExtra}
          >
            Refresh UTXOs
          </button>
        </div>

        {renderMembershipIntentTable(state.utxos)}

        {/* ProposeIntent UTXOs Table */}
        {renderProposalTable(
          proposeIntentUtxos,
          "Propose Intent UTXOs",
          "proposeIntent"
        )}
        {/* Proposal UTXOs Table */}
        {renderProposalTable(proposalUtxos, "Proposal UTXOs", "proposal")}
        {renderSignOffApprovalTable(signOffApprovalUtxos)}

        {state.selectedUtxo && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 shadow-lg z-50">
            <div className="max-w-4xl mx-auto text-gray-100 relative">
              {/* Cancel Button */}
              <button
                className="absolute top-2 right-2 bg-gray-700 text-gray-200 px-3 py-1 rounded hover:bg-gray-600 focus:outline-none"
                onClick={() =>
                  setState((prev) => ({ ...prev, selectedUtxo: null }))
                }
                aria-label="Cancel"
              >
                Cancel
              </button>
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
                          <div className="bg-gray-800 p-3 rounded">
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
                              <p className="text-gray-300">
                                {membershipData.metadata.bio}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="text-gray-400">
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
                    className="flex-1 p-2 rounded border border-gray-700 bg-gray-800 text-gray-100"
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
                    className="w-32 p-2 rounded border border-gray-700 bg-gray-800 text-gray-100"
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
