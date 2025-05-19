import { byteString, hexToString, outputReference } from "@meshsdk/core";
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
  "afb8a51e61565cd663fb9e2a970486d82492260ed86e5d677f7b11b2";
export const admin_key_second =
  process.env.ADMIN_KEY ||
  "afb8a51e61565cd663fb9e2a970486d82492260ed86e5d677f7b11b2";
export const admin_key_third =
  process.env.ADMIN_KEY ||
  "afb8a51e61565cd663fb9e2a970486d82492260ed86e5d677f7b11b2";
export const admins = [admin_key_first];
export const admin_tenure = process.env.ADMIN_TENURE || "TODO";
export const multi_sig_threshold = Number(process.env.MULTI_SIG_THRESHOLD) || 1;

export const oracle_nft = byteString(hexToString("TODO"));

export const scripts = {
  oracle: {
    mint: new OracleMintBlueprint([
      outputReference(
        "ccdf490c8b7fd1e67f81b59eb98791d910cc785c23498a82ec845540467dc3ba",
        0
      ),
    ]),
    spend: new OracleSpendBlueprint(),
  },
  counter: {
    mint: new CounterMintBlueprint([
      outputReference(
        "ccdf490c8b7fd1e67f81b59eb98791d910cc785c23498a82ec845540467dc3ba",
        0
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
