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
  stringToBSArray,
  pairs,
  Pairs,
  conStr1,
  conStr2,
  ConStr0,
  List,
  PubKeyAddress,
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
  MembershipIntentDatum,
  MemberUpdateMetadata,
  MintProposal,
  MintSignOffApproval,
  OracleDatum,
  ProcessMembershipIntent,
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
  UpdateMembershipIntentMetadata,
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

export type StatsPlutusData = ConStr0<
  [
    Integer, // topics_entered
    Integer, // posts_read_count
    Integer, // days_visited
    Integer, // likes_given
    Integer, // likes_received
    Integer, // topics_created
    Integer, // replies_created
    Integer, // time_read
    Integer // recent_time_read
  ]
>;

export type TopReplyPlutusData = ConStr0<
  [
    ByteString | List<ByteString>, // title
    ByteString | List<ByteString>, // url
    Integer, // like_count
    ByteString | List<ByteString> // created_at
  ]
>;

export type TopTopicPlutusData = ConStr0<
  [
    ByteString | List<ByteString>, // title
    ByteString | List<ByteString>, // url
    Integer, // reply_count
    Integer, // like_count
    ByteString | List<ByteString> // created_at
  ]
>;

export type ActivityPlutusData = ConStr0<
  [
    ByteString | List<ByteString>, // type
    ByteString | List<ByteString>, // title
    ByteString | List<ByteString>, // url
    ByteString | List<ByteString> // created_at
  ]
>;

export type BadgePlutusData = ConStr0<
  [
    ByteString | List<ByteString>, // name
    ByteString | List<ByteString>, // description
    ByteString | List<ByteString>, // icon
    ByteString | List<ByteString> // granted_at
  ]
>;

export type SummaryPlutusData = ConStr0<
  [StatsPlutusData, List<TopReplyPlutusData>, List<TopTopicPlutusData>]
>;

export type MembershipMetadata = ConStr0<
  [
    PubKeyAddress, // WalletAddress
    ByteString | List<ByteString>, // fullName
    ByteString | List<ByteString>, // displayName
    ByteString | List<ByteString>, // emailAddress
    ByteString | List<ByteString>, // bio
    ByteString | List<ByteString>, // country
    ByteString | List<ByteString>, // city
    ByteString | List<ByteString>, // x_handle
    ByteString | List<ByteString>, // github
    ByteString | List<ByteString>, // discord
    ByteString | List<ByteString>, // spo_id
    ByteString | List<ByteString> // drep_id
  ]
>;

// Helper function to handle strings that might exceed 64 characters
const handleString = (str: string): ByteString | List<ByteString> => {
  const hexStr = stringToHex(str);
  if (str.length > 64) {
    return stringToBSArray(hexStr);
  }
  return byteString(hexStr);
};

// Helper function to convert StatsData to StatsPlutusData
const convertStatsToPlutus = (stats: StatsData): StatsPlutusData => {
  return conStr0([
    integer(stats.topics_entered),
    integer(stats.posts_read_count),
    integer(stats.days_visited),
    integer(stats.likes_given),
    integer(stats.likes_received),
    integer(stats.topics_created),
    integer(stats.replies_created),
    integer(stats.time_read),
    integer(stats.recent_time_read),
  ]);
};

// Helper function to convert TopReplyData to TopReplyPlutusData
const convertTopReplyToPlutus = (reply: TopReplyData): TopReplyPlutusData => {
  return conStr0([
    handleString(reply.title),
    handleString(reply.url),
    integer(reply.like_count),
    handleString(reply.created_at),
  ]);
};

// Helper function to convert TopTopicData to TopTopicPlutusData
const convertTopTopicToPlutus = (topic: TopTopicData): TopTopicPlutusData => {
  return conStr0([
    handleString(topic.title),
    handleString(topic.url),
    integer(topic.reply_count),
    integer(topic.like_count),
    handleString(topic.created_at),
  ]);
};

// Helper function to convert ActivityData to ActivityPlutusData
const convertActivityToPlutus = (
  activity: ActivityData
): ActivityPlutusData => {
  return conStr0([
    handleString(activity.type),
    handleString(activity.title),
    handleString(activity.url),
    handleString(activity.created_at),
  ]);
};

// Helper function to convert BadgeData to BadgePlutusData
const convertBadgeToPlutus = (badge: BadgeData): BadgePlutusData => {
  return conStr0([
    handleString(badge.name),
    handleString(badge.description),
    handleString(badge.icon),
    handleString(badge.granted_at),
  ]);
};

