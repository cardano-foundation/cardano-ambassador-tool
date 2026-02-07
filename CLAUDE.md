# Cardano Ambassador Tool

On-chain membership and treasury management system for Cardano ambassadors. Token-gated membership with multi-sig admin governance.

## Organization

| Property | Value |
|----------|-------|
| Org | `cardano-foundation` |
| GitHub | `cardano-foundation/cardano-ambassador-tool` |

## Commands

| Task | Command | Directory |
|------|---------|-----------|
| Dev (client) | `npm run dev` | `client/` |
| Dev (admin) | `npm run dev` | `admin-dashboard/` |
| Build (client) | `npm run build` | `client/` |
| Build (SDK) | `npm run build` | `off-chain/` |
| Build (contracts) | `aiken build` | `on-chain/` |
| Test (client) | `npm test` | `client/` |
| Test (e2e) | `npm run test:e2e` | `client/` |
| Lint | `npm run format` | `client/` |
| Type check | `npm run type-check` | `client/` |

## Conventions

| Convention | Description |
|------------|-------------|
| Commits | Conventional commits (commitlint enforced) |
| Formatting | Prettier with Tailwind plugin |
| Plutus data | JSON serialization via MeshSDK |
| State machine | NFT-gated UTxO state transitions |

## Code Map

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `on-chain/validators/` | Aiken smart contracts (Plutus v3) | `oracle/`, `member/`, `treasury/` |
| `off-chain/src/` | TypeScript SDK for tx building | `transactions/`, `lib/types.ts` |
| `client/src/app/` | Next.js 15 frontend (App Router) | `(home)/`, `manage/`, `my/` |
| `client/src/hooks/` | Custom React hooks | `useDatabase.ts`, `useWalletManager.ts` |
| `client/src/utils/` | Utility functions | `format.ts`, `error.ts` |
| `client/src/components/` | Shared UI components | `Navigation/`, `SignatureProgress/` |
| `client/src/lib/redux/` | Redux Store & Slices | `store.ts`, `features/` |
| `admin-dashboard/` | Admin panel (Next.js) | `src/pages/admin.tsx` |

## Entry Points

| Type | File | Description |
|------|------|-------------|
| Client | `client/src/app/layout.tsx` | Root layout with AppProvider |
| SDK | `off-chain/src/index.ts` | SDK exports |
| Contracts | `on-chain/plutus.json` | Compiled Plutus scripts |

## Flow

`User Wallet -> Client App -> Off-chain SDK -> MeshSDK -> Blockfrost -> Cardano L1 <- Aiken Validators`

## Key Files

| File | Why It Matters |
|------|----------------|
| `off-chain/src/lib/types.ts` | All Plutus datum types and converters |
| `off-chain/src/transactions/adminAction.ts` | Admin multi-sig tx builders |
| `off-chain/src/transactions/userAction.ts` | User tx builders (apply, propose) |
| `off-chain/src/lib/constant.ts` | CATConstants - script addresses and hashes |
| `client/src/lib/redux/store.ts` | Global state: wallet, members, proposals, auth |
| `client/src/hooks/useDatabase.ts` | IndexedDB sync for UTxO caching |
| `on-chain/validators/oracle/spend.ak` | Oracle validator - admin governance |

## Smart Contract Architecture

| Validator | Purpose | State NFT |
|-----------|---------|-----------|
| Oracle | Admin list, thresholds, script registry | `oracle.mint` |
| Counter | Member ID counter | `counter.mint` |
| MembershipIntent | Pending membership applications | `membershipIntent.mint` |
| Member | Active member records | `member.mint` |
| ProposeIntent | Pending project proposals | `proposeIntent.mint` |
| Proposal | Approved proposals awaiting sign-off | `proposal.mint` |
| SignOffApproval | Approved for treasury disbursement | `signOffApproval.mint` |
| Treasury | Community funds (donations) | (spend/withdraw) |

## State Transitions

```
MembershipIntent -> [approve] -> Member
                 -> [reject]  -> burned

ProposeIntent    -> [approve] -> Proposal -> [signoff] -> SignOffApproval -> [execute] -> Treasury withdrawal
                 -> [reject]  -> burned
```

## Invariants

| Rule | If Violated |
|------|-------------|
| Oracle NFT singleton | Multiple oracles break admin governance |
| Counter monotonic | Duplicate member IDs, state corruption |
| Multi-sig threshold | Admin actions require N-of-M signatures |
| Token ownership | Member actions require holding identity token |

## Data Representations

| Internal | External | Converter | Notes |
|----------|----------|-----------|-------|
| `MembershipMetadata` (Plutus) | `MemberData` (TS) | `getMembershipIntentDatum()` | Wallet address is PubKeyAddress struct |
| `ProposalMetadata` (Plutus) | `ProposalData` (TS) | `getProposalDatum()` | Long strings split to ByteString arrays |
| Strings >64 chars | `List<ByteString>` | `stringToBSArray()` | Plutus 64-byte limit per bytestring |

## Service Dependencies

| Direction | Service | Protocol | Purpose |
|-----------|---------|----------|---------|
| upstream | Blockfrost | REST API | Blockchain data, UTxO queries, tx submission |
| external | Cardano L1 | Plutus v3 | Smart contract execution |

## Code Dependencies

### This Repo Imports

| Package | Import Path | Purpose |
|---------|-------------|---------|
| MeshSDK | `@meshsdk/core`, `@meshsdk/core-csl` | Tx building, Plutus serialization |
| Aiken stdlib | `aiken-lang/stdlib` | Smart contract utilities |
| Vodka | `sidan-lab/vodka` | Aiken helper library |

### Imported By

| Consumer | What They Use |
|----------|---------------|
| `client/` | `@sidan-lab/cardano-ambassador-tool` SDK |
| `admin-dashboard/` | `@sidan-lab/cardano-ambassador-tool` SDK |

## Project Management

| Property | Value |
|----------|-------|
| Provider | `github` |
| Default Repo | `cardano-foundation/cardano-ambassador-tool` |
| Task Pattern | `#XXX` |

## Code Standards

| Language | Standard |
|----------|----------|
| TypeScript | `~/.claude/standards/typescript.md` |
| Aiken | Plutus v3, stdlib v2.2.0 |

## GitHub MCP

| Organization | Tool Prefix |
|--------------|-------------|
| cardano-foundation | `mcp__github__*` |

## Config

| Key | Value |
|-----|-------|
| Cache | `.claude/session/` |
| Gitignore | `.claude/session/` |
