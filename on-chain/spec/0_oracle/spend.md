# Specification - Oracle

## Parameter

## Datum

- `admins`: The pkh of all admins
- `admin_tenure`: The tenure of admin
- `multisig_threshold`: The threshold of multsig
- `oracle_nft`: The policy id of `OracleNFT`
- `oracle_address`: The address of the current oracle validator
- `membership_intent_token`: The policy id of token at address of `MembershipIntent`
- `membership_intent_address`: The address of `MembershipIntent`
- `member_token`: The policy id of token at address of `Member`
- `member_address`: The address of `Member`
- `propose_intent_token`: The policy id of token at address of `ProposeIntent`
- `propose_intent_address`: The address of `ProposeIntent`
- `proposal_token`: The policy id of token at address of `Proposal`
- `proposal_address`: The address of `Proposal`
- `sign_off_approval_token`: The policy id of token at address of `SignOffApproval`
- `sign_off_approval_address`: The address of `SignOffApproval`
- `treasury_address`: The address of `SignOffApproval` and `Treasury`
- `treasury_withdrawal_script_hashes`: To store staking script hashes of `TreasuryWithdrawal`

## User Action

1. Rotate admin - Redeemer `RotateAdmin {new_admin}`

   - Only 1 input from oracle address
   - The only 1 output datum is updated with new admin
   - Required signers include both original and the new admins

2. Update multisig threshold - Redeemer `UpdateThreshold {new_threshold}`

   - Only 1 input from oracle address
   - The only 1 output datum is updated with new threshold
   - Required full multisig

3. Stop the oracle validator - Redeemer `StopOracle`

   - Require full multisig
   - The `OracleNFT` is burnt
