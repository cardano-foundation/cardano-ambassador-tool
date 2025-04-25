# Specification - Proposal Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer `MintProposal {AssetName}`

   - only 1 input `ProposeIntent` token from Propose Intent Spending Script
   - mint 1 `Proposal` token with correct AssetName
   - output `Proposal` token to `Proposal` Spending Script with the same datum of `ProposeIntent` token(project url, amount) tbc
   - require multisig

2. Burn - Redeemer `SignOffProposal {AssetName}`

   - only 1 `Proposal` token from Proposal Spending Script
   - burn 1 `Proposal` token
   - only 1 input `Member` nft token
   - only 1 input `Member` ref token from Member Spending Script
   - output `Member` nft token back to member
   - output `Member` ref token to Member Spending Script with datum (completion + fund_received)
   - output correct $$$ from `Treasury` to member
   - require multisig
