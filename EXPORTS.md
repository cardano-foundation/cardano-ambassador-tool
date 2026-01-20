# @sidan-lab/cardano-ambassador-tool

TypeScript SDK for Cardano Ambassador Tool on-chain interactions.

## Package Info

| Property | Value |
|----------|-------|
| Import Path | `@sidan-lab/cardano-ambassador-tool` |
| Language | TypeScript |
| Type | library |
| Version | 0.0.10 |

## Exported Classes

| Class | File | Purpose |
|-------|------|---------|
| `Layer1Tx` | `lib/common.ts` | Base transaction builder with wallet/collateral handling |
| `SetupTx` | `transactions/setup.ts` | Initial deployment transactions |
| `UserActionTx` | `transactions/userAction.ts` | User transactions (apply, propose) |
| `AdminActionTx` | `transactions/adminAction.ts` | Admin multi-sig transactions |
| `CATConstants` | `lib/constant.ts` | Script addresses, hashes, network config |

## Exported Types

### Domain Types

| Type | File | Description |
|------|------|-------------|
| `MemberData` | `lib/types.ts` | Member profile (wallet, name, email, location) |
| `Member` | `lib/types.ts` | Full member record with token and completion history |
| `ProposalData` | `lib/types.ts` | Proposal metadata (title, description, funds) |
| `Proposal` | `lib/types.ts` | Full proposal with receiver and member reference |
| `StatsData` | `lib/types.ts` | Forum activity statistics |
| `ActivityData` | `lib/types.ts` | User activity record |
| `BadgeData` | `lib/types.ts` | Achievement badge |
| `SummaryData` | `lib/types.ts` | Stats with top replies/topics |

### Plutus Data Types

| Type | File | Description |
|------|------|-------------|
| `OracleDatum` | `lib/bar.ts` | Oracle state (admins, threshold, script refs) |
| `CounterDatum` | `lib/bar.ts` | Member counter state |
| `MembershipIntentDatum` | `lib/bar.ts` | Pending membership application |
| `MemberDatum` | `lib/bar.ts` | Active member on-chain state |
| `ProposalDatum` | `lib/bar.ts` | Proposal on-chain state |
| `MembershipMetadata` | `lib/types.ts` | Plutus-encoded member metadata |
| `ProposalMetadata` | `lib/types.ts` | Plutus-encoded proposal metadata |

### Config Types

| Type | File | Description |
|------|------|-------------|
| `SetupUtxos` | `lib/types.ts` | Oracle and counter UTxO references |
| `RefTxInScripts` | `lib/types.ts` | Reference script UTxO locations |
| `IProvider` | `lib/common.ts` | `IFetcher & ISubmitter` interface |
| `Network` | `lib/common.ts` | `"preprod" \| "mainnet"` |

## Exported Functions

### Datum Builders

| Function | Signature | Purpose |
|----------|-----------|---------|
| `oracleDatum` | `(admins, tenure, threshold, scripts) => OracleDatum` | Build oracle datum |
| `counterDatum` | `(count: number) => CounterDatum` | Build counter datum |
| `membershipIntentDatum` | `(policyId, assetName, metadata) => MembershipIntentDatum` | Build intent datum |
| `memberDatum` | `(policyId, assetName, completion, fundReceived, metadata) => MemberDatum` | Build member datum |
| `proposalDatum` | `(fundRequested, receiver, member, metadata) => ProposalDatum` | Build proposal datum |
| `membershipMetadata` | `(jsonData: MemberData) => MembershipMetadata` | Convert to Plutus format |
| `proposalMetadata` | `(jsonData: ProposalData) => ProposalMetadata` | Convert to Plutus format |

### Redeemer Builders

| Function | Signature | Purpose |
|----------|-----------|---------|
| `rotateAdmin` | `(newAdmins, tenure) => RotateAdmin` | Admin rotation redeemer |
| `updateThreshold` | `(threshold: number) => UpdateThreshold` | Threshold update redeemer |
| `applyMembership` | `(policyId, assetName, metadata) => ApplyMembership` | Membership application |
| `proposeProject` | `(fundRequested, receiver, member, metadata) => ProposeProject` | Project proposal |

### Datum Extractors

| Function | Signature | Purpose |
|----------|-----------|---------|
| `getOracleAdmins` | `(utxo: UTxO) => string[]` | Extract admin pubkey hashes |
| `getCounterDatum` | `(utxo: UTxO) => number` | Extract current count |
| `getMembershipIntentDatum` | `(utxo: UTxO) => { policyId, assetName, metadata }` | Parse intent UTxO |
| `getMemberDatum` | `(utxo: UTxO) => Member` | Parse member UTxO |
| `getProposalDatum` | `(utxo: UTxO) => Proposal` | Parse proposal UTxO |
| `updateOracleDatum` | `(utxo, newAdmins?, tenure?, threshold?) => OracleDatum` | Update oracle fields |
| `updateMemberDatum` | `(memberUtxo, signOffUtxo) => MemberDatum` | Add completion to member |

### Utilities

| Function | Signature | Purpose |
|----------|-----------|---------|
| `getTokenAssetNameByPolicyId` | `(utxo: UTxO, policyId: string) => string` | Find asset name in UTxO |
| `computeProposalMetadataHash` | `(metadata: ProposalMetadata) => string` | Blake2b hash for intent NFT |
| `getTreasuryChange` | `(utxos: UTxO[], fundRequested: number) => Asset[]` | Calculate treasury change |
| `sleep` | `(seconds: number) => Promise<void>` | Async delay utility |

## Exported Constants

| Constant | File | Value |
|----------|------|-------|
| `policyIdLength` | `lib/constant.ts` | `56` |
| `rMint` | `lib/types.ts` | `ConStr0([])` - mint redeemer |
| `rBurn` | `lib/types.ts` | `ConStr1([])` - burn redeemer |
| `incrementCount` | `lib/types.ts` | Counter increment redeemer |
| `stopOracle` | `lib/types.ts` | Oracle stop redeemer |
| `stopCounter` | `lib/types.ts` | Counter stop redeemer |
| `approveMember` | `lib/types.ts` | Member approval redeemer |
| `rejectMember` | `lib/types.ts` | Member rejection redeemer |
| `addMember` | `lib/types.ts` | Add member redeemer |
| `removeMember` | `lib/types.ts` | Remove member redeemer |
| `adminRemoveMember` | `lib/types.ts` | Admin remove redeemer |
| `approveProposal` | `lib/types.ts` | Proposal approval redeemer |
| `rejectProposal` | `lib/types.ts` | Proposal rejection redeemer |
| `mintProposal` | `lib/types.ts` | Mint proposal NFT redeemer |
| `approveSignOff` | `lib/types.ts` | Sign-off approval redeemer |
| `mintSignOffApproval` | `lib/types.ts` | Mint sign-off NFT redeemer |
| `processSignOff` | `lib/types.ts` | Process sign-off redeemer |
| `processMembershipIntent` | `lib/types.ts` | Process intent redeemer |
| `memberUpdateMetadata` | `lib/types.ts` | Member metadata update redeemer |

## Enums

| Enum | File | Values |
|------|------|--------|
| `ScriptType` | `transactions/setup.ts` | `MembershipIntent`, `Member`, `ProposeIntent`, `Proposal`, `SignOffApproval`, `Treasury` |

---

Internal structure: See `CLAUDE.md`
