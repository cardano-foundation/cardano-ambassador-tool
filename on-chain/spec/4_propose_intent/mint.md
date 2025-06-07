# Specification - ProposeIntent Token

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Mint - Redeemer `ProposeProject {Int, Addres, Int, Data}`

   - 1 ref input `Member` NFT from `Member` Spending Script
   - check if 1 input with asset same as the datum in `Member` NFT
   - mint 1 `ProposeIntent` token with assetName = hash(datum)
   - output user token back to member
   - output `ProposeIntent` token to `ProposeIntent` Spending Script with `ProposalDatum` (project url, amount, address)

2. Burn - Redeemer `ApproveProposal`

   - only 1 input `ProposeIntent` token from `ProposeIntent` Spending Script
   - burn `ProposeIntent` token
   - check if 1 `Proposal` token is minted

3. Burn - Redeemer `RejectProposal`

   - only 1 input `ProposeIntent` token from `ProposeIntent` Spending Script
   - mint value only burn `ProposeIntent` token
   - require multisig
