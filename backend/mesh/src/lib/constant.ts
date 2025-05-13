import { byteString, outputReference } from "@meshsdk/core";
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

export const admin_key_first = process.env.ADMIN_KEY || "TODO";
export const admin_key_second = process.env.ADMIN_KEY || "TODO";
export const admin_key_third = process.env.ADMIN_KEY || "TODO";
export const admin_tenure = process.env.ADMIN_TENURE || "TODO";
export const multi_sig_threshold = 2;

export const oracle_nft = byteString("TODO");

export const scripts = {
  oracle: {
    mint: new OracleMintBlueprint([outputReference("TODO", 0)]),
    spend: new OracleSpendBlueprint(),
  },
  counter: {
    mint: new CounterMintBlueprint([outputReference("TODO", 0)]),
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
