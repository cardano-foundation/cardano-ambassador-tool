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
export const admins = [admin_key_first];
export const admin_tenure = process.env.ADMIN_TENURE || "TODO";
export const multi_sig_threshold = Number(process.env.MULTI_SIG_THRESHOLD) || 1;

export const oracle_nft = byteString(
  resolveScriptHash(
    new OracleMintBlueprint([
      outputReference(
        "42289600a5a9691854d4a47f136af609a3ed57a2e3e80311bad20dfdd39b9a08",
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
        "42289600a5a9691854d4a47f136af609a3ed57a2e3e80311bad20dfdd39b9a08",
        1
      ),
    ]),
    spend: new OracleSpendBlueprint(),
  },
  counter: {
    mint: new CounterMintBlueprint([
      outputReference(
        "9ed7523e896c685cf925ae100df09bd27d476eabc52d86ff6d9581773b5a9084",
        5
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
