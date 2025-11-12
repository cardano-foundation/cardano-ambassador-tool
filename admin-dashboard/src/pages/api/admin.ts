import { NextApiRequest, NextApiResponse } from "next";
import { BlockfrostProvider } from "@meshsdk/core";
import { deserializeAddress, MeshWallet } from "@meshsdk/core";
import {
  CATConstants,
  AdminActionTx,
} from "@sidan-lab/cardano-ambassador-tool";

// Environment variables (server-side only)
const ADMIN_MNEMONIC_1 = process.env.ADMIN_MNEMONIC_1 || "";
const ADMIN_MNEMONIC_2 = process.env.ADMIN_MNEMONIC_2 || "";
const ADMIN_MNEMONIC_3 = process.env.ADMIN_MNEMONIC_3 || "";
const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
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

const getAdminWalletsAndPkh = async () => {
  const admin1 = getWallet(ADMIN_MNEMONIC_1);
  const admin2 = getWallet(ADMIN_MNEMONIC_2);
  const admin3 = getWallet(ADMIN_MNEMONIC_3);
  const addr1 = await admin1.getChangeAddress();
  const pkh1 = deserializeAddress(addr1).pubKeyHash;
  const addr2 = await admin2.getChangeAddress();
  const pkh2 = deserializeAddress(addr2).pubKeyHash;
  const addr3 = await admin3.getChangeAddress();
  const pkh3 = deserializeAddress(addr3).pubKeyHash;
  const adminsPkh = [pkh1];
  return { admin1, admin2, admin3, adminsPkh };
};

const getOracleUtxo = async () => {
  const oracleUtxos = await blockfrost.fetchUTxOs(
    ORACLE_TX_HASH,
    ORACLE_OUTPUT_INDEX
  );
  return oracleUtxos[0];
};

const multiSignAndSubmit = async (
  unsignedTx: any, // Could be more specific if you have a type for unsignedTx
  admin1: MeshWallet,
  admin2: MeshWallet,
  admin3: MeshWallet
) => {
  const admin1SignedTx = await admin1.signTx(unsignedTx.txHex);

  // Submit transaction
  return await admin1.submitTx(admin1SignedTx);
};

