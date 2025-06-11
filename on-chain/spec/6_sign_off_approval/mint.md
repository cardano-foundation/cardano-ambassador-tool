# Specification - SignOffApproval Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer `MintSignOffApproval`

   - only 1 `Proposal` token from `Proposal` Spending Script
   - mint 1 `SignOffApproval` token
   - output `SignOffApproval` token to `SignOffApproval` Spending Script with the same datum of `Proposal` token(project url, amount, receiver) tbc
   - require multisig

2. Burn - Redeemer `ProcessSignOff`
   - Obtain the `treasury_withdrawal` script hash from oracle
   - Withdrawal script of `treasury_withdrawal` validating
