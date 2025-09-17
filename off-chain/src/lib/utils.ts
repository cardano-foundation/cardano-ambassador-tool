import {
  Asset,
  byteString,
  conStr0,
  deserializeDatum,
  hexToString,
  integer,
  list,
  serializeAddressObj,
  serializeData,
  stringToHex,
  UTxO,
  plutusBSArrayToString,
  List,
} from "@meshsdk/core";
import {
  OracleDatum,
  CounterDatum,
  MembershipIntentDatum,
  MemberDatum,
  ProposalDatum,
} from "./bar";
import { policyIdLength } from "./constant";
import {
  ActivityData,
  ActivityPlutusData,
  BadgeData,
  BadgePlutusData,
  Member,
  MemberData,
  MembershipMetadata,
  Proposal,
  ProposalData,
  ProposalMetadata,
  StatsData,
  StatsPlutusData,
  SummaryData,
  SummaryPlutusData,
  TopReplyData,
  TopReplyPlutusData,
  TopTopicData,
  TopTopicPlutusData,
  memberDatum,
  membershipMetadata,
} from "./types";
import { blake2b } from "blakejs";

/**
 *
 * @param utxo
 * @param policyId
 * @returns assetName in hex
 */
export const getTokenAssetNameByPolicyId = (
  utxo: UTxO,
  policyId: string
): string => {
  for (const { unit } of utxo.output.amount) {
    const currentPolicyId = unit.slice(0, policyIdLength);
    const assetName = unit.slice(policyIdLength);

    if (currentPolicyId === policyId) {
      return assetName;
    }
  }
  return "";
};

/**
 *
 * @param oracleUtxo
 * @returns A list of pubKeyHash of admins
 */
export const getOracleAdmins = (oracleUtxo: UTxO): string[] => {
  const plutusData = oracleUtxo.output.plutusData!;
  const datum: OracleDatum = deserializeDatum(plutusData);

  const admins: string[] = datum.fields[0].list.map((item) => {
    return item.bytes;
  });

  return admins;
};

/**
 *
 * @param oracleUtxo
 * @param newAdmins A list of pubKeyHash of the new admins
 * @param newAdminsTenure
 * @param newMultiSigThreshold
 * @returns
 */
export const updateOracleDatum = (
  oracleUtxo: UTxO,
  newAdmins: string[] | null,
  newAdminsTenure: string | null,
  newMultiSigThreshold: number | null
): OracleDatum => {
  const plutusData = oracleUtxo.output.plutusData!;
  const datum: OracleDatum = deserializeDatum(plutusData);

  const updatedOracleDatum: OracleDatum = conStr0([
    newAdmins
      ? list(
          newAdmins.map((admin) => {
            return byteString(admin);
          })
        )
      : datum.fields[0],
    newAdminsTenure
      ? byteString(hexToString(newAdminsTenure))
      : datum.fields[1],
    newMultiSigThreshold ? integer(newMultiSigThreshold) : datum.fields[2],
    datum.fields[3],
    datum.fields[4],
    datum.fields[5],
    datum.fields[6],
    datum.fields[7],
    datum.fields[8],
    datum.fields[9],
    datum.fields[10],
    datum.fields[11],
    datum.fields[12],
    datum.fields[13],
    datum.fields[14],
    datum.fields[15],
    datum.fields[16],
    datum.fields[17],
    datum.fields[18],
  ]);

  return updatedOracleDatum;
};

export const getCounterDatum = (counterUtxo: UTxO): number => {
  const plutusData = counterUtxo.output.plutusData!;
  const datum: CounterDatum = deserializeDatum(plutusData);

  const count = Number(datum.fields[0].int);

  return count;
};

// Helper function to safely extract string from ByteString | List<ByteString>
const extractString = (field: any): string => {
  if (field.list) {
    return plutusBSArrayToString(field);
  }
  return hexToString(field.bytes);
};

