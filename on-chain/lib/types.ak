use aiken/crypto.{ScriptHash, VerificationKeyHash}
use aiken/primitive/bytearray
use cardano/address.{Address, Credential}
use cardano/assets.{AssetName, PolicyId}

// Mint Redeemer

pub type MintPolarity {
  RMint
  RBurn
}

// 0 - Oracle
pub type OracleSpendRedeemer {
  RotateAdmin { new_admin: VerificationKeyHash }
  UpdateThreshold { new_threshold: Int }
  StopDex
}

pub type OracleDatum {
  admins: List<VerificationKeyHash>,
  admin_tenure: String,
  oracle_nft: PolicyId,
  oracle_address: Address,
  app_vault_address: Address,
  member_token: PolicyId,
  member_address: Address,
  propose_intent_token: PolicyId,
  propose_intent_address: Address,
  proposal_token: PolicyId,
  proposal_address: Address,
}

// 1 - Member

pub type MemberMintRedeemer {
  AddMember { token: PolicyId, person: Address }
  RemoveMember { token: PolicyId, person: Address }
}

pub type MemberSpendRedeemer {
  AdminRemoveMember
  MemberProposeProject
  AdminSignOffProject
}

pub type MemberDatum {
  completion: Pairs<String, Int>,
  fund_recevied: Int,
}

// 2 - ProposeIntent

pub type ProposeIntentMintRedeemer {
  ProposeProject { project_url: String, fund_requested: Int }
  ApproveProposal { project: AssetName }
  RejectProposal { project: AssetName }
}

pub type ProposeIntentDatum {
  project_url: String,
  fund_requested: Int,
}

// 3 - Proposal

pub type ProposalMintRedeemer {
  MintProposal { project: AssetName }
  SignOffProposal { project: AssetName }
}
