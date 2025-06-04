# Specification - Proposal Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## Datum

- `fund_requested`: `Int` - fund requested
- `recevier_address`: `Address`
- `member`: `Int` - Member token assetName
- `metadata`: `Data` - Project Details

## User Action

1. Approve Sign-off Proposal

   - `Proposal` token in own input is burnt
