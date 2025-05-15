// 0 - AppOracle

import {
  conStr0,
  policyId,
  scriptAddress,
  scriptHash,
  list,
  byteString,
  integer,
  verificationKey,
  assetName,
  tuple,
  ByteString,
  Integer,
  stringToHex,
  pairs,
  Pairs,
  pubKeyAddress,
  conStr1,
  conStr2,
} from "@meshsdk/core";
import {
  AddMember,
  AdminRemoveMember,
  AdminSignOffProject,
  ApplyMembership,
  ApproveMember,
  ApproveProposal,
  ApproveSignOff,
  CounterDatum,
  IncrementCount,
  MemberDatum,
  MemberProposeProject,
  MembershipIntentDatum,
  MintProposal,
  MintSignOffApproval,
  OracleDatum,
  ProcessSignOff,
  ProposalDatum,
  ProposeProject,
  RejectMember,
  RejectProposal,
  RemoveMember,
  RotateAdmin,
  StopCounter,
  StopOracle,
  UpdateThreshold,
} from "./bar";
import {
  admin_key_first,
  admin_key_second,
  admin_key_third,
  admin_tenure,
  multi_sig_threshold,
  scripts,
} from "./constant";

// Non blueprint types
// TODO

// 0 - Oracle

export const oracleDatum: OracleDatum = conStr0([
  list([
    verificationKey(admin_key_first),
    verificationKey(admin_key_second),
    verificationKey(admin_key_third),
  ]),
  byteString(admin_tenure),
  integer(multi_sig_threshold),
  policyId(scripts.oracle.mint.hash),
  scriptAddress(scripts.oracle.spend.hash),
  policyId(scripts.counter.mint.hash),
  scriptAddress(scripts.counter.spend.hash),
  policyId(scripts.membershipIntent.mint.hash),
  scriptAddress(scripts.membershipIntent.spend.hash),
  policyId(scripts.member.mint.hash),
  scriptAddress(scripts.member.spend.hash),
  policyId(scripts.proposeIntent.mint.hash),
  scriptAddress(scripts.proposeIntent.spend.hash),
  policyId(scripts.proposal.mint.hash),
  scriptAddress(scripts.proposal.spend.hash),
  policyId(scripts.signOffApproval.mint.hash),
  scriptAddress(scripts.signOffApproval.spend.hash),
  scriptAddress(scripts.treasury.spend.hash),
  scriptHash(scripts.treasury.withdraw.hash),
]);

export const rotateAdmin = (
  new_admins: string[],
  new_admin_tenure: string
): RotateAdmin => {
  const new_admins_verifiaction_keys = new_admins.map((key) => {
    return verificationKey(key);
  });
  return conStr0([
    list(new_admins_verifiaction_keys),
    byteString(new_admin_tenure),
  ]);
};

export const updateThreshold = (new_threshold: number): UpdateThreshold => {
  return conStr1([integer(new_threshold)]);
};

export const stopOracle: StopOracle = conStr2([]);

// 1 - Counter

export const counterDatum = (count: number): CounterDatum => {
  return conStr0([integer(count)]);
};

export const incrementCount: IncrementCount = conStr0([]);

export const stopCounter: StopCounter = conStr1([]);

// 2 - MembershipIntent

export const applyMembership = (
  tokenPolicyId: string,
  tokenAssetName: string
): ApplyMembership => {
  return conStr0([policyId(tokenPolicyId), assetName(tokenAssetName)]);
};

export const approveMember: ApproveMember = conStr1([]);

export const rejectMember: RejectMember = conStr2([]);

export const membershipIntentDatum = (
  tokenPolicyId: string,
  tokenAssetName: string
): MembershipIntentDatum => {
  const token = tuple(policyId(tokenPolicyId), assetName(tokenAssetName));
  return conStr0([token]);
};

// 3 - Member

export const memberDatum = (
  tokenPolicyId: string,
  tokenAssetName: string,
  completion: Map<string, number>,
  fund_received: number
): MemberDatum => {
  const token = tuple(policyId(tokenPolicyId), assetName(tokenAssetName));
  const completionItems: [ByteString, Integer][] = Array.from(
    completion.entries()
  ).map(([key, value]) => [byteString(stringToHex(key)), integer(value)]);

  const completionPluts: Pairs<ByteString, Integer> = pairs<
    ByteString,
    Integer
  >(completionItems);

  return conStr0([token, completionPluts, integer(fund_received)]);
};

export const addMember: AddMember = conStr0([]);

export const removeMember: RemoveMember = conStr1([]);

export const adminRemoveMember: AdminRemoveMember = conStr0([]);

export const memberProposeProject: MemberProposeProject = conStr1([]);

export const adminSignOffProject: AdminSignOffProject = conStr2([]);
// 4 - ProposeIntent

export const proposeProject = (
  project_url: string,
  fund_requested: number,
  receiver: string
): ProposeProject => {
  return conStr0([
    byteString(project_url),
    integer(fund_requested),
    pubKeyAddress(receiver), // TODO: handle script
  ]);
};

export const approveProposal: ApproveProposal = conStr1([]);

export const rejectProposal: RejectProposal = conStr2([]);

export const proposalDatum = (
  project_url: string,
  fund_requested: number,
  receiver: string
): ProposalDatum => {
  return conStr0([
    byteString(project_url),
    integer(fund_requested),
    pubKeyAddress(receiver), // TODO: handle script
  ]);
};

// 5 - Proposal

export const mintProposal: MintProposal = conStr0([]);

export const approveSignOff: ApproveSignOff = conStr1([]);

// 6 - SignOffApproval

export const mintSignOffApproval: MintSignOffApproval = conStr0([]);

export const processSignOff: ProcessSignOff = conStr1([]);
