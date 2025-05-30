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

export const minUtxos = {
  oracle: "6000000",
  counter: "1500000",
  script: "50000000",
  applyMembership: "1500000",
  member: "1500000",
  proposeIntent: "1500000",
  proposal: "1500000",
  signOffApproval: "1500000",
};

export const networkId = (process.env.NETWORK_ID || "0") === "0" ? 0 : 1;
export const policyIdLength = 56; // Assuming the policyId is always 56 characters

export const admin_key_first =
  process.env.ADMIN_KEY ||
  "086cb798b0f694cd5a449296f7de9a794d3cd8593097be5898fd50f9";
export const admin_key_second =
  process.env.ADMIN_KEY ||
  "afb8a51e61565cd663fb9e2a970486d82492260ed86e5d677f7b11b2";
export const admin_key_third =
  process.env.ADMIN_KEY ||
  "afb8a51e61565cd663fb9e2a970486d82492260ed86e5d677f7b11b2";
export const admins = [admin_key_first, admin_key_second];
export const admin_tenure = process.env.ADMIN_TENURE || "TODO";
export const multi_sig_threshold = Number(process.env.MULTI_SIG_THRESHOLD) || 1;

export const oracle_nft = byteString(
  resolveScriptHash(
    new OracleMintBlueprint([
      outputReference(
        "079ae9a3549a84770917fbc3aedab8c85b23f07c1a34b715496edcf35a9f346d",
        2
      ),
    ]).cbor,
    "V3"
  )
);

export const scripts = {
  oracle: {
    mint: new OracleMintBlueprint([
      outputReference(
        "079ae9a3549a84770917fbc3aedab8c85b23f07c1a34b715496edcf35a9f346d",
        2
      ),
    ]),
    spend: new OracleSpendBlueprint(),
  },
  counter: {
    mint: new CounterMintBlueprint([
      outputReference(
        "079ae9a3549a84770917fbc3aedab8c85b23f07c1a34b715496edcf35a9f346d",
        1
      ),
    ]),
    spend: new CounterSpendBlueprint([oracle_nft]),
  },
  membershipIntent: {
    mint: new MembershipIntentMintBlueprint([oracle_nft]),
    spend: new MembershipIntentSpendBlueprint([oracle_nft]),
  },
  member: {
    mint: new MemberMintBlueprint([oracle_nft]),
    spend: new MemberSpendBlueprint([oracle_nft]),
  },
  proposeIntent: {
    mint: new ProposeIntentMintBlueprint([oracle_nft]),
    spend: new ProposeIntentSpendBlueprint([oracle_nft]),
  },
  proposal: {
    mint: new ProposalMintBlueprint([oracle_nft]),
    spend: new ProposalSpendBlueprint([oracle_nft]),
  },
  signOffApproval: {
    mint: new SignOffApprovalMintBlueprint([oracle_nft]),
    spend: new SignOffApprovalSpendBlueprint([oracle_nft]),
  },
  treasury: {
    spend: new TreasurySpendBlueprint([oracle_nft]),
    withdraw: new TreasuryWithdrawBlueprint([oracle_nft]),
  },
};

export const ref_tx_in_scripts = {
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
