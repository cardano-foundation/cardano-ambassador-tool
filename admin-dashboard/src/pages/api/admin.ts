import { NextApiRequest, NextApiResponse } from "next";
import { BlockfrostProvider } from "@meshsdk/core";
import { deserializeAddress, MeshWallet } from "@meshsdk/core";
import {
  AdminActionTx,
  CATConstants,
} from "@sidan-lab/cardano-ambassador-tool";

// Environment variables (server-side only)
const ADMIN_MNEMONIC_1 = process.env.ADMIN_MNEMONIC_1 || "";
const ADMIN_MNEMONIC_2 = process.env.ADMIN_MNEMONIC_2 || "";
const ADMIN_MNEMONIC_3 = process.env.ADMIN_MNEMONIC_3 || "";
const ORACLE_TX_HASH =
  process.env.NEXT_PUBLIC_ORACLE_TX_HASH ||
  "5419ad9bb41f9b8d78a1fcfe885e3f45801af848280a1835c0d6b4db295a2553";
const ORACLE_OUTPUT_INDEX = parseInt(
  process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || "0"
);

const blockfrost = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY_PREPROD || ""
);

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
  const network = (process.env.NETWORK as "mainnet" | "preprod") || "preprod";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, ...params } = req.body;

    switch (action) {
      case "approveMember": {
        const { membershipIntentUtxo, counterUtxoHash, counterUtxoIndex } =
          params;

        // Initialize wallets
        const admin1 = getWallet(ADMIN_MNEMONIC_1);
        const admin2 = getWallet(ADMIN_MNEMONIC_2);
        const admin3 = getWallet(ADMIN_MNEMONIC_3);

        // Get admin public key hashes
        const addr1 = await admin1.getChangeAddress();
        const pkh1 = deserializeAddress(addr1).pubKeyHash;
        const addr2 = await admin2.getChangeAddress();
        const pkh2 = deserializeAddress(addr2).pubKeyHash;
        const addr3 = await admin3.getChangeAddress();
        const pkh3 = deserializeAddress(addr3).pubKeyHash;
        const adminsPkh = [pkh1, pkh2, pkh3];

        // Fetch required UTXOs
        const [oracleUtxos, counterUtxos] = await Promise.all([
          blockfrost.fetchUTxOs(ORACLE_TX_HASH, ORACLE_OUTPUT_INDEX),
          blockfrost.fetchUTxOs(counterUtxoHash, parseInt(counterUtxoIndex)),
        ]);
        const oracleUtxo = oracleUtxos[0];
        const counterUtxo = counterUtxos[0];

        if (!oracleUtxo || !counterUtxo) {
          throw new Error("Failed to fetch required UTxOs");
        }

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
        const result = await admin2.submitTx(allSignedTx);

        return res.status(200).json({ result });
      }
      // ... rest of the switch cases ...
    }
  } catch (error) {
    console.error("Admin API Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
