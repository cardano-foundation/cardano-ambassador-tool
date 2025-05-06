# Specification - SignOffApproval Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer `MintSignOffApproval`

   - only 1 `Proposal` token from `Proposal` Spending Script
   - mint 1 `SignOffApproval` token
   - require multisig