const getCatConstants = () => {
  const network = (process.env.NETWORK as "mainnet" | "preprod") || "preprod";

  const SETUP_UTXO = {
    oracle: {
      txHash: process.env.NEXT_PUBLIC_ORACLE_SETUP_TX_HASH!,
      outputIndex: parseInt(process.env.NEXT_PUBLIC_ORACLE_SETUP_OUTPUT_INDEX!),
    },
    counter: {
      txHash: process.env.NEXT_PUBLIC_COUNTER_SETUP_TX_HASH!,
      outputIndex: parseInt(
        process.env.NEXT_PUBLIC_COUNTER_SETUP_OUTPUT_INDEX!
      ),
    },
  };

  // Reference Transaction Scripts
  const REF_TX_IN_SCRIPTS = {
    membershipIntent: {
      mint: {
        txHash: process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_OUTPUT_INDEX || "0"
        ),
      },
      spend: {
        txHash: process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_OUTPUT_INDEX || "1"
        ),
      },
    },
    member: {
      mint: {
        txHash: process.env.NEXT_PUBLIC_MEMBER_MINT_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_MEMBER_MINT_OUTPUT_INDEX || "0"
        ),
      },
      spend: {
        txHash: process.env.NEXT_PUBLIC_MEMBER_SPEND_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_MEMBER_SPEND_OUTPUT_INDEX || "1"
        ),
      },
    },
    proposeIntent: {
      mint: {
        txHash: process.env.NEXT_PUBLIC_PROPOSE_INTENT_MINT_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_PROPOSE_INTENT_MINT_OUTPUT_INDEX || "0"
        ),
      },
      spend: {
        txHash: process.env.NEXT_PUBLIC_PROPOSE_INTENT_SPEND_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_PROPOSE_INTENT_SPEND_OUTPUT_INDEX || "1"
        ),
      },
    },
    proposal: {
      mint: {
        txHash: process.env.NEXT_PUBLIC_PROPOSAL_MINT_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_PROPOSAL_MINT_OUTPUT_INDEX || "0"
        ),
      },
      spend: {
        txHash: process.env.NEXT_PUBLIC_PROPOSAL_SPEND_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_PROPOSAL_SPEND_OUTPUT_INDEX || "1"
        ),
      },
    },
    signOffApproval: {
      mint: {
        txHash: process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_OUTPUT_INDEX || "0"
        ),
      },
      spend: {
        txHash: process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_OUTPUT_INDEX || "1"
        ),
      },
    },
    treasury: {
      spend: {
        txHash: process.env.NEXT_PUBLIC_TREASURY_SPEND_TX_HASH!,
        outputIndex: parseInt(
          process.env.NEXT_PUBLIC_TREASURY_SPEND_OUTPUT_INDEX || "0"
        ),
      },
      withdrawal: {
        txHash: process.env.NEXT_PUBLIC_TREASURY_WITHDRAWAL_TX_HASH!,
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
        const { admin1, admin2, admin3, adminsPkh } =
          await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        const counterUtxos = await blockfrost.fetchUTxOs(
          counterUtxoHash,
          parseInt(counterUtxoIndex)
        );
        const counterUtxo = counterUtxos[0];
        if (!oracleUtxo || !counterUtxo) {
          throw new Error("Failed to fetch required UTxOs");
        }
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
        if (!unsignedTx) throw new Error("Failed to create transaction");
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3
        );
        return res.status(200).json({ result });
      }
      case "approveProposal": {
        const { proposeIntentUtxo } = params;
        const { admin1, admin2, admin3, adminsPkh } =
          await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error("Failed to fetch required UTxOs");
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants()
        );
        const unsignedTx = await adminAction.approveProposal(
          oracleUtxo,
          proposeIntentUtxo,
          adminsPkh
        );
        if (!unsignedTx) throw new Error("Failed to create transaction");
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3
        );
        return res.status(200).json({ result });
      }
      case "rejectProposal": {
        const { proposeIntentUtxo } = params;
        const { admin1, admin2, admin3, adminsPkh } =
          await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error("Failed to fetch required UTxOs");
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants()
        );
        const unsignedTx = await adminAction.rejectProposal(
          oracleUtxo,
          proposeIntentUtxo,
          adminsPkh
        );
        if (!unsignedTx) throw new Error("Failed to create transaction");
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3
        );
        return res.status(200).json({ result });
      }
      case "approveSignOff": {
        const { proposalUtxo } = params;
        const { admin1, admin2, admin3, adminsPkh } =
          await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error("Failed to fetch required UTxOs");
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants()
        );
        const unsignedTx = await adminAction.approveSignOff(
          oracleUtxo,
          proposalUtxo,
          adminsPkh
        );
        if (!unsignedTx) throw new Error("Failed to create transaction");
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3
        );
        return res.status(200).json({ result });
      }
      case "SignOff": {
        console.log(getCatConstants().scripts.treasury.spend.address);

        const { signOffApprovalUtxo, memberUtxo } = params;
        const { admin1, admin2, admin3 } = await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error("Failed to fetch required UTxOs");
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants()
        );
        const unsignedTx = await adminAction.SignOff(
          oracleUtxo,
          signOffApprovalUtxo,
          memberUtxo
        );
        if (!unsignedTx) throw new Error("Failed to create transaction");
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3
        );
        return res.status(200).json({ result });
      }
      case "removeMember": {
        const { memberUtxo } = params;
        const { admin1, admin2, admin3 } = await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error("Failed to fetch required UTxOs");
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants()
        );
        const unsignedTx = await adminAction.removeMember(
          oracleUtxo,
          memberUtxo
        );
        if (!unsignedTx) throw new Error("Failed to create transaction");
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3
        );
        return res.status(200).json({ result });
      }
      // ... other cases ...
    }
  } catch (error) {
    console.error("Admin API Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