// Helper function to convert SummaryData to SummaryPlutusData
const convertSummaryToPlutus = (summary: SummaryData): SummaryPlutusData => {
  return conStr0([
    convertStatsToPlutus(summary.stats),
    list(summary.top_replies.map(convertTopReplyToPlutus)),
    list(summary.top_topics.map(convertTopTopicToPlutus)),
  ]);
};

export const membershipMetadata = (
  jsonData: MemberData
): MembershipMetadata => {
  return conStr0([
    addrBech32ToPlutusDataObj(jsonData.walletAddress!),
    handleString(jsonData.fullName || ""),
    handleString(jsonData.displayName || ""),
    handleString(jsonData.emailAddress || ""),
    handleString(jsonData.bio || ""),
    handleString(jsonData.country || ""),
    handleString(jsonData.city || ""),
    handleString(jsonData.x_handle || ""),
    handleString(jsonData.github || ""),
    handleString(jsonData.discord || ""),
    handleString(jsonData.spo_id || ""),
    handleString(jsonData.drep_id || ""),
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

export const processMembershipIntent: ProcessMembershipIntent = conStr0([]);

export const updateMembershipIntentMetadata: UpdateMembershipIntentMetadata =
  conStr1([]);

// 3 - Member

export const memberDatum = (
  tokenPolicyId: string,
  tokenAssetName: string,
  completion: Map<ProposalData, number>,
  fundReceived: number,
  metaData: MembershipMetadata
): MemberDatum => {
  const token = tuple(policyId(tokenPolicyId), assetName(tokenAssetName));
  const completionItems: [ProposalMetadata, Integer][] = Array.from(
    completion.entries()
  ).map(([key, value]) => [proposalMetadata(key), integer(value)]);

  const completionPluts: Pairs<ProposalMetadata, Integer> = pairs<
    ProposalMetadata,
    Integer
  >(completionItems);

  return conStr0([token, completionPluts, integer(fundReceived), metaData]);
};

export const addMember: AddMember = conStr0([]);

export const removeMember: RemoveMember = conStr1([]);

export const adminRemoveMember: AdminRemoveMember = conStr0([]);

export const adminSignOffProject: AdminSignOffProject = conStr1([]);

export const memberUpdateMetadata: MemberUpdateMetadata = conStr2([]);

// 4 - ProposeIntent

export type ProposalMetadata = ConStr0<
  [
    ByteString | List<ByteString>, // title
    ByteString | List<ByteString>, // url
    ByteString | List<ByteString>, // fundsRequested
    PubKeyAddress, // receiverWalletAddress
    PubKeyAddress, // submittedByAddress
    ByteString | List<ByteString> // status
  ]
>;

export const proposalMetadata = (jsonData: ProposalData): ProposalMetadata => {
  return conStr0([
    handleString(jsonData.title || ""),
    handleString(jsonData.url || ""),
    handleString(jsonData.fundsRequested || ""),
    addrBech32ToPlutusDataObj(jsonData.receiverWalletAddress),
    addrBech32ToPlutusDataObj(jsonData.submittedByAddress),
    handleString(jsonData.status || ""),
  ]);
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

export type StatsData = {
  topics_entered: number;
  posts_read_count: number;
  days_visited: number;
  likes_given: number;
  likes_received: number;
  topics_created: number;
  replies_created: number;
  time_read: number;
  recent_time_read: number;
};

export type TopReplyData = {
  title: string;
  url: string;
  like_count: number;
  created_at: string;
};

export type TopTopicData = {
  title: string;
  url: string;
  reply_count: number;
  like_count: number;
  created_at: string;
};

export type ActivityData = {
  type: string;
  title: string;
  url: string;
  created_at: string;
};

export type BadgeData = {
  name: string;
  description: string;
  icon: string;
  granted_at: string;
};

export type SummaryData = {
  stats: StatsData;
  top_replies: TopReplyData[];
  top_topics: TopTopicData[];
};

export type MemberData = {
  walletAddress: string;
  fullName: string;
  displayName: string;
  emailAddress: string;
  bio: string;
  country: string;
  city: string;
  x_handle?: string;
  github?: string;
  discord?: string;
  spo_id?: string;
  drep_id?: string;
};

export type Member = {
  token: { policyId: string; assetName: string };
  completion: Map<ProposalData, number>;
  fundReceived: number;
  metadata: MemberData;
};

export type ProposalData = {
  title: string;
  url: string;
  fundsRequested: string;
  receiverWalletAddress: string;
  submittedByAddress: string;
  status: string;
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
