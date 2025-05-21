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
  "0f8e16a0898ae2bcb9d5bd2db74cb248a53840b8ce18c4f2314aea63";
export const admin_key_second =
  process.env.ADMIN_KEY ||
  "afb8a51e61565cd663fb9e2a970486d82492260ed86e5d677f7b11b2";
export const admin_key_third =
  process.env.ADMIN_KEY ||
  "afb8a51e61565cd663fb9e2a970486d82492260ed86e5d677f7b11b2";
export const admins = [admin_key_first, admin_key_first];
export const admin_tenure = process.env.ADMIN_TENURE || "TODO";
export const multi_sig_threshold = Number(process.env.MULTI_SIG_THRESHOLD) || 1;

export const oracle_nft = byteString(
  resolveScriptHash(
    new OracleMintBlueprint([
      outputReference(
        "60dcd700473102171b0191a65e135bcd19938a365dffaee70d675ee88d8ce0c0",
        1
      ),
    ]).cbor,
    "V3"
  )
);

export const scripts = {
  oracle: {
    mint: new OracleMintBlueprint([
      outputReference(
        "60dcd700473102171b0191a65e135bcd19938a365dffaee70d675ee88d8ce0c0",
        1
      ),
    ]),
    spend: new OracleSpendBlueprint(),
  },
  counter: {
    mint: new CounterMintBlueprint([
      outputReference(
        "d50f72bca8ca2a8a7046b3ce27a3f24746025d0b9b08fc8b827d8a855777d36a",
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
        "47b7fdaf8f863e4b29d0c09a256f21ab631fe22fb65e7b0ae1322732bf81fb16",
      outputIndex: 0,
    },
    spend: {
      txHash:
        "47b7fdaf8f863e4b29d0c09a256f21ab631fe22fb65e7b0ae1322732bf81fb16",
      outputIndex: 1,
    },
  },
  member: {
    mint: {
      txHash:
        "e7d0bd0b7e9cf56b16afffaae4664e505664441db98a391e70f96774436a74df",
      outputIndex: 0,
    },
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
