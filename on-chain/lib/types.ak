use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address.{Address}
use cardano/assets.{AssetName, PolicyId}

// Mint Redeemer

pub type MintPolarity {
  RMint
  RBurn
}

// 0 - Oracle
pub type OracleSpendRedeemer {
  RotateAdmin {
    new_admins: List<VerificationKeyHash>,
    new_admin_tenure: String,
  }
  UpdateThreshold { new_threshold: Int }
  StopOracle
}

pub type OracleDatum {
  admins: List<VerificationKeyHash>,
  admin_tenure: String,
  multi_sig_threshold: Int,
  oracle_nft: PolicyId,
  oracle_address: Address,
  counter_nft: PolicyId,
  counter_address: Address,
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
  treasury_address: Address,
  treasury_withdrawal_script_hashes: ScriptHash,
}

// 1 - Counter
pub type CounterSpendRedeemer {
  IncrementCount
  StopCounter
}

pub type CounterDatum {
  count: Int,
}

// 2 - MembershipIntent

pub type MembershipIntentMintRedeemer {
  ApplyMembership { policy_id: PolicyId, asset_name: AssetName }
  ApproveMember
  RejectMember
}

pub type MembershipIntentDatum {
  token: (PolicyId, AssetName),
}

// 3 - Member

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
  token: (PolicyId, AssetName),
  completion: Pairs<String, Int>,
  fund_recevied: Int,
}

// 4 - ProposeIntent

pub type ProposeIntentMintRedeemer {
  ProposeProject { project_url: String, fund_requested: Int, receiver: Address }
}

pub type ProposalDatum {
  project_url: String,
  fund_requested: Int,
  receiver: Address,
}

// 5 - Proposal

pub type ProposalMintRedeemer {
  MintProposal
  ApproveSignOff
}

// 6 - SignOffApproval

pub type SignOffApprovalMintRedeemer {
  MintSignOffApproval { project: AssetName }
  SignOff { project: AssetName }
}

// 7 - Treasury

pub type TreasuryRedeemer {
  TreasuryWithdrawal
}
