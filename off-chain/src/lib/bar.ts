import blueprint from "../../../on-chain/plutus.json";

import {
  OutputReference,
  ConStr0,
  ConStr1,
  MintingBlueprint,
  PolicyId,
  Integer,
  SpendingBlueprint,
  ConStr2,
  Tuple,
  AssetName,
  Pairs,
  List,
  PubKeyAddress,
  ScriptAddress,
  ByteString,
  ScriptHash,
  WithdrawalBlueprint,
} from "@meshsdk/core";

const version = "V3";
const networkId = 0; // 0 for testnet; 1 for mainnet
// Every spending validator would compile into an address with an staking key hash
// Recommend replace with your own stake key / script hash
const stakeKeyHash = "";
const isStakeScriptCredential = false;

export class CounterMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [OutputReference]) {
    const compiledCode = blueprint.validators[0]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [OutputReference]): [OutputReference] => data;
}

export class CounterSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[2]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
  datum = (data: CounterDatum): CounterDatum => data;
  redeemer = (data: CounterSpendRedeemer): CounterSpendRedeemer => data;
}

export class MemberMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[4]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
}

export class MemberSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[6]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
  datum = (data: MemberDatum): MemberDatum => data;
  redeemer = (data: MemberSpendRedeemer): MemberSpendRedeemer => data;
}

export class MembershipIntentMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[8]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
}

export class MembershipIntentSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[10]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
  datum = (data: MembershipIntentDatum): MembershipIntentDatum => data;
  redeemer = (
    data: MembershipIntentSpendRedeemer
  ): MembershipIntentSpendRedeemer => data;
}

export class OracleMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [OutputReference]) {
    const compiledCode = blueprint.validators[12]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [OutputReference]): [OutputReference] => data;
}

export class OracleSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor() {
    const compiledCode = blueprint.validators[14]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.noParamScript(compiledCode);
  }

  datum = (data: OracleDatum): OracleDatum => data;
  redeemer = (data: OracleSpendRedeemer): OracleSpendRedeemer => data;
}

export class ProposalMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[16]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
}

export class ProposalSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[18]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
  datum = (data: ProposalDatum): ProposalDatum => data;
  redeemer = (data: Data): Data => data;
}

export class ProposeIntentMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[20]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
}

export class ProposeIntentSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[22]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
  datum = (data: ProposalDatum): ProposalDatum => data;
  redeemer = (data: Data): Data => data;
}

export class SignOffApprovalMintBlueprint extends MintingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[24]!.compiledCode;
    super(version);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
}

export class SignOffApprovalSpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[26]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
  datum = (data: ProposalDatum): ProposalDatum => data;
  redeemer = (data: Data): Data => data;
}

export class TreasurySpendBlueprint extends SpendingBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[28]!.compiledCode;
    super(version, networkId, stakeKeyHash, isStakeScriptCredential);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
  datum = (data: Data): Data => data;
  redeemer = (data: Data): Data => data;
}

export class TreasuryWithdrawBlueprint extends WithdrawalBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[30]!.compiledCode;
    super(version, networkId);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
}

export class TreasuryPublishBlueprint extends WithdrawalBlueprint {
  compiledCode: string;

  constructor(params: [PolicyId]) {
    const compiledCode = blueprint.validators[31]!.compiledCode;
    super(version, networkId);
    this.compiledCode = compiledCode;
    this.paramScript(compiledCode, params, "JSON");
  }

  params = (data: [PolicyId]): [PolicyId] => data;
}

export type MintPolarity = RMint | RBurn;

export type RMint = ConStr0<[]>;

export type RBurn = ConStr1<[]>;

export type CounterSpendRedeemer = IncrementCount | StopCounter;

export type IncrementCount = ConStr0<[]>;

export type StopCounter = ConStr1<[]>;

export type CounterDatum = ConStr0<[Integer]>;

export type MemberMintRedeemer = AddMember | RemoveMember;

export type AddMember = ConStr0<[]>;

export type RemoveMember = ConStr1<[]>;

export type MemberSpendRedeemer =
  | AdminRemoveMember
  | AdminSignOffProject
  | MemberUpdateMetadata;

export type AdminRemoveMember = ConStr0<[]>;

export type AdminSignOffProject = ConStr1<[]>;

export type MemberUpdateMetadata = ConStr2<[]>;

export type MemberDatum = ConStr0<
  [Tuple<[PolicyId, AssetName]>, Pairs<any, Integer>, Integer, any]
>;

export type Data = any;

export type MembershipIntentMintRedeemer =
  | ApplyMembership
  | ApproveMember
  | RejectMember;

export type ApplyMembership = ConStr0<[PolicyId, AssetName, any]>;

export type ApproveMember = ConStr1<[]>;

export type RejectMember = ConStr2<[]>;

export type MembershipIntentSpendRedeemer =
  | ProcessMembershipIntent
  | UpdateMembershipIntentMetadata;

export type ProcessMembershipIntent = ConStr0<[]>;

export type UpdateMembershipIntentMetadata = ConStr1<[]>;

export type MembershipIntentDatum = ConStr0<
  [Tuple<[PolicyId, AssetName]>, any]
>;

export type OracleSpendRedeemer = RotateAdmin | UpdateThreshold | StopOracle;

export type RotateAdmin = ConStr0<
  [List<PubKeyAddress | ScriptAddress>, ByteString]
>;

export type UpdateThreshold = ConStr1<[Integer]>;

export type StopOracle = ConStr2<[]>;

export type OracleDatum = ConStr0<
  [
    List<PubKeyAddress | ScriptAddress>,
    ByteString,
    Integer,
    PolicyId,
    PubKeyAddress | ScriptAddress,
    PolicyId,
    PubKeyAddress | ScriptAddress,
    PolicyId,
    PubKeyAddress | ScriptAddress,
    PolicyId,
    PubKeyAddress | ScriptAddress,
    PolicyId,
    PubKeyAddress | ScriptAddress,
    PolicyId,
    PubKeyAddress | ScriptAddress,
    PolicyId,
    PubKeyAddress | ScriptAddress,
    PubKeyAddress | ScriptAddress,
    ScriptHash
  ]
>;

export type ProposalMintRedeemer = MintProposal | ApproveSignOff;

export type MintProposal = ConStr0<[]>;

export type ApproveSignOff = ConStr1<[]>;

export type ProposalDatum = ConStr0<
  [Integer, PubKeyAddress | ScriptAddress, Integer, any]
>;

export type ProposeIntentMintRedeemer =
  | ProposeProject
  | ApproveProposal
  | RejectProposal;

export type ProposeProject = ConStr0<
  [Integer, PubKeyAddress | ScriptAddress, Integer, any]
>;

export type ApproveProposal = ConStr1<[]>;

export type RejectProposal = ConStr2<[]>;

export type SignOffApprovalMintRedeemer = MintSignOffApproval | ProcessSignOff;

export type MintSignOffApproval = ConStr0<[]>;

export type ProcessSignOff = ConStr1<[]>;
