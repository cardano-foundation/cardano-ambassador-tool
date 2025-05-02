# Specification - SignOffApproval Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## Datum

- `project_url`: `String` - Project Details
- `fund_requested`: `Int` - fund requested
- `recevier_address`: `Address`

## User Action

1. Process Sign-off

   - Obtain the `treasury_withdrawal` script hash from oracle
   - Withdrawal script of `treasury_withdrawal` validating
