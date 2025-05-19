import Head from "next/head";
import { CardanoWallet, MeshBadge, useWallet } from "@meshsdk/react";
import { AdminActionTx, SetupTx, UserActionTx } from "@/transactions";
import { useState } from "react";
import { UTxO } from "@meshsdk/core";
import { BlockfrostService } from "@/services";

export default function Home() {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const blockfrostService = new BlockfrostService();

  // State for UTxO fetching
  const [txHash, setTxHash] = useState("");
  const [outputIndex, setOutputIndex] = useState("");
  const [, setFetchedUtxo] = useState<UTxO | null>(null);

  // State for UTxO inputs
  const [oracleUtxo, setOracleUtxo] = useState<UTxO | null>(null);
  const [counterUtxo, setCounterUtxo] = useState<UTxO | null>(null);
  const [membershipIntentUtxo, setMembershipIntentUtxo] = useState<UTxO | null>(
    null
  );
  const [memberUtxo, setMemberUtxo] = useState<UTxO | null>(null);
  const [proposeIntentUtxo, setProposeIntentUtxo] = useState<UTxO | null>(null);
  const [proposalUtxo, setProposalUtxo] = useState<UTxO | null>(null);
  const [signOffApprovalUtxo, setSignOffApprovalUtxo] = useState<UTxO | null>(
    null
  );
  const [treasuryUtxos, setTreasuryUtxos] = useState<UTxO[]>([]);
  const [tokenUtxo, setTokenUtxo] = useState<UTxO | null>(null);

  // State for other parameters
  const [tokenPolicyId, setTokenPolicyId] = useState("");
  const [tokenAssetName, setTokenAssetName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [fundRequested, setFundRequested] = useState("");
  const [receiver, setReceiver] = useState("");
  const [adminSigned, setAdminSigned] = useState<string[]>([]);
  const [newAdmins, setNewAdmins] = useState<string[]>([]);
  const [newAdminTenure, setNewAdminTenure] = useState("");
  const [newMultiSigThreshold, setNewMultiSigThreshold] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAction = async (action: () => Promise<any>) => {
    try {
      setLoading(true);
      setError("");
      const result = await action();
      setResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setError(JSON.stringify(error, null, 2));
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  const fetchUtxo = async () => {
    try {
      setLoading(true);
      setError("");
      const utxo = await blockfrostService.fetchUtxo(
        txHash,
        parseInt(outputIndex)
      );
      setFetchedUtxo(utxo);
      setResult(JSON.stringify(utxo, null, 2));
    } catch (error) {
      setError(JSON.stringify(error, null, 2));
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    type: string = "text"
  ) => (
    <div className="mb-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
    </div>
  );

  const renderUTxOInput = (
    label: string,
    value: UTxO | null,
    onChange: (value: UTxO | null) => void
  ) => (
    <div className="mb-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Transaction Hash"
          className="flex-1 p-2 rounded bg-gray-700 text-white"
          onChange={(e) => setTxHash(e.target.value)}
        />
        <input
          type="number"
          placeholder="Output Index"
          className="w-32 p-2 rounded bg-gray-700 text-white"
          onChange={(e) => setOutputIndex(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          onClick={async () => {
            try {
              setLoading(true);
              setError("");
              const utxo = await blockfrostService.fetchUtxo(
                txHash,
                parseInt(outputIndex)
              );
              onChange(utxo);
              setResult(JSON.stringify(utxo, null, 2));
            } catch (error) {
              setError(JSON.stringify(error, null, 2));
              setResult("");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || !txHash || !outputIndex}
        >
          {loading ? "Fetching..." : "Fetch"}
        </button>
      </div>
      <textarea
        value={value ? JSON.stringify(value, null, 2) : ""}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
          } catch {
            onChange(null);
          }
        }}
        className="w-full p-2 rounded bg-gray-700 text-white"
        rows={4}
        placeholder="UTxO JSON will appear here after fetching"
      />
    </div>
  );

  const renderTestButtons = () => {
    if (!connected) return null;

    return (
      <div className="space-y-4 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Test Functions</h2>

        {/* UTxO Fetching Section */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Fetch UTxO</h3>
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">
                Get UTxO by Hash and Index
              </h4>
              {renderInputField("Transaction Hash", txHash, setTxHash)}
              {renderInputField(
                "Output Index",
                outputIndex,
                setOutputIndex,
                "number"
              )}
              <button
                className="bg-blue-500 hover:bg-blue-600 p-2 rounded w-full"
                onClick={fetchUtxo}
                disabled={loading}
              >
                {loading ? "Fetching..." : "Fetch UTxO"}
              </button>
            </div>
          </div>
        </div>

        {/* Setup Functions */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Setup Functions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() =>
                handleAction(async () => {
                  const setup = new SetupTx(
                    await wallet.getChangeAddress(),
                    wallet
                  );
                  return await setup.mintOracleNFT();
                })
              }
            >
              Mint Oracle NFT
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() =>
                handleAction(async () => {
                  const setup = new SetupTx(
                    await wallet.getChangeAddress(),
                    wallet
                  );
                  return await setup.mintCounterNFT();
                })
              }
            >
              Mint Counter NFT
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() =>
                handleAction(async () => {
                  const setup = new SetupTx(
                    await wallet.getChangeAddress(),
                    wallet
                  );
                  return await setup.registerAllCerts();
                })
              }
            >
              Register All Certs
            </button>
          </div>
        </div>

        {/* User Action Functions */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">User Action Functions</h3>
          <div className="space-y-4">
            {/* Apply Membership */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Apply Membership</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderUTxOInput("Token UTxO", tokenUtxo, setTokenUtxo)}
              {renderInputField(
                "Token Policy ID",
                tokenPolicyId,
                setTokenPolicyId
              )}
              {renderInputField(
                "Token Asset Name",
                tokenAssetName,
                setTokenAssetName
              )}
              <button
                className="bg-green-500 hover:bg-green-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo || !tokenUtxo)
                      throw new Error("Missing UTxOs");
                    const userAction = new UserActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await userAction.applyMembership(
                      oracleUtxo,
                      tokenUtxo,
                      tokenPolicyId,
                      tokenAssetName
                    );
                  })
                }
              >
                Apply Membership
              </button>
            </div>

            {/* Propose Project */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Propose Project</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderUTxOInput("Token UTxO", tokenUtxo, setTokenUtxo)}
              {renderUTxOInput("Member UTxO", memberUtxo, setMemberUtxo)}
              {renderInputField("Project URL", projectUrl, setProjectUrl)}
              {renderInputField(
                "Fund Requested",
                fundRequested,
                setFundRequested,
                "number"
              )}
              {renderInputField("Receiver", receiver, setReceiver)}
              <button
                className="bg-green-500 hover:bg-green-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo || !tokenUtxo || !memberUtxo)
                      throw new Error("Missing UTxOs");
                    const userAction = new UserActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await userAction.proposeProject(
                      oracleUtxo,
                      tokenUtxo,
                      memberUtxo,
                      projectUrl,
                      Number(fundRequested),
                      receiver
                    );
                  })
                }
              >
                Propose Project
              </button>
            </div>
          </div>
        </div>

        {/* Admin Action Functions */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Admin Action Functions</h3>
          <div className="space-y-4">
            {/* Approve Member */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Approve Member</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderUTxOInput("Counter UTxO", counterUtxo, setCounterUtxo)}
              {renderUTxOInput(
                "Membership Intent UTxO",
                membershipIntentUtxo,
                setMembershipIntentUtxo
              )}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo || !counterUtxo || !membershipIntentUtxo)
                      throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.approveMember(
                      oracleUtxo,
                      counterUtxo,
                      membershipIntentUtxo,
                      adminSigned
                    );
                  })
                }
              >
                Approve Member
              </button>
            </div>

            {/* Reject Member */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Reject Member</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderUTxOInput(
                "Membership Intent UTxO",
                membershipIntentUtxo,
                setMembershipIntentUtxo
              )}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo || !membershipIntentUtxo)
                      throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.rejectMember(
                      oracleUtxo,
                      membershipIntentUtxo,
                      adminSigned
                    );
                  })
                }
              >
                Reject Member
              </button>
            </div>

            {/* Remove Member */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Remove Member</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderUTxOInput("Member UTxO", memberUtxo, setMemberUtxo)}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo || !memberUtxo)
                      throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.removeMember(
                      oracleUtxo,
                      memberUtxo,
                      adminSigned
                    );
                  })
                }
              >
                Remove Member
              </button>
            </div>

            {/* Approve Proposal */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Approve Proposal</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderUTxOInput(
                "Propose Intent UTxO",
                proposeIntentUtxo,
                setProposeIntentUtxo
              )}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo || !proposeIntentUtxo)
                      throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.approveProposal(
                      oracleUtxo,
                      proposeIntentUtxo,
                      adminSigned
                    );
                  })
                }
              >
                Approve Proposal
              </button>
            </div>

            {/* Reject Proposal */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Reject Proposal</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderUTxOInput(
                "Propose Intent UTxO",
                proposeIntentUtxo,
                setProposeIntentUtxo
              )}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo || !proposeIntentUtxo)
                      throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.rejectProposal(
                      oracleUtxo,
                      proposeIntentUtxo,
                      adminSigned
                    );
                  })
                }
              >
                Reject Proposal
              </button>
            </div>

            {/* Approve Sign Off */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Approve Sign Off</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderUTxOInput("Proposal UTxO", proposalUtxo, setProposalUtxo)}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo || !proposalUtxo)
                      throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.approveSignOff(
                      oracleUtxo,
                      proposalUtxo,
                      adminSigned
                    );
                  })
                }
              >
                Approve Sign Off
              </button>
            </div>

            {/* Sign Off */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Sign Off</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderUTxOInput(
                "Sign Off Approval UTxO",
                signOffApprovalUtxo,
                setSignOffApprovalUtxo
              )}
              {renderUTxOInput("Member UTxO", memberUtxo, setMemberUtxo)}
              <textarea
                value={JSON.stringify(treasuryUtxos, null, 2)}
                onChange={(e) => {
                  try {
                    setTreasuryUtxos(JSON.parse(e.target.value));
                  } catch {
                    setTreasuryUtxos([]);
                  }
                }}
                placeholder="Enter treasury UTxOs as JSON array"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={4}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo || !signOffApprovalUtxo || !memberUtxo)
                      throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.SignOff(
                      oracleUtxo,
                      signOffApprovalUtxo,
                      memberUtxo,
                      treasuryUtxos
                    );
                  })
                }
              >
                Sign Off
              </button>
            </div>

            {/* Rotate Admin */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Rotate Admin</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              <textarea
                value={newAdmins.join("\n")}
                onChange={(e) => setNewAdmins(e.target.value.split("\n"))}
                placeholder="Enter new admin addresses (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              {renderInputField(
                "New Admin Tenure",
                newAdminTenure,
                setNewAdminTenure
              )}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo) throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.rotateAdmin(
                      oracleUtxo,
                      adminSigned,
                      newAdmins,
                      newAdminTenure
                    );
                  })
                }
              >
                Rotate Admin
              </button>
            </div>

            {/* Update Threshold */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Update Threshold</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              {renderInputField(
                "New Multi-sig Threshold",
                newMultiSigThreshold,
                setNewMultiSigThreshold,
                "number"
              )}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo) throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.updateThreshold(
                      oracleUtxo,
                      adminSigned,
                      Number(newMultiSigThreshold)
                    );
                  })
                }
              >
                Update Threshold
              </button>
            </div>

            {/* Stop Oracle */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Stop Oracle</h4>
              {renderUTxOInput("Oracle UTxO", oracleUtxo, setOracleUtxo)}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!oracleUtxo) throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.stopOracle(
                      oracleUtxo,
                      adminSigned
                    );
                  })
                }
              >
                Stop Oracle
              </button>
            </div>

            {/* Stop Counter */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Stop Counter</h4>
              {renderUTxOInput("Counter UTxO", counterUtxo, setCounterUtxo)}
              <textarea
                value={adminSigned.join("\n")}
                onChange={(e) => setAdminSigned(e.target.value.split("\n"))}
                placeholder="Enter admin signatures (one per line)"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={3}
              />
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!counterUtxo) throw new Error("Missing UTxOs");
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.stopCounter(
                      counterUtxo,
                      adminSigned
                    );
                  })
                }
              >
                Stop Counter
              </button>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {(result || error) && (
          <div className="mt-4 p-4 rounded-lg">
            {result && (
              <div className="bg-green-900/50 p-4 rounded-lg mb-4">
                <h3 className="text-xl font-semibold mb-2 text-green-400">
                  Success:
                </h3>
                <pre className="text-left overflow-auto max-h-60 text-green-200">
                  {result}
                </pre>
              </div>
            )}
            {error && (
              <div className="bg-red-900/50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-red-400">
                  Error:
                </h3>
                <pre className="text-left overflow-auto max-h-60 text-red-200">
                  {error}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 w-full text-white text-center">
      <Head>
        <title>Mesh App on Cardano</title>
        <meta name="description" content="A Cardano dApp powered my Mesh" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="mb-20">
          <CardanoWallet />
        </div>
        {renderTestButtons()}
      </main>
      <footer className="p-8 border-t border-gray-300 flex justify-center">
        <MeshBadge isDark={true} />
      </footer>
    </div>
  );
}
