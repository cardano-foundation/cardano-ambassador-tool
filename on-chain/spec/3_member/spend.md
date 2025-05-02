# Specification - Member Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## Datum

- `token` : `Asset` - Asset of the token bougth in
- `completion`: `Pairs<String,Int>` - Proposal completion records
- `fund_recevied`: `Int` - fund received records

## User Action

1. Remove member

   - only 1 input `Member` NFT from Self
   - check if it is burnt

2. Propose Project

   - only 1 input `Member` NFT from Self
   - check if 1 `ProposeIntent` token is minted

3. Sign-off Proposal
   - Obtain the `treasury_withdrawal` script hash from oracle
   - Withdrawal script of `treasury_withdrawal` validating
