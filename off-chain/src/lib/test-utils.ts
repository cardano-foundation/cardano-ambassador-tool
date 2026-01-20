/**
 * Simple test utilities for testing plutusData parsing
 * Just call these functions with your plutusData string!
 */

import { MemberDatum, MembershipIntentDatum, ProposalDatum } from "./bar";
import {
  MembershipMetadata,
  MemberData,
  ProposalData,
  ProposalMetadata,
  Member,
  memberDatum,
  membershipMetadata,
  Proposal,
} from "./types";
import {
  getMemberDatum,
  getProposalDatum,
  getMembershipIntentDatum,
  extractString,
} from "./utils";
import {
  deserializeDatum,
  serializeAddressObj,
  serializeData,
  UTxO,
} from "@meshsdk/core";

/**
 * Test parsing a Member datum
 * @param plutusData - The plutusData hex string from your UTxO
 * @returns Parsed Member object
 */

export function testMembershipIntentDatum(plutusData: string) {
  console.log("Testing MembershipIntent Datum...");

  const datum: MembershipIntentDatum = deserializeDatum(plutusData);

  const policyId = datum.fields[0].list[0].bytes;
  const assetName = datum.fields[0].list[1].bytes;
  const metadataPluts: MembershipMetadata = datum.fields[1];

  const metadata: MemberData = {
    walletAddress: serializeAddressObj(metadataPluts.fields[0]),
    fullName: extractString(metadataPluts.fields[1]),
    displayName: extractString(metadataPluts.fields[2]),
    emailAddress: extractString(metadataPluts.fields[3]),
    bio: extractString(metadataPluts.fields[4]),
    country: extractString(metadataPluts.fields[5]),
    city: extractString(metadataPluts.fields[6]),
  };

  console.log("✅ metadataPluts!", metadataPluts);

  return { policyId, assetName, metadata };
}

export function testMemberDatum(plutusData: string) {
  console.log("Testing Member Datum...");

  const datum: MemberDatum = deserializeDatum(plutusData);
  const metadataPluts: MembershipMetadata = datum.fields[3];

  const metadata: MemberData = {
    walletAddress: serializeAddressObj(metadataPluts.fields[0]),
    fullName: extractString(metadataPluts.fields[1]),
    displayName: extractString(metadataPluts.fields[2]),
    emailAddress: extractString(metadataPluts.fields[3]),
    bio: extractString(metadataPluts.fields[4]),
    country: extractString(metadataPluts.fields[5]),
    city: extractString(metadataPluts.fields[6]),
    x_handle: extractString(metadataPluts.fields[7]),
    github: extractString(metadataPluts.fields[8]),
    discord: extractString(metadataPluts.fields[9]),
    spo_id: extractString(metadataPluts.fields[10]),
    drep_id: extractString(metadataPluts.fields[11]),
  };

  const policyId = datum.fields[0].list[0].bytes;
  const assetName = datum.fields[0].list[1].bytes;

  const completion: Map<ProposalData, number> = new Map();
  datum.fields[1].map.forEach((item) => {
    completion.set(
      {
        title: extractString(item.k.fields[0]),
        url: extractString(item.k.fields[1]),
        fundsRequested: extractString(item.k.fields[2]),
        receiverWalletAddress: serializeAddressObj(item.k.fields[3]),
        submittedByAddress: serializeAddressObj(item.k.fields[4]),
        status: extractString(item.k.fields[5]),
      },
      Number(item.v.int)
    );
  });

  const fundReceived = Number(datum.fields[2].int);

  console.log("✅ policyId!", policyId);
  console.log("✅ assetName!", assetName);
  console.log("✅ completion!", completion);
  console.log("✅ fundReceived!", fundReceived);
  console.log("✅ metadataPluts!", metadataPluts);
  console.log("✅ metadata!", metadata);

  return {
    token: { policyId, assetName },
    completion,
    fundReceived,
    metadata,
  };
}

export function testProposalDatum(plutusData: string) {
  console.log("Testing Proposal Datum...");

  const datum: ProposalDatum = deserializeDatum(plutusData);

  const fundRequested: number = Number(datum.fields[0].int);
  const receiver: string = serializeAddressObj(datum.fields[1]);
  const member: number = Number(datum.fields[2].int);
  const metadataPluts: ProposalMetadata = datum.fields[3];

  const metadata: ProposalData = {
    title: extractString(metadataPluts.fields[0]),
    url: extractString(metadataPluts.fields[1]),
    fundsRequested: extractString(metadataPluts.fields[2]),
    receiverWalletAddress: serializeAddressObj(metadataPluts.fields[3]),
    submittedByAddress: serializeAddressObj(metadataPluts.fields[4]),
    status: extractString(metadataPluts.fields[5]),
  };

  console.log("✅ fundRequested!", fundRequested);
  console.log("✅ receiver!", receiver);
  console.log("✅ member!", member);
  console.log("✅ metadataPluts!", metadataPluts);
  console.log("✅ metadata!", metadata);

  return {
    fundRequested: fundRequested,
    receiver: receiver,
    member: member,
    metadata: metadata,
  };
}

export function testUpdateMemberDatum(
  memberPlutusData: string,
  proposalPlutusData: string
) {
  console.log("Testing Update Member Datum...");

  const member: Member = testMemberDatum(memberPlutusData);
  const signOffApproval: Proposal = testProposalDatum(proposalPlutusData);

  const updatedCompletions: Map<ProposalData, number> = new Map();
  member.completion.forEach((v, k) => {
    updatedCompletions.set(k, v);
  });
  updatedCompletions.set(
    signOffApproval.metadata,
    signOffApproval.fundRequested
  );

  const updatedFundRecevied =
    member.fundReceived + signOffApproval.fundRequested;

  const memberMetadata: MembershipMetadata = membershipMetadata(
    member.metadata
  );

  const updatedMemberDatum: MemberDatum = memberDatum(
    member.token.policyId,
    member.token.assetName,
    updatedCompletions,
    updatedFundRecevied,
    memberMetadata
  );

  console.log("✅ policyId!", member.token.policyId);
  console.log("✅ assetName!", member.token.assetName);
  console.log("✅ updatedCompletions!", updatedCompletions);
  console.log("✅ memberMetadata!", memberMetadata);
  console.log("✅ new plutusData!", serializeData(updatedMemberDatum, "JSON"));

  return updatedMemberDatum;
}
