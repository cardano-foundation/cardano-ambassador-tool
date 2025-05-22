import Head from "next/head";
import { CardanoWallet, MeshBadge, useWallet } from "@meshsdk/react";
import { AdminActionTx, SetupTx, UserActionTx } from "@/transactions";
import { useState } from "react";
import { UTxO } from "@meshsdk/core";
import { BlockfrostService } from "@/services";

export default function Home() {
  const { connected, wallet } = useWallet();
  const [, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const blockfrostService = new BlockfrostService();

  // State for UTxO inputs
  const [oracleUtxoHash, setOracleUtxoHash] = useState(
    "f2c95746f252b609e03ca9447548589aa3def1a83bb0d7d67617be041dfef203"
  );
  const [oracleUtxoIndex, setOracleUtxoIndex] = useState("0");
  const [tokenUtxoHash, setTokenUtxoHash] = useState(
    "b5461230311cde067d202ebf22d6f511f2eadba8f8672d4b2835c07ee24abd22"
  );
  const [tokenUtxoIndex, setTokenUtxoIndex] = useState("1");
  const [memberUtxoHash, setMemberUtxoHash] = useState(
    "b5461230311cde067d202ebf22d6f511f2eadba8f8672d4b2835c07ee24abd22"
  );
  const [memberUtxoIndex, setMemberUtxoIndex] = useState("2");
  const [counterUtxoHash, setCounterUtxoHash] = useState("");
  const [counterUtxoIndex, setCounterUtxoIndex] = useState("");
  const [membershipIntentUtxoHash, setMembershipIntentUtxoHash] = useState("");
  const [membershipIntentUtxoIndex, setMembershipIntentUtxoIndex] =
    useState("");
  const [proposeIntentUtxoHash, setProposeIntentUtxoHash] = useState("");
  const [proposeIntentUtxoIndex, setProposeIntentUtxoIndex] = useState("");
  const [proposalUtxoHash, setProposalUtxoHash] = useState("");
  const [proposalUtxoIndex, setProposalUtxoIndex] = useState("");
  const [signOffApprovalUtxoHash, setSignOffApprovalUtxoHash] = useState("");
  const [signOffApprovalUtxoIndex, setSignOffApprovalUtxoIndex] = useState("");
  const [treasuryUtxoInputs, setTreasuryUtxoInputs] = useState<
    { hash: string; index: string }[]
  >([{ hash: "", index: "" }]);

  const addTreasuryUtxoInput = () => {
    setTreasuryUtxoInputs([...treasuryUtxoInputs, { hash: "", index: "" }]);
  };

  const removeTreasuryUtxoInput = (index: number) => {
    const newInputs = treasuryUtxoInputs.filter((_, i) => i !== index);
    setTreasuryUtxoInputs(newInputs);
  };

  const updateTreasuryUtxoInput = (
    index: number,
    field: "hash" | "index",
    value: string
  ) => {
    const newInputs = [...treasuryUtxoInputs];
    newInputs[index][field] = value;
    setTreasuryUtxoInputs(newInputs);
  };

  const fetchTreasuryUtxos = async () => {
    const utxos: UTxO[] = [];
    for (const input of treasuryUtxoInputs) {
      if (input.hash && input.index) {
        try {
          const utxo = await fetchUtxo(
            input.hash,
            input.index,
            "Treasury UTxO"
          );
          utxos.push(utxo);
        } catch (error) {
          console.error(
            `Error fetching UTxO ${input.hash}#${input.index}:`,
            error
          );
          throw error;
        }
      }
    }
    return utxos;
  };

  const renderUtxoInputs = (
    label: string,
    hash: string,
    setHash: (value: string) => void,
    index: string,
    setIndex: (value: string) => void
  ) => (
    <div className="mb-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Transaction Hash"
          className="flex-1 p-2 rounded bg-gray-700 text-white"
          value={hash}
          onChange={(e) => setHash(e.target.value)}
        />
        <input
          type="number"
          placeholder="Output Index"
          className="w-32 p-2 rounded bg-gray-700 text-white"
          value={index}
          onChange={(e) => setIndex(e.target.value)}
        />
      </div>
    </div>
  );

  const fetchUtxo = async (hash: string, index: string, label: string) => {
    if (!hash || !index) {
      throw new Error(
        `Please provide both Transaction Hash and Output Index for ${label}`
      );
    }
    try {
      setLoading(true);
      setError("");
      const utxo = await blockfrostService.fetchUtxo(hash, parseInt(index));
      return utxo;
    } catch (error) {
      setError(JSON.stringify(error, null, 2));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // State for other parameters
  const [tokenPolicyId, setTokenPolicyId] = useState("");
  const [tokenAssetName, setTokenAssetName] = useState("");
  const [projectUrl, setProjectUrl] = useState("111");
  const [fundRequested, setFundRequested] = useState("1111111");
  const [receiver, setReceiver] = useState(
    "addr_test1qzhm3fg7v9t9e4nrlw0z49cysmvzfy3xpmvxuht80aa3rvnm5tz7rfnph9ntszp2fclw5m334udzq49777gkhwkztsks4c69rg"
  );
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

  const renderTestButtons = () => {
    if (!connected) return null;

    return (
      <div className="space-y-4 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Test Functions</h2>

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
                  return await setup.mintSpendOracleNFT();
                })
              }
            >
              Mint and Spend Oracle NFT
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() =>
                handleAction(async () => {
                  const setup = new SetupTx(
                    await wallet.getChangeAddress(),
                    wallet
                  );
                  return await setup.spendCounterNFT();
                })
              }
            >
              Spend Counter NFT
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
            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() =>
                handleAction(async () => {
                  const setup = new SetupTx(
                    await wallet.getChangeAddress(),
                    wallet
                  );
                  return await setup.txOutScript();
                })
              }
            >
              Tx Out Scripts
            </button>
          </div>
        </div>

        {/* Transaction Signing and Submission */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">
            Transaction Signing and Submission
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Sign Transaction</h4>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Enter unsigned transaction hex"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={4}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!result) {
                      throw new Error(
                        "Please provide an unsigned transaction hex"
                      );
                    }
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.adminSignTx(result);
                  })
                }
              >
                Sign Transaction
              </button>
            </div>

            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Submit Transaction</h4>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Enter signed transaction hex"
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                rows={4}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    if (!result) {
                      throw new Error(
                        "Please provide a signed transaction hex"
                      );
                    }
                    const adminAction = new AdminActionTx(
                      await wallet.getChangeAddress(),
                      wallet
                    );
                    return await adminAction.adminSubmitTx(result);
                  })
                }
              >
                Submit Transaction
              </button>
            </div>
          </div>
        </div>

        {/* User Action Functions */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">User Action Functions</h3>
          <div className="space-y-4">
            {/* Apply Membership */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Apply Membership</h4>
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              {renderUtxoInputs(
                "Token UTxO",
                tokenUtxoHash,
                setTokenUtxoHash,
                tokenUtxoIndex,
                setTokenUtxoIndex
              )}
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    const tokenUtxo = await fetchUtxo(
                      tokenUtxoHash,
                      tokenUtxoIndex,
                      "Token UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              {renderUtxoInputs(
                "Token UTxO",
                tokenUtxoHash,
                setTokenUtxoHash,
                tokenUtxoIndex,
                setTokenUtxoIndex
              )}
              {renderUtxoInputs(
                "Member UTxO",
                memberUtxoHash,
                setMemberUtxoHash,
                memberUtxoIndex,
                setMemberUtxoIndex
              )}
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    const tokenUtxo = await fetchUtxo(
                      tokenUtxoHash,
                      tokenUtxoIndex,
                      "Token UTxO"
                    );
                    const memberUtxo = await fetchUtxo(
                      memberUtxoHash,
                      memberUtxoIndex,
                      "Member UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              {renderUtxoInputs(
                "Counter UTxO",
                counterUtxoHash,
                setCounterUtxoHash,
                counterUtxoIndex,
                setCounterUtxoIndex
              )}
              {renderUtxoInputs(
                "Membership Intent UTxO",
                membershipIntentUtxoHash,
                setMembershipIntentUtxoHash,
                membershipIntentUtxoIndex,
                setMembershipIntentUtxoIndex
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    const counterUtxo = await fetchUtxo(
                      counterUtxoHash,
                      counterUtxoIndex,
                      "Counter UTxO"
                    );
                    const membershipIntentUtxo = await fetchUtxo(
                      membershipIntentUtxoHash,
                      membershipIntentUtxoIndex,
                      "Membership Intent UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              {renderUtxoInputs(
                "Membership Intent UTxO",
                membershipIntentUtxoHash,
                setMembershipIntentUtxoHash,
                membershipIntentUtxoIndex,
                setMembershipIntentUtxoIndex
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    const membershipIntentUtxo = await fetchUtxo(
                      membershipIntentUtxoHash,
                      membershipIntentUtxoIndex,
                      "Membership Intent UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              {renderUtxoInputs(
                "Member UTxO",
                memberUtxoHash,
                setMemberUtxoHash,
                memberUtxoIndex,
                setMemberUtxoIndex
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    const memberUtxo = await fetchUtxo(
                      memberUtxoHash,
                      memberUtxoIndex,
                      "Member UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              {renderUtxoInputs(
                "Propose Intent UTxO",
                proposeIntentUtxoHash,
                setProposeIntentUtxoHash,
                proposeIntentUtxoIndex,
                setProposeIntentUtxoIndex
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    const proposeIntentUtxo = await fetchUtxo(
                      proposeIntentUtxoHash,
                      proposeIntentUtxoIndex,
                      "Propose Intent UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              {renderUtxoInputs(
                "Propose Intent UTxO",
                proposeIntentUtxoHash,
                setProposeIntentUtxoHash,
                proposeIntentUtxoIndex,
                setProposeIntentUtxoIndex
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    const proposeIntentUtxo = await fetchUtxo(
                      proposeIntentUtxoHash,
                      proposeIntentUtxoIndex,
                      "Propose Intent UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              {renderUtxoInputs(
                "Proposal UTxO",
                proposalUtxoHash,
                setProposalUtxoHash,
                proposalUtxoIndex,
                setProposalUtxoIndex
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    const proposalUtxo = await fetchUtxo(
                      proposalUtxoHash,
                      proposalUtxoIndex,
                      "Proposal UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              {renderUtxoInputs(
                "Sign Off Approval UTxO",
                signOffApprovalUtxoHash,
                setSignOffApprovalUtxoHash,
                signOffApprovalUtxoIndex,
                setSignOffApprovalUtxoIndex
              )}
              {renderUtxoInputs(
                "Member UTxO",
                memberUtxoHash,
                setMemberUtxoHash,
                memberUtxoIndex,
                setMemberUtxoIndex
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Treasury UTxOs
                </label>
                {treasuryUtxoInputs.map((input, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Transaction Hash"
                      className="flex-1 p-2 rounded bg-gray-700 text-white"
                      value={input.hash}
                      onChange={(e) =>
                        updateTreasuryUtxoInput(index, "hash", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Output Index"
                      className="w-32 p-2 rounded bg-gray-700 text-white"
                      value={input.index}
                      onChange={(e) =>
                        updateTreasuryUtxoInput(index, "index", e.target.value)
                      }
                    />
                    <button
                      onClick={() => removeTreasuryUtxoInput(index)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTreasuryUtxoInput}
                  className="w-full p-2 bg-blue-500 hover:bg-blue-600 rounded"
                >
                  Add Treasury UTxO
                </button>
              </div>
              <button
                className="bg-red-500 hover:bg-red-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction(async () => {
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    const signOffApprovalUtxo = await fetchUtxo(
                      signOffApprovalUtxoHash,
                      signOffApprovalUtxoIndex,
                      "Sign Off Approval UTxO"
                    );
                    const memberUtxo = await fetchUtxo(
                      memberUtxoHash,
                      memberUtxoIndex,
                      "Member UTxO"
                    );
                    const treasuryUtxos = await fetchTreasuryUtxos();
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
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
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
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
                    const oracleUtxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
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
              {renderUtxoInputs(
                "Counter UTxO",
                counterUtxoHash,
                setCounterUtxoHash,
                counterUtxoIndex,
                setCounterUtxoIndex
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
                    const counterUtxo = await fetchUtxo(
                      counterUtxoHash,
                      counterUtxoIndex,
                      "Counter UTxO"
                    );
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
