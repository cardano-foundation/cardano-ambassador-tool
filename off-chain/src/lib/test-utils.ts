/**
 * Simple test utilities for testing plutusData parsing
 * Just call these functions with your plutusData string!
 */

import { MemberDatum } from "./bar";
import { MembershipMetadata, MemberData, ProposalData } from "./types";
import {
  getMemberDatum,
  getProposalDatum,
  getMembershipIntentDatum,
  extractString,
} from "./utils";
import { deserializeDatum, serializeAddressObj, UTxO } from "@meshsdk/core";

/**
 * Test parsing a Member datum
 * @param plutusData - The plutusData hex string from your UTxO
 * @returns Parsed Member object
 */
export function testMemberDatum(plutusData: string) {
  console.log("Testing Member Datum...");

  const datum: MemberDatum = deserializeDatum(
    "d8799f9f581cc76c35088ac826c8a0e6947c8ff78d8d4495789bc729419b3a3343054b3232326667647373535353ffa000d8799fd8799fd8799f581cab44f916e940ef5233582b9e901359c806374a644b2a5a404171d589ffd8799fd8799fd8799f581c8dabad4a2faaa2c13312f16f0feb3af58b47025b717ac059f555648bffffffff4d57796e7465722047726168616d54526174696f6e652076656c6974207175697320715672697a656b7572406d61696c696e61746f722e636f6d53457374206572726f7220736564206561206578424b45474d6f6d62617361ffff"
  );
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

  console.log("✅ Success!", metadata);
  console.log("✅ Success!", policyId);

  console.log("✅ Success!", assetName);
  console.log("✅ Success!", completion);
  console.log("✅ Success!", fundReceived);

  return;
}
