import React, { useState, useEffect } from "react";
import { hexToString, stringToHex, UTxO } from "@meshsdk/core";
import Layout from "@/components/Layout";
import {
  parseMembershipIntentDatum,
  fetchMembershipIntentUtxos,
  fetchProposeIntentUtxos,
  fetchProposalUtxos,
  fetchSignOffApprovalUtxos,
  parseProposalDatum,
  findMemberUtxoByAssetName,
  fetchMemberUtxos,
  parseMemberDatum,
} from "@/utils/utils";

// Types
interface AdminState {
  loading: boolean;
  error: string | null;
  result: string | null;
  utxos: UTxO[];
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
    adminsPkh: [],
    counterUtxoHash: "",
    counterUtxoIndex: "",
  });

  // New state for ProposeIntent and Proposal UTXOs
  const [proposeIntentUtxos, setProposeIntentUtxos] = useState<UTxO[]>([]);
  const [proposalUtxos, setProposalUtxos] = useState<UTxO[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [signOffApprovalUtxos, setSignOffApprovalUtxos] = useState<UTxO[]>([]);
  const [memberUtxos, setMemberUtxos] = useState<UTxO[]>([]);

  // Fetch all UTXOs (membership intent, propose intent, proposal, sign off approval)
  const fetchAllUtxos = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      setLoadingExtra(true);
      const [utxos, proposeIntent, proposal, signOffApproval, members] =
        await Promise.all([
          fetchMembershipIntentUtxos(),
          fetchProposeIntentUtxos(),
          fetchProposalUtxos(),
          fetchSignOffApprovalUtxos(),
          fetchMemberUtxos(),
        ]);
      setState((prev) => ({ ...prev, utxos, loading: false }));
      setProposeIntentUtxos(proposeIntent);
      setProposalUtxos(proposal);
      setSignOffApprovalUtxos(signOffApproval);
      setMemberUtxos(members);
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
        stringToHex(proposalData.datum.fields[2].int.toString())
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

  const handleRemoveMember = async (memberUtxo: UTxO) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null, result: null }));
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeMember", memberUtxo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to remove member");
      setState((prev) => ({ ...prev, result: "Member removed successfully", loading: false }));
      fetchAllUtxos();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to remove member",
        loading: false,
      }));
    }
  };

  const handleRejectMember = async (membershipIntentUtxo: UTxO) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null, result: null }));
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rejectMember", membershipIntentUtxo }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reject member");
      setState((prev) => ({ ...prev, result: "Member rejected successfully", loading: false }));
      fetchAllUtxos();
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to reject member",
        loading: false,
      }));
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
                return (
                  <tr
                    key={`${utxo.input.txHash}-${utxo.input.outputIndex}`}
                    className="hover:bg-gray-700 cursor-pointer"
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
      {/* Counter UTxO input fields for Approve */}
      <div className="mb-4 flex gap-2 items-end">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Counter UTxO Tx Hash</label>
          <input
            type="text"
            className="p-2 rounded border border-gray-700 bg-gray-800 text-gray-100"
            value={state.counterUtxoHash}
            onChange={e => setState(prev => ({ ...prev, counterUtxoHash: e.target.value }))}
            placeholder="Counter Tx Hash"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Counter UTxO Output Index</label>
          <input
            type="number"
            className="p-2 rounded border border-gray-700 bg-gray-800 text-gray-100"
            value={state.counterUtxoIndex}
            onChange={e => setState(prev => ({ ...prev, counterUtxoIndex: e.target.value }))}
            placeholder="Output Index"
          />
        </div>
        <span className="ml-2 text-xs text-gray-400">(Required for Approve)</span>
      </div>
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
              <th className="px-4 py-2 border border-gray-700 text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {utxos.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
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
                return (
                  <tr
                    key={`${utxo.input.txHash}-${utxo.input.outputIndex}`}
                    className="hover:bg-gray-700 cursor-pointer"
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
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleApproveMember(utxo)}
                        disabled={state.loading || !state.counterUtxoHash || !state.counterUtxoIndex}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                        onClick={() => handleRejectMember(utxo)}
                        disabled={state.loading}
                      >
                        Reject
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
                return (
                  <tr
                    key={`${utxo.input.txHash}-${utxo.input.outputIndex}`}
                    className="hover:bg-gray-700 cursor-pointer"
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

  const renderMemberTable = (utxos: UTxO[]) => (
    <div className="mb-10">
      <h2 className="text-lg font-semibold mb-2 text-gray-100">Member UTXOs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">#</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Tx Hash</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Output Index</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Full Name</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Display Name</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Email</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Wallet</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Bio</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Fund Received</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Completion Map</th>
              <th className="px-4 py-2 border border-gray-700 text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {utxos.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-4 text-gray-400 bg-gray-800">
                  No UTXOs found
                </td>
              </tr>
            ) : (
              utxos.map((utxo, idx) => {
                let fullName = "-",
                  displayName = "-",
                  email = "-",
                  wallet = "-",
                  bio = "-",
                  fundReceived = "-",
                  completionMap: string | JSX.Element = "-";
                if (utxo.output.plutusData) {
                  const parsed = parseMemberDatum(utxo.output.plutusData);
                  if (parsed && parsed.member) {
                    fullName = parsed.member.metadata.fullName;
                    displayName = parsed.member.metadata.displayName;
                    email = parsed.member.metadata.emailAddress;
                    wallet = parsed.member.metadata.walletAddress;
                    bio = parsed.member.metadata.bio;
                    fundReceived = parsed.member.fundReceived.toString();
                    const entries = Array.from(parsed.member.completion.entries());
                    if (entries.length > 0) {
                      completionMap = (
                        <ul className="text-xs text-gray-200">
                          {entries.map(([proj, value], i) => (
                            <li key={i}>
                              <span className="font-semibold">{proj.projectDetails}:</span> {value}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                  }
                }
                return (
                  <tr key={`${utxo.input.txHash}-${utxo.input.outputIndex}`} className="hover:bg-gray-700 cursor-pointer">
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">{idx + 1}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100 break-all">{utxo.input.txHash}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">{utxo.input.outputIndex}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">{fullName}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">{displayName}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">{email}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100 break-all">{wallet}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">{bio}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">{fundReceived}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">{completionMap}</td>
                    <td className="px-4 py-2 border border-gray-700 text-gray-100">
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                        onClick={() => handleRemoveMember(utxo)}
                        disabled={state.loading}
                      >
                        Remove
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
        {renderMemberTable(memberUtxos)}
      </div>
    </Layout>
  );
};

export default Admin;
