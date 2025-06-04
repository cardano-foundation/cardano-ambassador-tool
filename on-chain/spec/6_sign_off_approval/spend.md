# Specification - SignOffApproval Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## Datum

- `fund_requested`: `Int` - fund requested
- `recevier_address`: `Address`
- `metadata`: `Data` - Project Details

## User Action

1. Process Sign-off

   - `SignOffApproval` token in own input is burnt