const extractStats = (field: StatsPlutusData): StatsData => {
  return {
    topics_entered: Number(field.fields[0].int),
    posts_read_count: Number(field.fields[1].int),
    days_visited: Number(field.fields[2].int),
    likes_given: Number(field.fields[3].int),
    likes_received: Number(field.fields[4].int),
    topics_created: Number(field.fields[5].int),
    replies_created: Number(field.fields[6].int),
    time_read: Number(field.fields[7].int),
    recent_time_read: Number(field.fields[8].int),
  };
};

const extractTopReplies = (field: List<TopReplyPlutusData>): TopReplyData[] => {
  return field.list.map((item: TopReplyPlutusData) => ({
    title: extractString(item.fields[0]),
    url: extractString(item.fields[1]),
    like_count: Number(item.fields[2].int),
    created_at: extractString(item.fields[3]),
  }));
};

const extractTopTopics = (field: List<TopTopicPlutusData>): TopTopicData[] => {
  return field.list.map((item: TopTopicPlutusData) => ({
    title: extractString(item.fields[0]),
    url: extractString(item.fields[1]),
    reply_count: Number(item.fields[2].int),
    like_count: Number(item.fields[3].int),
    created_at: extractString(item.fields[4]),
  }));
};

const extractSummary = (field: SummaryPlutusData): SummaryData => {
  return {
    stats: extractStats(field.fields[0]),
    top_replies: extractTopReplies(field.fields[1]),
    top_topics: extractTopTopics(field.fields[2]),
  };
};

const extractActivities = (field: List<ActivityPlutusData>): ActivityData[] => {
  return field.list.map((item: ActivityPlutusData) => ({
    type: extractString(item.fields[0]),
    title: extractString(item.fields[1]),
    url: extractString(item.fields[2]),
    created_at: extractString(item.fields[3]),
  }));
};

const extractBadges = (field: List<BadgePlutusData>): BadgeData[] => {
  return field.list.map((item: BadgePlutusData) => ({
    name: extractString(item.fields[0]),
    description: extractString(item.fields[1]),
    icon: extractString(item.fields[2]),
    granted_at: extractString(item.fields[3]),
  }));
};

export const getMembershipIntentDatum = (
  membershipIntentUtxo: UTxO
): { policyId: string; assetName: string; metadata: MemberData } => {
  const plutusData = membershipIntentUtxo.output.plutusData!;
  const datum: MembershipIntentDatum = deserializeDatum(plutusData);

  const policyId = datum.fields[0].list[0].bytes;
  const assetName = datum.fields[0].list[1].bytes;
  const metadataPluts: MembershipMetadata = datum.fields[1];

  // Helper function to safely extract string from ByteString | List<ByteString>
  const extractString = (field: any): string => {
    if (field.list) {
      return plutusBSArrayToString(field);
    }
    return hexToString(field.bytes);
  };

  const metadata: MemberData = {
    href: extractString(metadataPluts.fields[0]),
    forum_username: extractString(metadataPluts.fields[1]),
    email: extractString(metadataPluts.fields[2]),
    address: extractString(metadataPluts.fields[3]),
    name: extractString(metadataPluts.fields[4]),
    bio_excerpt: extractString(metadataPluts.fields[5]),
    bio: extractString(metadataPluts.fields[6]),
    country: extractString(metadataPluts.fields[7]),
    city: extractString(metadataPluts.fields[8]),
    flag: extractString(metadataPluts.fields[9]),
    avatar: extractString(metadataPluts.fields[10]),
    created_at: extractString(metadataPluts.fields[11]),
    summary: extractSummary(metadataPluts.fields[12]),
    activities: extractActivities(metadataPluts.fields[13]),
    badges: extractBadges(metadataPluts.fields[14]),
  };
  return { policyId, assetName, metadata };
};

