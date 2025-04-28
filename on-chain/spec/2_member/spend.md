# Specification - Member Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## Datum

- `completion`: `Pairs<String,Int>` - Proposal completion records
- `fund_recevied`: `Int` - fund received records

## User Action

1. Remove member

   - only 1 input `Member` ref token from Self
   - check if it is burnt

2. Propose Project

   - check if 1 `ProposeIntent` token is minted

3. Sign-off Proposal

   - check if 1 `Proposal` token is burnt
