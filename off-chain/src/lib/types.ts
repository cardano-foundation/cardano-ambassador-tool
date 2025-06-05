// 0 - AppOracle

import {
  conStr0,
  policyId,
  scriptAddress,
  scriptHash,
  list,
  byteString,
  integer,
  assetName,
  tuple,
  ByteString,
  Integer,
  stringToHex,
  pairs,
  Pairs,
  conStr1,
  conStr2,
  ConStr0,
  PubKeyAddress,
  pubKeyAddress,
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
  RBurn,
  RejectMember,
  RejectProposal,
  RemoveMember,
  RMint,
  RotateAdmin,
  StopCounter,
  StopOracle,
  UpdateThreshold,
} from "./bar";
import { addrBech32ToPlutusDataObj } from "@meshsdk/core-csl";

// 0 - Oracle
export const rMint: RMint = conStr0([]);

export const rBurn: RBurn = conStr1([]);

export const oracleDatum = (
  admins: string[],
  adminTenure: string,
  multiSigThreshold: number,
  scripts: any
): OracleDatum => {
  return conStr0([
    list(
      admins.map((admin) => {
        return byteString(admin);
      })
    ),
    byteString(stringToHex(adminTenure)),
    integer(multiSigThreshold),
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
};

export const rotateAdmin = (
  newAdmins: string[],
  newAdminsTenure: string
): RotateAdmin => {
  const newAdminsVerificationKeys = newAdmins.map((key) => {
    return byteString(key);
  });
  return conStr0([
    list(newAdminsVerificationKeys),
    byteString(newAdminsTenure),
  ]);
};

export const updateThreshold = (
  newMultiSigThreshold: number
): UpdateThreshold => {
  return conStr1([integer(newMultiSigThreshold)]);
};

export const stopOracle: StopOracle = conStr2([]);

// 1 - Counter

export const counterDatum = (count: number): CounterDatum => {
  return conStr0([integer(count)]);
};

export const incrementCount: IncrementCount = conStr0([]);

export const stopCounter: StopCounter = conStr1([]);

// 2 - MembershipIntent

export type MembershipMetadata = ConStr0<
  [
    PubKeyAddress, // wallet address
    ByteString, // full name
    ByteString, // display name
    ByteString, // email address
    ByteString // bio
  ]
>;

export const membershipMetadata = (
  walletAddress: string,
  fullName: string,
  displayName: string,
  emailAddress: string,
  bio: string
): MembershipMetadata => {
  return conStr0([
    addrBech32ToPlutusDataObj(walletAddress),
    byteString(fullName),
    byteString(displayName),
    byteString(emailAddress),
    byteString(bio),
  ]);
};

export const applyMembership = (
  tokenPolicyId: string,
  tokenAssetName: string,
  metaData: MembershipMetadata
): ApplyMembership => {
  return conStr0([
    policyId(tokenPolicyId),
    assetName(tokenAssetName),
    metaData,
  ]);
};

export const approveMember: ApproveMember = conStr1([]);

export const rejectMember: RejectMember = conStr2([]);

export const membershipIntentDatum = (
  tokenPolicyId: string,
  tokenAssetName: string,
  metaData: MembershipMetadata
): MembershipIntentDatum => {
  const token = tuple(policyId(tokenPolicyId), assetName(tokenAssetName));
  return conStr0([token, metaData]);
};

// 3 - Member

export const memberDatum = (
  tokenPolicyId: string,
  tokenAssetName: string,
  completion: Map<string, number>,
  fundReceived: number,
  metaData: MembershipMetadata
): MemberDatum => {
  const token = tuple(policyId(tokenPolicyId), assetName(tokenAssetName));
  const completionItems: [ByteString, Integer][] = Array.from(
    completion.entries()
  ).map(([key, value]) => [byteString(stringToHex(key)), integer(value)]);

  const completionPluts: Pairs<ByteString, Integer> = pairs<
    ByteString,
    Integer
  >(completionItems);

  return conStr0([token, completionPluts, integer(fundReceived), metaData]);
};

export const addMember: AddMember = conStr0([]);

export const removeMember: RemoveMember = conStr1([]);

export const adminRemoveMember: AdminRemoveMember = conStr0([]);

export const memberProposeProject: MemberProposeProject = conStr1([]);

export const adminSignOffProject: AdminSignOffProject = conStr2([]);
// 4 - ProposeIntent

export type ProposalMetadata = ConStr0<
  [
    ByteString // project details
  ]
>;

export const proposalMetadata = (projectDetails: string): ProposalMetadata => {
  return conStr0([byteString(projectDetails)]);
};

export const proposeProject = (
  fundRequested: number,
  receiver: string,
  member: number,
  metaData: ProposalMetadata
): ProposeProject => {
  return conStr0([
    integer(fundRequested),
    addrBech32ToPlutusDataObj(receiver),
    integer(member),
    metaData,
  ]);
};

export const approveProposal: ApproveProposal = conStr1([]);

export const rejectProposal: RejectProposal = conStr2([]);

export const proposalDatum = (
  fundRequested: number,
  receiver: string,
  member: number,
  metaData: ProposalMetadata
): ProposalDatum => {
  return conStr0([
    integer(fundRequested),
    addrBech32ToPlutusDataObj(receiver),
    integer(member),
    metaData,
  ]);
};

// 5 - Proposal

export const mintProposal: MintProposal = conStr0([]);

export const approveSignOff: ApproveSignOff = conStr1([]);

// 6 - SignOffApproval

export const mintSignOffApproval: MintSignOffApproval = conStr0([]);

export const processSignOff: ProcessSignOff = conStr1([]);

// Non blueprint types
export type MemberData = {
  walletAddress: string;
  fullName: string;
  displayName: string;
  emailAddress: string;
  bio: string;
};

export type Member = {
  token: { policyId: string; assetName: string };
  completion: Map<string, number>;
  fundReceived: number;
  metadata: MemberData;
};

export type ProposalData = {
  projectDetails: string;
};

export type Proposal = {
  fundRequested: number;
  receiver: string;
  member: number;
  metadata: ProposalData;
};

// setup

export type SetupUtxos = {
  oracle: {
    txHash: string;
    outputIndex: number;
  };
  counter: {
    txHash: string;
    outputIndex: number;
  };
};

export type RefTxInScripts = {
  membershipIntent: {
    mint: {
      txHash: string;
      outputIndex: number;
    };
    spend: {
      txHash: string;
      outputIndex: number;
    };
  };
  member: {
    mint: {
      txHash: string;
      outputIndex: number;
    };
    spend: {
      txHash: string;
      outputIndex: number;
    };
  };
  proposeIntent: {
    mint: {
      txHash: string;
      outputIndex: number;
    };
    spend: {
      txHash: string;
      outputIndex: number;
    };
  };
  proposal: {
    mint: {
      txHash: string;
      outputIndex: number;
    };
    spend: {
      txHash: string;
      outputIndex: number;
    };
  };
  signOffApproval: {
    mint: {
      txHash: string;
      outputIndex: number;
    };
    spend: {
      txHash: string;
      outputIndex: number;
    };
  };
  treasury: {
    spend: {
      txHash: string;
      outputIndex: number;
    };
    withdrawal: {
      txHash: string;
      outputIndex: number;
    };
  };
};
