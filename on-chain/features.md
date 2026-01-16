# Cardano Ambassador Tool

This is an on-chain project to support Cardano ambassadors.

## Features

### Setup and Onboarding

1. Identity via Token

   Every "person" in this dapp is identified by a token the user brings in. Member records are built around this token identity (PolicyId, AssetName).

2. Initial Set of Administrators

   In setup of the app, an initial set of administrators are allotted with configurable multisig threshold (e.g., 2 out of 3). The threshold and admin list can be updated via governance.

3. Counter for Member IDs

   A counter validator maintains sequential member IDs, ensuring unique identification for each approved member.

### Members Management

1. Member Admission (Multi-stage)

   - User submits MembershipIntent with their identity token
   - User can update intent metadata before processing
   - Admins approve (multisig threshold) -> mints Member NFT
   - Admins can reject (multisig threshold) -> burns intent token

2. Member Removal

   Full multisig (all admins) required to remove member and burn their records.

3. Member Metadata Updates

   Members can update their own metadata via MemberUpdateMetadata.

4. Rotation of Administrators

   Passing quorum can rotate admin list. Requires:
   - Current admin multisig threshold
   - All new admins must sign (proves key ownership)
   - Updates admin tenure record

5. Threshold Updates

   Admins can update the multisig threshold via UpdateThreshold.

6. Oracle Shutdown

   Admins can stop the oracle via StopOracle (sets admin list to empty).

### Treasury and Proposal

1. Ambassador Treasury

   A script address where the Cardano community can donate assets. Withdrawals require sign-off approval.

2. Project Proposal (Multi-stage)

   State machine flow:

   ProposeIntent -> [approve] -> Proposal -> [signoff] -> SignOffApproval -> [execute] -> Treasury withdrawal
                 -> [reject]  -> burned

   - Members submit ProposeIntent with fund request, receiver address, and metadata
   - Members can update proposal metadata before processing
   - Admins approve -> creates Proposal
   - Admins can reject -> burns intent token

3. Sign-off Approval

   Admins sign-off completed proposals:
   - Moves Proposal to SignOffApproval state
   - Requires admin multisig threshold

4. Treasury Disbursement

   Execution of approved sign-offs:
   - Validates sign-off approval exists
   - Transfers requested funds from treasury to receiver
   - Updates member's completion record and funds received
   - Burns the sign-off approval token

### Record Keeping

Keeping full on-chain records for:

1. Admin Tenure

   admin_tenure field in Oracle tracks governance history.

2. Proposal Completion Records

   MemberDatum.completion stores completed proposals per member.

3. Fund Received Records

   MemberDatum.fund_received tracks total funds received by member.

## Validators

| Validator         | Purpose                              | State NFT             |
|-------------------|--------------------------------------|-----------------------|
| Oracle            | Admin list, thresholds, script registry | oracle.mint        |
| Counter           | Member ID counter (monotonic)        | counter.mint          |
| MembershipIntent  | Pending membership applications      | membershipIntent.mint |
| Member            | Active member records                | member.mint           |
| ProposeIntent     | Pending project proposals            | proposeIntent.mint    |
| Proposal          | Approved proposals awaiting sign-off | proposal.mint         |
| SignOffApproval   | Approved for treasury disbursement   | signOffApproval.mint  |
| Treasury          | Community funds (spend + withdraw)   | -                     |

## Suggested Integration

1. Allow Donation - Send funds to treasury address

2. Proposal Creation - Member submits ProposeIntent

3. Administrator Panel - Oracle governance actions

4. Achievement Display - Read member completion records
