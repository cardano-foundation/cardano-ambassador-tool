import Head from "next/head";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import Link from "next/link";
import { useState } from "react";
import { blockfrost, BlockfrostService } from "@/services";
import Layout from "@/components/Layout";

import {
  SetupTx,
  AdminActionTx,
  UserActionTx,
  CATConstants,
  RefTxInScripts,
  SetupUtxos,
} from "@sidan-lab/cardano-ambassador-tool";

export default function Home() {
  const { connected, wallet } = useWallet();
  const [, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const blockfrostService = new BlockfrostService();
  const [address, setAddress] = useState<string>("");

  // Helper to get CATConstants instance
  const getCatConstants = () => {
    const network =
      (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "preprod") || "preprod";

    const setupUtxo: SetupUtxos = {
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

    const refTxInScripts: RefTxInScripts = {
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

    return new CATConstants(network, setupUtxo, refTxInScripts);
  };

  const getSetupTx = async () => {
    const setup = new SetupTx(
      await wallet.getChangeAddress(),
      wallet,
      blockfrost,
      getCatConstants()
    );
    return setup;
  };

  const getAdminActionTx = async () => {
    const adminAction = new AdminActionTx(
      await wallet.getChangeAddress(),
      wallet,
      blockfrost,
      getCatConstants()
    );
    return adminAction;
  };

  const getUserActionTx = async () => {
    const userAction = new UserActionTx(
      await wallet.getChangeAddress(),
      wallet,
      blockfrost,
      getCatConstants()
    );
    return userAction;
  };

  // State for UTxO inputs
  const [oracleUtxoHash, setOracleUtxoHash] = useState(
    process.env.NEXT_PUBLIC_ORACLE_TX_HASH ||
      "5419ad9bb41f9b8d78a1fcfe885e3f45801af848280a1835c0d6b4db295a2553"
  );
  const [oracleUtxoIndex, setOracleUtxoIndex] = useState(
    process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || "0"
  );
  const [tokenUtxoHash, setTokenUtxoHash] = useState(
    "99a10613f68981266eca8c748c3b76b8f697edb20ff2898c03f3526e87935bab"
  );
  const [tokenUtxoIndex, setTokenUtxoIndex] = useState("1");
  const [memberUtxoHash, setMemberUtxoHash] = useState(
    "1bd1503b7ad956fb44476c92128684c4880cb886b0cd73f83557d107663558d3"
  );
  const [memberUtxoIndex, setMemberUtxoIndex] = useState("1");
  const [counterUtxoHash, setCounterUtxoHash] = useState(
    "1bd1503b7ad956fb44476c92128684c4880cb886b0cd73f83557d107663558d3"
  );
  const [counterUtxoIndex, setCounterUtxoIndex] = useState("0");
  const [membershipIntentUtxoHash, setMembershipIntentUtxoHash] =
    useState("gg");
  const [membershipIntentUtxoIndex, setMembershipIntentUtxoIndex] =
    useState("0");
  const [proposeIntentUtxoHash, setProposeIntentUtxoHash] = useState(
    "4e9ec5b577104f6926bbd676ea824d8d5dfbdeb9c8a2e470150d594bcc738d36"
  );
  const [proposeIntentUtxoIndex, setProposeIntentUtxoIndex] = useState("0");
  const [proposalUtxoHash, setProposalUtxoHash] = useState(
    "79a30ce5681ce2356003031bcdb397ff793c9d9af2aea9b05b6843aca0156b83"
  );
  const [proposalUtxoIndex, setProposalUtxoIndex] = useState("0");
  const [signOffApprovalUtxoHash, setSignOffApprovalUtxoHash] = useState(
    "5312c84e52604673d90f65db7f58c2de321fcf70cdba61ff0d6ef97448018316"
  );
  const [signOffApprovalUtxoIndex, setSignOffApprovalUtxoIndex] = useState("0");
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

  // const fetchTreasuryUtxos = async () => {
  //   const utxos: UTxO[] = [];
  //   for (const input of treasuryUtxoInputs) {
  //     if (input.hash && input.index) {
  //       try {
  //         const utxo = await fetchUtxo(
  //           input.hash,
  //           input.index,
  //           "Treasury UTxO"
  //         );
  //         utxos.push(utxo);
  //       } catch (error) {
  //         console.error(
  //           `Error fetching UTxO ${input.hash}#${input.index}:`,
  //           error
  //         );
  //         throw error;
  //       }
  //     }
  //   }
  //   return utxos;
  // };

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
  const [tokenPolicyId, setTokenPolicyId] = useState(
    "1c24687602c866101d41aa64e39685ee7092f26af15c5329104141fd"
  );
  const [tokenAssetName, setTokenAssetName] = useState("6d657368");
  const [projectUrl, setProjectUrl] = useState("111");
  const [fundRequested, setFundRequested] = useState("1111111");
  const [receiver, setReceiver] = useState(
    "addr_test1qzn9zp4r0u9j8upcf5vmwyp92rktxkguy82gqjsax5v3x9tpjch2tctwrlw8x5777gukav57r8jaezgmmhq0hp9areuqgpaw9k"
  );
  const [adminSigned, setAdminSigned] = useState<string[]>([
    // "a65106a37f0b23f0384d19b7102550ecb3591c21d4804a1d35191315",
    "1195997a35c4f3f0b0d1edb2c3123a25897d9810e0545f950c61ae1f",
  ]);
  const [newAdmins, setNewAdmins] = useState<string[]>([
    "1195997a35c4f3f0b0d1edb2c3123a25897d9810e0545f950c61ae1f",
    "a65106a37f0b23f0384d19b7102550ecb3591c21d4804a1d35191315",
    "b5ea75ba2eac9a884ba7c47110ab7f94f9c0306636e4df01f338920f",
  ]);
  const [newAdminTenure, setNewAdminTenure] = useState("2y");
  const [newMultiSigThreshold, setNewMultiSigThreshold] = useState("2");

  // Add new state variables for user info
  const [fullName, setFullName] = useState("abcf");
  const [displayName, setDisplayName] = useState("abcd");
  const [emailAddress, setEmailAddress] = useState("abce");
  const [bio, setBio] = useState("abcb");

  // Add new state variables for admin setup
  const [admins, setAdmins] = useState<string[]>([
    "a65106a37f0b23f0384d19b7102550ecb3591c21d4804a1d35191315",
    "1195997a35c4f3f0b0d1edb2c3123a25897d9810e0545f950c61ae1f",
    "b5ea75ba2eac9a884ba7c47110ab7f94f9c0306636e4df01f338920f",
  ]);
  const [adminTenure, setAdminTenure] = useState("1y");
  const [multiSigThreshold, setMultiSigThreshold] = useState("1");

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
    type: string = "text",
    placeholder?: string
  ) => (
    <div className="mb-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
                  const setup = await getSetupTx();
                  const utxo = await fetchUtxo(
                    counterUtxoHash,
                    counterUtxoIndex,
                    "Counter UTxO"
                  );
                  return await setup.mintCounterNFT(utxo);
                })
              }
            >
              Mint Counter NFT
            </button>

            {/* Add Counter UTxO input fields */}
            <div className="col-span-2 bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">
                Counter UTxO for Minting
              </h4>
              {renderUtxoInputs(
                "Counter UTxO",
                counterUtxoHash,
                setCounterUtxoHash,
                counterUtxoIndex,
                setCounterUtxoIndex
              )}
            </div>

            {/* Add new Mint and Spend Oracle NFT section */}
            <div className="col-span-2 bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">
                Mint and Spend Oracle NFT
              </h4>
              {renderUtxoInputs(
                "Oracle UTxO",
                oracleUtxoHash,
                setOracleUtxoHash,
                oracleUtxoIndex,
                setOracleUtxoIndex
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Admin Addresses
                </label>
                <textarea
                  value={admins.join("\n")}
                  onChange={(e) => setAdmins(e.target.value.split("\n"))}
                  placeholder="Enter admin addresses (one per line)"
                  className="w-full p-2 rounded bg-gray-700 text-white mb-2"
                  rows={3}
                />
              </div>
              {renderInputField(
                "Admin Tenure",
                adminTenure,
                setAdminTenure,
                "text",
                "e.g., 1y, 6m, 365d"
              )}
              {renderInputField(
                "Multi-sig Threshold",
                multiSigThreshold,
                setMultiSigThreshold,
                "number",
                "Minimum number of admin signatures required"
              )}
              <button
                className="bg-blue-500 hover:bg-blue-600 p-2 rounded w-full mt-4"
                onClick={() =>
                  handleAction(async () => {
                    const setup = await getSetupTx();
                    const utxo = await fetchUtxo(
                      oracleUtxoHash,
                      oracleUtxoIndex,
                      "Oracle UTxO"
                    );
                    return await setup.mintSpendOracleNFT(
                      utxo,
                      admins,
                      adminTenure,
                      Number(multiSigThreshold)
                    );
                  })
                }
              >
                Mint and Spend Oracle NFT
              </button>
            </div>

            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() =>
                handleAction(async () => {
                  const setup = await getSetupTx();
                  const utxo = await fetchUtxo(
                    counterUtxoHash,
                    counterUtxoIndex,
                    "Counter UTxO"
                  );
                  return await setup.spendCounterNFT(utxo);
                })
              }
            >
              Spend Counter NFT
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() =>
                handleAction(async () => {
                  const setup = await getSetupTx();
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
                  const setup = await getSetupTx();
                  return await setup.txOutScript(
                    "addr_test1qqyxeduckrmffn26gjffda77nfu560xctycf00jcnr74p7vdx9gcw644ygkqgqcfm5nlrecqv0rzp0qcyw55q3lxcpkq093wet"
                  );
                })
              }
            >
              Tx Out Scripts
            </button>

            {/* Add Address input field for Tx Out Scripts */}
            <div className="col-span-2 bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">
                Tx Out Scripts Address
              </h4>
              {renderInputField(
                "Address",
                address,
                setAddress,
                "text",
                "Enter address for Tx Out Scripts"
              )}
            </div>
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
                    const adminAction = await getAdminActionTx();
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
                    const adminAction = await getAdminActionTx();
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
              {renderInputField("Full Name", fullName, setFullName)}
              {renderInputField("Display Name", displayName, setDisplayName)}
              {renderInputField("Email Address", emailAddress, setEmailAddress)}
              {renderInputField("Bio", bio, setBio)}
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
                    const userAction = await getUserActionTx();
                    return await userAction.applyMembership(
                      oracleUtxo,
                      tokenUtxo,
                      tokenPolicyId,
                      tokenAssetName,
                      await wallet.getChangeAddress(),
                      fullName,
                      displayName,
                      emailAddress,
                      bio
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
              {renderInputField(
                "Fund Requested",
                fundRequested,
                setFundRequested,
                "number"
              )}
              {renderInputField("Receiver", receiver, setReceiver)}
              {renderInputField("Project Details", projectUrl, setProjectUrl)}
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
                    const userAction = await getUserActionTx();
                    return await userAction.proposeProject(
                      oracleUtxo,
                      tokenUtxo,
                      memberUtxo,
                      Number(fundRequested),
                      receiver,
                      projectUrl
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
                    const adminAction = await getAdminActionTx();
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
                    const adminAction = await getAdminActionTx();
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
                    const adminAction = await getAdminActionTx();
                    return await adminAction.removeMember(
                      oracleUtxo,
                      memberUtxo
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
                    const adminAction = await getAdminActionTx();
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
                    const adminAction = await getAdminActionTx();
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
                    const adminAction = await getAdminActionTx();
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
                    // const treasuryUtxos = await fetchTreasuryUtxos();
                    const adminAction = await getAdminActionTx();
                    return await adminAction.SignOff(
                      oracleUtxo,
                      signOffApprovalUtxo,
                      memberUtxo
                      // treasuryUtxos
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
                    const adminAction = await getAdminActionTx();
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
                    const adminAction = await getAdminActionTx();
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
                    const adminAction = await getAdminActionTx();
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
                    const adminAction = await getAdminActionTx();
                    return await adminAction.stopCounter(
                      oracleUtxo,
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
    <Layout>
      <Head>
        <title>Cardano Ambassador Tool</title>
        <meta name="description" content="A Cardano dApp powered by Mesh" />
      </Head>

      <div className="flex flex-col items-center justify-center">
        <div className="mb-8">
          <CardanoWallet />
        </div>

        {/* Add navigation */}
        <nav className="mb-8">
          <ul className="flex space-x-4">
            <li>
              <Link
                href="/admin"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Admin Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        {renderTestButtons()}
      </div>
    </Layout>
  );
}
