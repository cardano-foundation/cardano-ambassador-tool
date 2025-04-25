# Specification - Member Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer `AddMember {PolicyId, Address}`

   - only 1 input `?token` from person
   - mint cip68 (todo: naming)
   - output `?token` back to person
   - output `Member` nft token to person
   - output `Member` ref token to Member Spending Script
   - require multisig

2. Burn - Redeemer `RemoveMember {PolicyId, Address}`

   - only 1 input `Member` ref token from Member Spending Script
   - burn `Member` ref token
   - require full multisig
