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
  Member,
  MemberData,
  MembershipMetadata,
  Proposal,
  ProposalData,
  ProposalMetadata,
  memberDatum,
  membershipMetadata,
} from "./types";
import { blake2bHex } from "blakejs";

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

export const updateOracleDatum = (
  oracleUtxo: UTxO,
  new_admins: string[] | null,
  new_admin_tenure: string | null,
  new_multi_sig_threshold: number | null
): OracleDatum => {
  const plutusData = oracleUtxo.output.plutusData!;
  const datum: OracleDatum = deserializeDatum(plutusData);

  const updated_oracle_datum: OracleDatum = conStr0([
    new_admins
      ? list(
          new_admins.map((admin) => {
            return byteString(admin);
          })
        )
      : datum.fields[0],
    new_admin_tenure
      ? byteString(hexToString(new_admin_tenure))
      : datum.fields[1],
    new_multi_sig_threshold
      ? integer(new_multi_sig_threshold)
      : datum.fields[2],
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

  return updated_oracle_datum;
};

export const getCounterDatum = (counterUtxo: UTxO): number => {
  const plutusData = counterUtxo.output.plutusData!;
  const datum: CounterDatum = deserializeDatum(plutusData);

  const count = Number(datum.fields[0].int);

  return count;
};

export const getMembershipIntentDatum = (
  membershipIntentUtxo: UTxO
): { policyId: string; assetName: string; metadata: MemberData } => {
  const plutusData = membershipIntentUtxo.output.plutusData!;
  const datum: MembershipIntentDatum = deserializeDatum(plutusData);

  const policyId = datum.fields[0].list[0].bytes;
  const assetName = datum.fields[0].list[1].bytes;
  const metadata: MemberData = datum.fields[1];

  return { policyId, assetName, metadata };
};

export const getMemberDatum = (memberUtxo: UTxO): Member => {
  const plutusData = memberUtxo.output.plutusData!;
  const datum: MemberDatum = deserializeDatum(plutusData);
  const metadata: MemberData = datum.fields[3];

  const policyId = datum.fields[0].list[0].bytes;
  const assetName = datum.fields[0].list[1].bytes;

  const completion: Map<string, number> = new Map();
  datum.fields[1].map.forEach((item) => {
    completion.set(hexToString(item.k.bytes), Number(item.v.int));
  });

  const fund_received = Number(datum.fields[2].int);

  return {
    token: { policyId, assetName },
    completion,
    fund_received,
    metadata,
  };
};

export const updateMemberDatum = (
  memberUtxo: UTxO,
  signOffApprovalUtxo: UTxO
): MemberDatum => {
  const member: Member = getMemberDatum(memberUtxo);
  const signOffApproval: Proposal = getProposalDatum(signOffApprovalUtxo);

  const updated_completion: Map<any, number> = new Map();
  member.completion.forEach((v, k) => {
    updated_completion.set(stringToHex(k), v);
  });
  updated_completion.set(
    signOffApproval.metadata,
    signOffApproval.fund_requested
  );

  const updated_fund_received =
    member.fund_received + signOffApproval.fund_requested;

  const member_metadata: MembershipMetadata = membershipMetadata(
    member.metadata.walletAddress,
    member.metadata.fullName,
    member.metadata.displayName,
    member.metadata.emailAddress,
    member.metadata.bio
  );

  const updated_member_datum: MemberDatum = memberDatum(
    member.token.policyId,
    member.token.assetName,
    updated_completion,
    updated_fund_received,
    member_metadata
  );

  return updated_member_datum;
};

export const getProposalDatum = (utxo: UTxO): Proposal => {
  const plutusData = utxo.output.plutusData!;
  const datum: ProposalDatum = deserializeDatum(plutusData);

  const fund_requested: number = Number(datum.fields[0].int);
  const receiver: string = serializeAddressObj(datum.fields[1]);
  const member: number = Number(datum.fields[2].int);
  const metadata: ProposalData = datum.fields[3];

  return {
    fund_requested: fund_requested,
    receiver: receiver,
    member: member,
    metadata: metadata,
  };
};

export const getTreasuryChange = (
  utxos: UTxO[],
  fund_requested: number
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
  assetMap.set("lovelace", fund_requested);

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
  const hash = blake2bHex(bytes, undefined, 32);
  return hash;
};
