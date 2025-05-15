import {
  byteString,
  conStr0,
  deserializeDatum,
  hexToString,
  integer,
  list,
  serializeAddressObj,
  stringToHex,
  UTxO,
  verificationKey,
} from "@meshsdk/core";
import { policyIdLength } from "./constant";
import {
  CounterDatum,
  MemberDatum,
  MembershipIntentDatum,
  OracleDatum,
  ProposalDatum,
} from "./bar";
import { Member, memberDatum, Proposal } from "./types";

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
            return verificationKey(admin);
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
): { policyId: string; assetName: string } => {
  const plutusData = membershipIntentUtxo.output.plutusData!;
  const datum: MembershipIntentDatum = deserializeDatum(plutusData);

  const policyId = datum.fields[0].list[0].bytes;
  const assetName = datum.fields[0].list[1].bytes;

  return { policyId, assetName };
};

export const getMemberDatum = (memberUtxo: UTxO): Member => {
  const plutusData = memberUtxo.output.plutusData!;
  const datum: MemberDatum = deserializeDatum(plutusData);

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
  };
};

export const updateMemberDatum = (
  memberUtxo: UTxO,
  signOffApprovalUtxo: UTxO
): MemberDatum => {
  const member: Member = getMemberDatum(memberUtxo);
  const signOffApproval: Proposal = getProposalDatum(signOffApprovalUtxo);

  const updated_completion: Map<string, number> = new Map();
  member.completion.forEach((v, k) => {
    updated_completion.set(stringToHex(k), v);
  });
  updated_completion.set(
    stringToHex(signOffApproval.project_url),
    signOffApproval.fund_requested
  );

  const updated_fund_received =
    member.fund_received + signOffApproval.fund_requested;

  const updated_member_datum: MemberDatum = memberDatum(
    member.token.policyId,
    member.token.assetName,
    updated_completion,
    updated_fund_received
  );

  return updated_member_datum;
};

export const getProposalDatum = (utxo: UTxO): Proposal => {
  const plutusData = utxo.output.plutusData!;
  const datum: ProposalDatum = deserializeDatum(plutusData);

  const project_url: string = hexToString(datum.fields[0].bytes);
  const fund_requested: number = Number(datum.fields[1].int);
  const receiver: string = serializeAddressObj(datum.fields[2]);

  return {
    project_url: project_url,
    fund_requested: fund_requested,
    receiver: receiver,
  };
};
