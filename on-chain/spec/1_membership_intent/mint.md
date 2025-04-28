# Specification - MembershipIntent Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer `ApplyMembership {Asset}`

   - only 1 input token bought in
   - mint 1 `MembershipIntent` token (todo: naming)
   - output bought in token back to person
   - output `MembershipIntent` token to `MembershipIntent` Spending Script with datum {Asset}

2. Burn - Redeemer `ApproveMember {AssetName}`

   - only 1 input `MembershipIntent` token from MembershipIntent Spending Script
   - burn `MembershipIntent` token
   - check if 1 `Member` token is minted

3. Burn - Redeemer `RejectMember {AssetName}`

   - only 1 input `MembershipIntent` token from MembershipIntent Spending Script
   - mint value only burn `MembershipIntent` token
