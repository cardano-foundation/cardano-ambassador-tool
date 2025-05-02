use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address}
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
  multi_sig_threshold: Int,
  oracle_nft: PolicyId,
  oracle_address: Address,
  membership_intent_token: PolicyId,
  memebership_intent_address: Address,
  member_token: PolicyId,
  member_address: Address,
  propose_intent_token: PolicyId,
  propose_intent_address: Address,
  proposal_token: PolicyId,
  proposal_address: Address,
  sign_off_approval_token: PolicyId,
  sign_off_approval_address: Address,
}

// 1 - MembershipIntent

pub type MembershipIntentMintRedeemer {
  ApplyMembership {
    policy_id: PolicyId,
    asset_name: AssetName,
    person: Address,
  }
  ApproveMember { policy_id: PolicyId, asset_name: AssetName, person: Address }
  RejectMember { policy_id: PolicyId, asset_name: AssetName, person: Address }
}

// 2 - Member

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

// 3 - ProposeIntent

pub type ProposeIntentMintRedeemer {
  ProposeProject { project_url: String, fund_requested: Int, receiver: Address }
  ApproveProposal { project: AssetName }
  RejectProposal { project: AssetName }
}

pub type ProposalDatum {
  project_url: String,
  fund_requested: Int,
  receiver: Address,
}

// 4 - Proposal

pub type ProposalMintRedeemer {
  MintProposal { project: AssetName }
  ApproveSignOff { project: AssetName }
}

// 5 - SignOffApproval

pub type SignOffApprovalMintRedeemer {
  MintSignOffApproval { project: AssetName }
  SignOff { project: AssetName }
}
