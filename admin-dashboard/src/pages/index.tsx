import Head from "next/head";
import { CardanoWallet, MeshBadge, useWallet } from "@meshsdk/react";

import { useState } from "react";
import { blockfrost, BlockfrostService } from "@/services";
import { SetupUtxos, RefTxInScripts, CATConstants } from "@/lib";
import { SetupTx, AdminActionTx, UserActionTx } from "@/transactions";

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
          "dd0d618c66d168700239ef66e4c4e4ae72fcb4d3054e3a1125b25256dde6ab3c",
        outputIndex: 0,
      },
      counter: {
        txHash:
          "08cd85d71887af9a069bfce4f8337138a20005d0cd554fc34df950a932061c27",
        outputIndex: 0,
      },
    };

    const refTxInScripts: RefTxInScripts = {
      membershipIntent: {
        mint: {
          txHash:
            "01bcb84d158d00a85eeab4f77c705646d1e1791081d9a5df620bb7458e1a71a7",
          outputIndex: 0,
        },
        spend: {
          txHash:
            "a18fe21f5e3f6d6445146a68a8e53c371b53bbf9f362cabb82a4ae9bce1ec835",
          outputIndex: 0,
        },
      },
      member: {
        mint: {
          txHash:
            "f5a79024fa898261a433315b64d0668313e2db0ac796552f2d972f0ee2c9c576",
          outputIndex: 0,
        },
        spend: {
          txHash:
            "f5a79024fa898261a433315b64d0668313e2db0ac796552f2d972f0ee2c9c576",
          outputIndex: 1,
        },
      },
      proposeIntent: {
        mint: {
          txHash:
            "d1d88b9acbba509aff54a73ae68b50bc47210cd7ec31acac8f87b1c193578c87",
          outputIndex: 0,
        },
        spend: {
          txHash:
            "d1d88b9acbba509aff54a73ae68b50bc47210cd7ec31acac8f87b1c193578c87",
          outputIndex: 1,
        },
      },
      proposal: {
        mint: {
          txHash:
            "c51d27506b1f88a48e8d43bd41397c5bdfa89c3c39a3c41c07f828864da3e11b",
          outputIndex: 0,
        },
        spend: {
          txHash:
            "c51d27506b1f88a48e8d43bd41397c5bdfa89c3c39a3c41c07f828864da3e11b",
          outputIndex: 1,
        },
      },
      signOffApproval: {
        mint: {
          txHash:
            "267ac52f3092db0500332871c9ad989b0ba00317ece22e395d066f10ba111d1c",
          outputIndex: 0,
        },
        spend: {
          txHash:
            "267ac52f3092db0500332871c9ad989b0ba00317ece22e395d066f10ba111d1c",
          outputIndex: 1,
        },
      },
      treasury: {
        spend: {
          txHash:
            "c30fc4006f636373b4946c7716ebc32da9cbc50704b1120f2112f8c7c943c463",
          outputIndex: 0,
        },
        withdrawal: {
          txHash:
            "c30fc4006f636373b4946c7716ebc32da9cbc50704b1120f2112f8c7c943c463",
          outputIndex: 1,
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
    "3513a91b7c211ccfce41cbd7e46de8acedb3edec3f6312acb975167da73ae1bf"
  );
  const [oracleUtxoIndex, setOracleUtxoIndex] = useState("0");
  const [tokenUtxoHash, setTokenUtxoHash] = useState(
    "66a3f9a727c7e36491129760dbb0e291c7a3a54436485d93993ffaf85add0671"
  );
  const [tokenUtxoIndex, setTokenUtxoIndex] = useState("1");
  const [memberUtxoHash, setMemberUtxoHash] = useState("");
  const [memberUtxoIndex, setMemberUtxoIndex] = useState("");
  const [counterUtxoHash, setCounterUtxoHash] = useState(
    "66a3f9a727c7e36491129760dbb0e291c7a3a54436485d93993ffaf85add0671"
  );
  const [counterUtxoIndex, setCounterUtxoIndex] = useState("0");
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
    "a65106a37f0b23f0384d19b7102550ecb3591c21d4804a1d35191315",
  ]);
  const [newAdmins, setNewAdmins] = useState<string[]>([]);
  const [newAdminTenure, setNewAdminTenure] = useState("2y");
  const [newMultiSigThreshold, setNewMultiSigThreshold] = useState("1");

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
  const [multiSigThreshold, setMultiSigThreshold] = useState("2");

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
                    const adminAction = await getAdminActionTx();
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
                    const counterUtxo = await fetchUtxo(
                      counterUtxoHash,
                      counterUtxoIndex,
                      "Counter UTxO"
                    );
                    const adminAction = await getAdminActionTx();
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
