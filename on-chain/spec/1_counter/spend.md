# Specification - Oracle

## Parameter

## Datum

- `admins`: The pkh of all admins
- `count`: The counting of `Member` token

## User Action

1. Rotate admin - Redeemer `UpdateCounter`

   - Only 1 input from `Counter` Spending Script
   - Output back to `Counter` Spending Script
   - The only 1 output datum is updated with ++
   - Mint one `Member` token

2. Stop the oracle validator - Redeemer `StopCounter`

   - Require full multisig
   - The `Counter` is burnt
