# Specification - Member Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer `AddMember`

   - only 1 input `MembershipIntent` from `MembershipIntent` Spending Script
   - only 1 input `Counter` from `Counter` Spending Script
   - Mint 1 `Member` NFT with name `Counter`'s count
   - output `Member` NFT to `Member` Spending Script with `MemberDatum`
   - require multisig

2. Burn - Redeemer `RemoveMember`

   - only 1 input `Member` NFT from `Member` Spending Script
   - burn `Member` NFT
   - require full multisig
