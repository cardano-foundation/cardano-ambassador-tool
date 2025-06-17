import Head from "next/head";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import Link from "next/link";
import { useState } from "react";
import Layout from "@/components/Layout";

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

  const handleAction = async (action: string, params: any) => {
    try {
      setLoading(true);
      setError("");
      const address = await wallet.getChangeAddress();
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          wallet,
          address,
          ...params,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Action failed");
      }

      setResult(JSON.stringify(data.result, null, 2));
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
              {renderInputField(
                "Wallet Address",
                walletAddress,
                setwalletAddress
              )}
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
