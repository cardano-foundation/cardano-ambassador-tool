# Specification - TreasuryWithdrawal

## Parameter

- `oracle_nft`: The policy id of `OracleNFT`

## User Action

1. Sign-off Proposal

   - only 1 input `Member` NFT from `Member` Spending Script
   - only 1 input `SignOffApproval` token from `SignOffApproval` Spending Script
   - burn `SignOffApproval` token
   - output `Member` NFT to Member Spending Script with datum (Completed: Project) tbc
   - output correct $$$ from `Treasury` to receiver in `Proposal` datum
   - output leftover $$$ back to `Treasury`
