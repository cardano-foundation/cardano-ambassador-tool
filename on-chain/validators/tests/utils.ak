use cardano/address.{from_script}
use mocktail.{mock_policy_id, mock_pub_key_hash, mock_script_hash}
use types.{OracleDatum}

pub const mock_first_admin = mock_pub_key_hash(0)

pub const mock_second_admin = mock_pub_key_hash(1)

pub const mock_third_admin = mock_pub_key_hash(2)

pub const mock_admins = [mock_first_admin, mock_second_admin, mock_third_admin]

pub const mock_admin_tenure = @"11-11-1111"

pub const mock_multisig_threshold = 2

pub const mock_oracle_nft = mock_policy_id(0)

pub const mock_counter_nft = mock_policy_id(1)

pub const mock_membership_intent_token = mock_policy_id(2)

pub const mock_member_token = mock_policy_id(3)

pub const mock_propose_intent_token = mock_policy_id(4)

pub const mock_proposal_token = mock_policy_id(5)

pub const mock_sign_off_approval_token = mock_policy_id(6)

pub const mock_oracle_address = from_script("oracle_address")

pub const mock_counter_address = from_script("counter_address")

pub const mock_membership_intent_address =
  from_script("membership_intent_address")

pub const mock_member_address = from_script("member_address")

pub const mock_propose_intent_address = from_script("propose_intent_address")

pub const mock_proposal_address = from_script("proposal_address")

pub const mock_sign_off_approval_address =
  from_script("sign_off_approval_address")

pub const mock_treasury_address = from_script("treasury_address")

pub const mock_treasury_withdrawal_script_hashes = mock_script_hash(700)

pub const mock_input_oracle_datum: OracleDatum =
  OracleDatum {
    admins: mock_admins,
    admin_tenure: mock_admin_tenure,
    multi_sig_threshold: mock_multisig_threshold,
    oracle_nft: mock_oracle_nft,
    oracle_address: mock_oracle_address,
    counter_nft: mock_counter_nft,
    counter_address: mock_counter_address,
    membership_intent_token: mock_membership_intent_token,
    memebership_intent_address: mock_membership_intent_address,
    member_token: mock_member_token,
    member_address: mock_member_address,
    propose_intent_token: mock_propose_intent_token,
    propose_intent_address: mock_propose_intent_address,
    proposal_token: mock_proposal_token,
    proposal_address: mock_proposal_address,
    sign_off_approval_token: mock_sign_off_approval_token,
    sign_off_approval_address: mock_sign_off_approval_address,
    treasury_address: mock_treasury_address,
    treasury_withdrawal_script_hashes: mock_treasury_withdrawal_script_hashes,
  }

pub const mock_new_first_admin = mock_pub_key_hash(10)

pub const mock_new_second_admin = mock_pub_key_hash(11)

pub const mock_new_third_admin = mock_pub_key_hash(12)

pub const mock_new_admins =
  [mock_new_first_admin, mock_new_second_admin, mock_new_third_admin]

pub const mock_new_multisig_threshold = 1

pub const mock_new_admin_tenure = @"22-22-2222"