export const getMemberDatum = (memberUtxo: UTxO): Member => {
  const plutusData = memberUtxo.output.plutusData!;
  const datum: MemberDatum = deserializeDatum(plutusData);
  const metadataPluts: MembershipMetadata = datum.fields[3];

  const metadata: MemberData = {
    href: extractString(metadataPluts.fields[0]),
    forum_username: extractString(metadataPluts.fields[1]),
    email: extractString(metadataPluts.fields[2]),
    address: extractString(metadataPluts.fields[3]),
    name: extractString(metadataPluts.fields[4]),
    bio_excerpt: extractString(metadataPluts.fields[5]),
    bio: extractString(metadataPluts.fields[6]),
    country: extractString(metadataPluts.fields[7]),
    city: extractString(metadataPluts.fields[8]),
    flag: extractString(metadataPluts.fields[9]),
    avatar: extractString(metadataPluts.fields[10]),
    created_at: extractString(metadataPluts.fields[11]),
    summary: extractSummary(metadataPluts.fields[12]),
    activities: extractActivities(metadataPluts.fields[13]),
    badges: extractBadges(metadataPluts.fields[14]),
  };

  const policyId = datum.fields[0].list[0].bytes;
  const assetName = datum.fields[0].list[1].bytes;

  const completion: Map<ProposalData, number> = new Map();
  datum.fields[1].map.forEach((item) => {
    completion.set(
      {
        projectDetails: hexToString(item.k.fields[0].bytes),
      },
      Number(item.v.int)
    );
  });

  const fundReceived = Number(datum.fields[2].int);

  return {
    token: { policyId, assetName },
    completion,
    fundReceived,
    metadata,
  };
};

export const updateMemberDatum = (
  memberUtxo: UTxO,
  signOffApprovalUtxo: UTxO
): MemberDatum => {
  const member: Member = getMemberDatum(memberUtxo);
  const signOffApproval: Proposal = getProposalDatum(signOffApprovalUtxo);

  const updatedCompletions: Map<ProposalData, number> = new Map();
  member.completion.forEach((v, k) => {
    updatedCompletions.set(
      {
        projectDetails: stringToHex(k.projectDetails),
      },
      v
    );
  });
  updatedCompletions.set(
    {
      projectDetails: stringToHex(signOffApproval.metadata.projectDetails),
    },
    signOffApproval.fundRequested
  );

  const updatedFundRecevied =
    member.fundReceived + signOffApproval.fundRequested;

  // Create updated metadata with the new structure
  const updatedMetadata: MemberData = {
    ...member.metadata,
    // You can update specific fields here if needed
  };

  const memberMetadata: MembershipMetadata =
    membershipMetadata(updatedMetadata);

  const updatedMemberDatum: MemberDatum = memberDatum(
    member.token.policyId,
    member.token.assetName,
    updatedCompletions,
    updatedFundRecevied,
    memberMetadata
  );

  return updatedMemberDatum;
};

export const getProposalDatum = (utxo: UTxO): Proposal => {
  const plutusData = utxo.output.plutusData!;
  const datum: ProposalDatum = deserializeDatum(plutusData);

  const fundRequested: number = Number(datum.fields[0].int);
  const receiver: string = serializeAddressObj(datum.fields[1]);
  const member: number = Number(datum.fields[2].int);
  const metadataPluts: ProposalMetadata = datum.fields[3];

  const metadata: ProposalData = {
    projectDetails: hexToString(metadataPluts.fields[0].bytes),
  };
  return {
    fundRequested: fundRequested,
    receiver: receiver,
    member: member,
    metadata: metadata,
  };
};

export const getTreasuryChange = (
  utxos: UTxO[],
  fundRequested: number
): Asset[] => {
  const changedAmount: Asset[] = [];
  const assetMap: Map<string, number> = new Map();

  utxos.forEach((utxo) => {
    utxo.output.amount.forEach((asset) => {
      const existingValue = assetMap.get(asset.unit);
      if (existingValue !== undefined) {
        assetMap.set(asset.unit, existingValue + Number(asset.quantity));
      } else {
        assetMap.set(asset.unit, Number(asset.quantity));
      }
    });
  });
  assetMap.set("lovelace", fundRequested);

  assetMap.forEach((quantity, unit) => {
    changedAmount.push({
      unit: unit,
      quantity: quantity.toString(),
    });
  });

  return changedAmount;
};

export const computeProposalMetadataHash = (
  metadata: ProposalMetadata
): string => {
  const bytes: string = serializeData(metadata, "JSON");

  const hash = blake2b(Buffer.from(bytes, "hex"), undefined, 32);

  const str = Buffer.from(hash.buffer).toString("hex");

  return str;
};
