# Specification - MembershipIntent Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer `ApplyMembership {PolicyId, AssetName, Data}`

   - only 1 input token bought in
   - mint 1 `MembershipIntent` token
   - output bought in token back to person
   - output `MembershipIntent` token to `MembershipIntent` Spending Script with datum {Asset}

2. Burn - Redeemer `ApproveMember`

   - only 1 input `MembershipIntent` token from MembershipIntent Spending Script
   - burn `MembershipIntent` token
   - check if 1 `Member` token is minted

3. Burn - Redeemer `RejectMember`

   - only 1 input `MembershipIntent` token from MembershipIntent Spending Script
   - mint value only burn `MembershipIntent` token
   - require multisig
