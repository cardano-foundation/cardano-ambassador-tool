import { byteString, outputReference, resolveScriptHash } from "@meshsdk/core";
import {
  CounterMintBlueprint,
  CounterSpendBlueprint,
  MemberMintBlueprint,
  MembershipIntentMintBlueprint,
  MembershipIntentSpendBlueprint,
  MemberSpendBlueprint,
  OracleMintBlueprint,
  OracleSpendBlueprint,
  ProposalMintBlueprint,
  ProposalSpendBlueprint,
  ProposeIntentMintBlueprint,
  ProposeIntentSpendBlueprint,
  SignOffApprovalMintBlueprint,
  SignOffApprovalSpendBlueprint,
  TreasurySpendBlueprint,
  TreasuryWithdrawBlueprint,
} from "./bar";
import { SetupUtxos, RefTxInScripts } from "./types";

// export const networkId = (process.env.NETWORK_ID || "0") === "0" ? 0 : 1;
export const policyIdLength = 56; // Assuming the policyId is always 56 characters

// export const admin_key_first =
//   process.env.ADMIN_KEY ||
//   "086cb798b0f694cd5a449296f7de9a794d3cd8593097be5898fd50f9";
// export const admin_key_second =
//   process.env.ADMIN_KEY ||
//   "afb8a51e61565cd663fb9e2a970486d82492260ed86e5d677f7b11b2";
// export const admin_key_third =
//   process.env.ADMIN_KEY ||
//   "afb8a51e61565cd663fb9e2a970486d82492260ed86e5d677f7b11b2";
// export const admins = [admin_key_first, admin_key_second];
// export const admin_tenure = process.env.ADMIN_TENURE || "TODO";
// export const multi_sig_threshold = Number(process.env.MULTI_SIG_THRESHOLD) || 1;

export const setupUtxo: SetupUtxos = {
  oracle: {
    txHash: "",
    outputIndex: 0,
  },
  counter: {
    txHash: "",
    outputIndex: 0,
  },
};

export const scripts = (setupUtxo: SetupUtxos) => {
  const oracleNFT = byteString(
    resolveScriptHash(
      new OracleMintBlueprint([
        outputReference(setupUtxo.oracle.txHash, setupUtxo.oracle.outputIndex),
      ]).cbor,
      "V3"
    )
  );

  return {
    oracle: {
      mint: new OracleMintBlueprint([
        outputReference(setupUtxo.oracle.txHash, setupUtxo.oracle.outputIndex),
      ]),
      spend: new OracleSpendBlueprint(),
    },
    counter: {
      mint: new CounterMintBlueprint([
        outputReference(
          setupUtxo.counter.txHash,
          setupUtxo.counter.outputIndex
        ),
      ]),
      spend: new CounterSpendBlueprint([oracleNFT]),
    },
    membershipIntent: {
      mint: new MembershipIntentMintBlueprint([oracleNFT]),
      spend: new MembershipIntentSpendBlueprint([oracleNFT]),
    },
    member: {
      mint: new MemberMintBlueprint([oracleNFT]),
      spend: new MemberSpendBlueprint([oracleNFT]),
    },
    proposeIntent: {
      mint: new ProposeIntentMintBlueprint([oracleNFT]),
      spend: new ProposeIntentSpendBlueprint([oracleNFT]),
    },
    proposal: {
      mint: new ProposalMintBlueprint([oracleNFT]),
      spend: new ProposalSpendBlueprint([oracleNFT]),
    },
    signOffApproval: {
      mint: new SignOffApprovalMintBlueprint([oracleNFT]),
      spend: new SignOffApprovalSpendBlueprint([oracleNFT]),
    },
    treasury: {
      spend: new TreasurySpendBlueprint([oracleNFT]),
      withdraw: new TreasuryWithdrawBlueprint([oracleNFT]),
    },
  };
};

export const refTxInScripts: RefTxInScripts = {
  membershipIntent: {
    mint: {
      txHash:
        "ebe1909a1f0754b4065afa3b1f5eca6ef669ea613c6802de98a2c99b95362d4d",
      outputIndex: 0,
    },
    spend: {
      txHash:
        "ebe1909a1f0754b4065afa3b1f5eca6ef669ea613c6802de98a2c99b95362d4d",
      outputIndex: 1,
    },
  },
  member: {
    mint: {
      txHash:
        "9617e93dd4b3e75253d16ee90586e08b9f904c396f3a580580da09f820c42d0a",
      outputIndex: 0,
    },
    spend: {
      txHash:
        "9617e93dd4b3e75253d16ee90586e08b9f904c396f3a580580da09f820c42d0a",
      outputIndex: 1,
    },
  },
  proposeIntent: {
    mint: {
      txHash:
        "d476ac0425a1bdc53557bf1b9d52ad5204bc96a5b0a5ebf40a224b43e4e8d400",
      outputIndex: 0,
    },
    spend: {
      txHash:
        "d476ac0425a1bdc53557bf1b9d52ad5204bc96a5b0a5ebf40a224b43e4e8d400",
      outputIndex: 1,
    },
  },
  proposal: {
    mint: {
      txHash:
        "4f210c1f2116c77be28bb9ebd388eaa38517173450275ce2e97de0a45c256f0e",
      outputIndex: 0,
    },
    spend: {
      txHash:
        "4f210c1f2116c77be28bb9ebd388eaa38517173450275ce2e97de0a45c256f0e",
      outputIndex: 1,
    },
  },
  signOffApproval: {
    mint: {
      txHash:
        "1463e3c76637ec6e386d35857a8ed571451c8c7c6c5f3ee108af50ff0aa559b0",
      outputIndex: 0,
    },
    spend: {
      txHash:
        "1463e3c76637ec6e386d35857a8ed571451c8c7c6c5f3ee108af50ff0aa559b0",
      outputIndex: 1,
    },
  },
  treasury: {
    spend: {
      txHash:
        "d551b8f6d9d035436fcce241b3de032c8228c6f5076bd0ffd184c6dbc0ee3802",
      outputIndex: 0,
    },
    withdrawal: {
      txHash:
        "d551b8f6d9d035436fcce241b3de032c8228c6f5076bd0ffd184c6dbc0ee3802",
      outputIndex: 1,
    },
  },
};

export class CATConstants {
  network: "mainnet" | "preprod";

  networkId: number;

  scripts: any;

  refTxInScripts: RefTxInScripts;

  constructor(
    network: "mainnet" | "preprod",
    setupUtxo: SetupUtxos,
    refTxInScripts: RefTxInScripts
  ) {
    this.network = network;
    this.networkId = network === "mainnet" ? 1 : 0;
    this.scripts = scripts(setupUtxo);
    this.refTxInScripts = refTxInScripts;
  }
}
