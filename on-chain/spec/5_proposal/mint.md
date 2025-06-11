# Specification - Proposal Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer ` MintProposal`

   - only 1 input `ProposeIntent` token from `ProposeIntent` Spending Script
   - mint 1 `Proposal` token with same AssetName
   - output `Proposal` token to `Proposal` Spending Script with the same datum of `ProposeIntent` token(project url, amount, receiver) tbc
   - require multisig

2. Burn - Redeemer `ApproveSignOff`

   - only 1 `Proposal` token from `Proposal` Spending Script
   - burn 1 `Proposal` token
   - mint 1 `SignOffApproval` token
