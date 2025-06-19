import Head from "next/head";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import Link from "next/link";
import { useState } from "react";
import Layout from "@/components/Layout";

import { getProvider } from "@/utils/utils";
import {
  CATConstants,
  MembershipMetadata,
  membershipMetadata,
  ProposalMetadata,
  proposalMetadata,
} from "@/lib";
import { ScriptType, SetupTx, UserActionTx } from "@/transactions";
import { stringToHex } from "@meshsdk/core";

// Environment variables
const ORACLE_TX_HASH =
  process.env.NEXT_PUBLIC_ORACLE_TX_HASH ||
  "5419ad9bb41f9b8d78a1fcfe885e3f45801af848280a1835c0d6b4db295a2553";
const ORACLE_OUTPUT_INDEX = parseInt(
  process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || "0"
);

const blockfrost = getProvider();

const getCatConstants = () => {
  const network =
    (process.env.NEXT_PUBLIC_NETWORK as "mainnet" | "preprod") || "preprod";

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

  return new CATConstants(network, SETUP_UTXO, REF_TX_IN_SCRIPTS);
};

export default function Home() {
  const { connected, wallet } = useWallet();
  const [, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // State for UTxO inputs
  const [tokenUtxoHash, setTokenUtxoHash] = useState("");
  const [tokenUtxoIndex, setTokenUtxoIndex] = useState("");
  const [memberUtxoHash, setMemberUtxoHash] = useState("");
  const [memberUtxoIndex, setMemberUtxoIndex] = useState("");
  const [counterUtxoHash, setCounterUtxoHash] = useState("");
  const [counterUtxoIndex, setCounterUtxoIndex] = useState("");
  const [utxoHash, setUtxoHash] = useState("");
  const [utxoIndex, setUtxoIndex] = useState("");

  // State for other parameters
  const [tokenPolicyId, setTokenPolicyId] = useState("");
  const [tokenAssetName, setTokenAssetName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [fundRequested, setFundRequested] = useState("");
  const [receiver, setReceiver] = useState("");
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [bio, setBio] = useState("");
  const [admins, setAdmins] = useState<string[]>([]);
  const [adminTenure, setAdminTenure] = useState("");
  const [multiSigThreshold, setMultiSigThreshold] = useState("");
  const [walletAddress, setwalletAddress] = useState("");

  // State for new metadata update functions
  const [membershipIntentUtxoHash, setMembershipIntentUtxoHash] = useState("");
  const [membershipIntentUtxoIndex, setMembershipIntentUtxoIndex] = useState("");

  const handleAction = async (action: string, params: any) => {
    try {
      setLoading(true);
      setError("");
      const address = await wallet.getChangeAddress();

      switch (action) {
        case "mintCounterNFT": {
          const utxos = await wallet.getUtxos();
          const paramUtxo = utxos[0]!;
          console.log(paramUtxo);
          const { counterUtxoHash, counterUtxoIndex } = params;
          const counterUtxos = await blockfrost.fetchUTxOs(
            counterUtxoHash,
            parseInt(counterUtxoIndex)
          );
          const counterUtxo = counterUtxos[0];
          if (!counterUtxo) {
            throw new Error("Failed to fetch counter UTxO");
          }
          const setup = new SetupTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
          );
          const result = await setup.mintCounterNFT(counterUtxo);
          setResult(JSON.stringify(result, null, 2));
          break;
        }

        case "mintSpendOracleNFT": {
          const {
            admins,
            adminTenure,
            multiSigThreshold,
            utxoHash,
            utxoIndex,
          } = params;
          const utxos = await blockfrost.fetchUTxOs(
            utxoHash,
            parseInt(utxoIndex)
          );
          const paramUtxo = utxos[0];
          if (!paramUtxo) {
            throw new Error("Failed to fetch UTxO");
          }
          const setup = new SetupTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
          );
          const result = await setup.mintSpendOracleNFT(
            paramUtxo,
            admins,
            adminTenure,
            Number(multiSigThreshold)
          );
          setResult(JSON.stringify(result, null, 2));
          break;
        }

        case "spendCounterNFT": {
          const { counterUtxoHash, counterUtxoIndex } = params;
          const counterUtxos = await blockfrost.fetchUTxOs(
            counterUtxoHash,
            parseInt(counterUtxoIndex)
          );
          const counterUtxo = counterUtxos[0];
          if (!counterUtxo) {
            throw new Error("Failed to fetch counter UTxO");
          }
          const setup = new SetupTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
          );
          const result = await setup.spendCounterNFT(counterUtxo);
          setResult(JSON.stringify(result, null, 2));
          break;
        }

        case "registerAllCerts": {
          const setup = new SetupTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
          );
          const result = await setup.registerAllCerts();
          setResult(JSON.stringify(result, null, 2));
          break;
        }

        case "txOutScript": {
          const { scriptAddress } = params;
          const setup = new SetupTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
          );
          const result = await setup.txOutScript(
            scriptAddress,
            ScriptType.MembershipIntent
          );
          setResult(JSON.stringify(result, null, 2));
          break;
        }

        case "applyMembership": {
          const { tokenUtxoHash, tokenUtxoIndex, ...userData } = params;
          const [oracleUtxos, tokenUtxos] = await Promise.all([
            blockfrost.fetchUTxOs(ORACLE_TX_HASH, ORACLE_OUTPUT_INDEX),
            blockfrost.fetchUTxOs(tokenUtxoHash, parseInt(tokenUtxoIndex)),
          ]);
          const oracleUtxo = oracleUtxos[0];
          const tokenUtxo = tokenUtxos[0];
          if (!oracleUtxo || !tokenUtxo) {
            throw new Error("Failed to fetch required UTxOs");
          }
          const userAction = new UserActionTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
          );

          const metadata: MembershipMetadata = membershipMetadata(
            userData.walletAddress,
            stringToHex(userData.fullName),
            stringToHex(userData.displayName),
            stringToHex(userData.emailAddress),
            stringToHex(userData.bio)
          );

          const result = await userAction.applyMembership(
            oracleUtxo,
            tokenUtxo,
            userData.tokenPolicyId,
            userData.tokenAssetName,
            metadata
          );
          setResult(JSON.stringify(result, null, 2));
          break;
        }

        case "proposeProject": {
          const {
            tokenUtxoHash,
            tokenUtxoIndex,
            memberUtxoHash,
            memberUtxoIndex,
            ...projectData
          } = params;
          const [oracleUtxos, tokenUtxos, memberUtxos] = await Promise.all([
            blockfrost.fetchUTxOs(ORACLE_TX_HASH, ORACLE_OUTPUT_INDEX),
            blockfrost.fetchUTxOs(tokenUtxoHash, parseInt(tokenUtxoIndex)),
            blockfrost.fetchUTxOs(memberUtxoHash, parseInt(memberUtxoIndex)),
          ]);
          const oracleUtxo = oracleUtxos[0];
          const tokenUtxo = tokenUtxos[0];
          const memberUtxo = memberUtxos[0];
          if (!oracleUtxo || !tokenUtxo || !memberUtxo) {
            throw new Error("Failed to fetch required UTxOs");
          }
          const userAction = new UserActionTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
          );

          const metadata: ProposalMetadata = proposalMetadata(
            stringToHex(projectData.projectUrl)
          );

          const result = await userAction.proposeProject(
            oracleUtxo,
            tokenUtxo,
            memberUtxo,
            Number(projectData.fundRequested),
            projectData.receiver,
            metadata
          );
          setResult(JSON.stringify(result, null, 2));
          break;
        }

        case "updateMembershipIntentMetadata": {
          const { tokenUtxoHash, tokenUtxoIndex, membershipIntentUtxoHash, membershipIntentUtxoIndex, ...userData } = params;
          const [oracleUtxos, tokenUtxos, membershipIntentUtxos] = await Promise.all([
            blockfrost.fetchUTxOs(ORACLE_TX_HASH, ORACLE_OUTPUT_INDEX),
            blockfrost.fetchUTxOs(tokenUtxoHash, parseInt(tokenUtxoIndex)),
            blockfrost.fetchUTxOs(membershipIntentUtxoHash, parseInt(membershipIntentUtxoIndex)),
          ]);
          const oracleUtxo = oracleUtxos[0];
          const tokenUtxo = tokenUtxos[0];
          const membershipIntentUtxo = membershipIntentUtxos[0];
          if (!oracleUtxo || !tokenUtxo || !membershipIntentUtxo) {
            throw new Error("Failed to fetch required UTxOs");
          }
          const userAction = new UserActionTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
          );

          const metadata = membershipMetadata(
            userData.walletAddress,
            stringToHex(userData.fullName),
            stringToHex(userData.displayName),
            stringToHex(userData.emailAddress),
            stringToHex(userData.bio)
          );

          const result = await userAction.updateMembershipIntentMetadata(
            oracleUtxo,
            tokenUtxo,
            membershipIntentUtxo,
            metadata
          );
          setResult(JSON.stringify(result, null, 2));
          break;
        }

        case "updateMemberMetadata": {
          const { tokenUtxoHash, tokenUtxoIndex, memberUtxoHash, memberUtxoIndex, ...userData } = params;
          const [oracleUtxos, tokenUtxos, memberUtxos] = await Promise.all([
            blockfrost.fetchUTxOs(ORACLE_TX_HASH, ORACLE_OUTPUT_INDEX),
            blockfrost.fetchUTxOs(tokenUtxoHash, parseInt(tokenUtxoIndex)),
            blockfrost.fetchUTxOs(memberUtxoHash, parseInt(memberUtxoIndex)),
          ]);
          const oracleUtxo = oracleUtxos[0];
          const tokenUtxo = tokenUtxos[0];
          const memberUtxo = memberUtxos[0];
          if (!oracleUtxo || !tokenUtxo || !memberUtxo) {
            throw new Error("Failed to fetch required UTxOs");
          }
          const userAction = new UserActionTx(
            address,
            wallet,
            blockfrost,
            getCatConstants()
          );

          const metadata = membershipMetadata(
            userData.walletAddress,
            stringToHex(userData.fullName),
            stringToHex(userData.displayName),
            stringToHex(userData.emailAddress),
            stringToHex(userData.bio)
          );

          const result = await userAction.updateMemberMetadata(
            oracleUtxo,
            memberUtxo,
            tokenUtxo,
            metadata
          );
          setResult(JSON.stringify(result, null, 2));
          break;
        }

        default:
          throw new Error("Invalid action");
      }
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
                handleAction("mintCounterNFT", {
                  counterUtxoHash,
                  counterUtxoIndex,
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
                "Parameter UTxO",
                utxoHash,
                setUtxoHash,
                utxoIndex,
                setUtxoIndex
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
                  handleAction("mintSpendOracleNFT", {
                    admins,
                    adminTenure,
                    multiSigThreshold,
                    utxoHash,
                    utxoIndex,
                  })
                }
              >
                Mint and Spend Oracle NFT
              </button>
            </div>

            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() =>
                handleAction("spendCounterNFT", {
                  counterUtxoHash,
                  counterUtxoIndex,
                })
              }
            >
              Spend Counter NFT
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() => handleAction("registerAllCerts", {})}
            >
              Register All Certs
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 p-2 rounded"
              onClick={() =>
                handleAction("txOutScript", {
                  scriptAddress: address,
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

        {/* User Action Functions */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">User Action Functions</h3>
          <div className="space-y-4">
            {/* Apply Membership */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Apply Membership</h4>
              {renderUtxoInputs(
                "Token UTxO",
                tokenUtxoHash,
                setTokenUtxoHash,
                tokenUtxoIndex,
                setTokenUtxoIndex
              )}
              {renderInputField("Token Policy ID", tokenPolicyId, setTokenPolicyId)}
              {renderInputField("Token Asset Name", tokenAssetName, setTokenAssetName)}
              {renderInputField("Wallet Address", walletAddress, setwalletAddress)}
              {renderInputField("Full Name", fullName, setFullName)}
              {renderInputField("Display Name", displayName, setDisplayName)}
              {renderInputField("Email Address", emailAddress, setEmailAddress)}
              {renderInputField("Bio", bio, setBio)}
              <button
                className="bg-green-500 hover:bg-green-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction("applyMembership", {
                    tokenUtxoHash,
                    tokenUtxoIndex,
                    tokenPolicyId,
                    tokenAssetName,
                    walletAddress,
                    fullName,
                    displayName,
                    emailAddress,
                    bio,
                  })
                }
              >
                Apply Membership
              </button>
            </div>

            {/* Update Membership Intent Metadata */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Update Membership Intent Metadata</h4>
              {renderUtxoInputs(
                "Token UTxO",
                tokenUtxoHash,
                setTokenUtxoHash,
                tokenUtxoIndex,
                setTokenUtxoIndex
              )}
              {renderUtxoInputs(
                "Membership Intent UTxO",
                membershipIntentUtxoHash,
                setMembershipIntentUtxoHash,
                membershipIntentUtxoIndex,
                setMembershipIntentUtxoIndex
              )}
              {renderInputField("Wallet Address", walletAddress, setwalletAddress)}
              {renderInputField("Full Name", fullName, setFullName)}
              {renderInputField("Display Name", displayName, setDisplayName)}
              {renderInputField("Email Address", emailAddress, setEmailAddress)}
              {renderInputField("Bio", bio, setBio)}
              <button
                className="bg-green-500 hover:bg-green-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction("updateMembershipIntentMetadata", {
                    tokenUtxoHash,
                    tokenUtxoIndex,
                    membershipIntentUtxoHash,
                    membershipIntentUtxoIndex,
                    walletAddress,
                    fullName,
                    displayName,
                    emailAddress,
                    bio,
                  })
                }
              >
                Update Membership Intent Metadata
              </button>
            </div>

            {/* Update Member Metadata */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Update Member Metadata</h4>
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
              {renderInputField("Wallet Address", walletAddress, setwalletAddress)}
              {renderInputField("Full Name", fullName, setFullName)}
              {renderInputField("Display Name", displayName, setDisplayName)}
              {renderInputField("Email Address", emailAddress, setEmailAddress)}
              {renderInputField("Bio", bio, setBio)}
              <button
                className="bg-green-500 hover:bg-green-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction("updateMemberMetadata", {
                    tokenUtxoHash,
                    tokenUtxoIndex,
                    memberUtxoHash,
                    memberUtxoIndex,
                    walletAddress,
                    fullName,
                    displayName,
                    emailAddress,
                    bio,
                  })
                }
              >
                Update Member Metadata
              </button>
            </div>

            {/* Propose Project */}
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="text-lg font-medium mb-2">Propose Project</h4>
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
              {renderInputField("Fund Requested", fundRequested, setFundRequested, "number")}
              {renderInputField("Receiver", receiver, setReceiver)}
              {renderInputField("Project Details", projectUrl, setProjectUrl)}
              <button
                className="bg-green-500 hover:bg-green-600 p-2 rounded w-full"
                onClick={() =>
                  handleAction("proposeProject", {
                    tokenUtxoHash,
                    tokenUtxoIndex,
                    memberUtxoHash,
                    memberUtxoIndex,
                    fundRequested,
                    receiver,
                    projectUrl,
                  })
                }
              >
                Propose Project
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
