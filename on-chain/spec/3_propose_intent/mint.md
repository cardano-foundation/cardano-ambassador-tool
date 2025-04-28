# Specification - ProposeIntent Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer `ProposeProject {String, Int}`

   - only 1 input `Member` nft token
   - only 1 input `Member` ref token from Member Spending Script
   - mint 1 `ProposeIntent` token (todo: naming)
   - output `Member` nft token back to member
   - output `Member` ref token to Member Spending Script with datum (Pending: Project) tbc
   - output `ProposeIntent` token to `ProposeIntent` Spending Script with datum (project url, amount)

2. Burn - Redeemer `ApproveProposal {AssetName}`

   - only 1 input `ProposeIntent` token from ProposeIntent Spending Script
   - burn `ProposeIntent` token
   - check if 1 `Proposal` token is minted

3. Burn - Redeemer `RejectProposal {AssetName}`

   - only 1 input `ProposeIntent` token from ProposeIntent Spending Script
   - mint value only burn `ProposeIntent` token
