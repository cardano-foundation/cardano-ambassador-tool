# Cardano Ambassador Tool

On-chain membership and treasury management system for Cardano ambassadors. Token-gated membership records, multi-sig admin governance, and an on-chain proposal/treasury workflow built on Cardano (Plutus v3, Aiken).

## Overview

This repository is a reference implementation of an on-chain ambassador program with three components:

| Part | Path | Purpose |
|------|------|---------|
| On-chain | `on-chain/` | Aiken validators (Plutus v3) for oracle, counter, member, proposal, treasury |
| Off-chain | `off-chain/` | TypeScript SDK (`@sidan-lab/cardano-ambassador-tool`) wrapping tx building via MeshSDK |
| Client | `client/` | Next.js 15 (App Router) frontend for members and admins |
| Setup | `setup-script/` | CLI for one-time deployment of NFTs, certs, and reference scripts |

### How it works

`User Wallet -> Client App -> Off-chain SDK -> MeshSDK -> Blockfrost -> Cardano L1 <- Aiken Validators`

State is held in singleton-NFT-gated UTxOs that move between validators:

```
MembershipIntent --[approve]--> Member
                 --[reject]--> burned

ProposeIntent    --[approve]--> Proposal --[signoff]--> SignOffApproval --[execute]--> Treasury withdrawal
                 --[reject]--> burned
```

Admin actions (approve/reject, treasury withdrawal, oracle updates) require an N-of-M multi-signature threshold defined in the Oracle datum.

### Repository layout

| Directory | Contents |
|-----------|----------|
| `on-chain/validators/` | Aiken smart contracts: `oracle/`, `counter/`, `membership_intent/`, `member/`, `propose_intent/`, `proposal/`, `sign_off_approval/`, `treasury/` |
| `off-chain/src/` | SDK source: `transactions/` (tx builders), `lib/` (types, constants) |
| `client/src/app/` | App Router routes: `(home)/`, `(onboarding)/sign-up`, `manage/` (admin), `my/` (member) |
| `setup-script/src/` | Deployment CLI: `index.ts` (initial setup), `rotateAdmin.ts`, `operatorSignSubmit.ts` |

### Requirements

- Node.js 20+
- A Blockfrost API key (preprod or mainnet)
- A Cardano wallet (Eternl, Nami, Lace, or any CIP-30 wallet) for end users
- A funded operator wallet for one-time setup

---

## Setup Guide

This walks through deploying contracts and bringing up the client from scratch.

### 1. Install workspaces

```sh
# Build the SDK (consumed by client + setup-script)
cd off-chain && npm install && npm run build

# Compile validators (produces on-chain/plutus.json)
cd ../on-chain && aiken build

# Install client
cd ../client && npm install

# Install setup CLI
cd ../setup-script && npm install
```

### 2. Configure the setup CLI

Create `setup-script/.env` with the variables shown in `setup-script/.env.example`:

| Variable | Value |
|----------|-------|
| `NETWORK` | `preprod` or `mainnet` |
| `BLOCKFROST_API_KEY` | Blockfrost project ID |
| `KEY_WORDS` | Operator wallet recovery phrase, space-separated (12+ entries) |

Treat the operator credential as sensitive — never commit it. The operator wallet must be funded with enough ADA to cover two min-UTxO setup inputs (one for the counter NFT, one for the oracle NFT) plus fees for ~9 transactions (counter mint, oracle mint+spend, counter spend, cert registration, six reference-script deploys).

### 3. Run the setup script

```sh
cd setup-script
npm run setup
```

The CLI runs six steps (resumable — re-running picks up from `client.env`):

| Step | Action |
|------|--------|
| 1 | Collect two operator UTxOs (txHash + index) used to mint the counter and oracle NFTs |
| 2 | Mint the counter NFT |
| 3 | Mint the oracle NFT, spending it into the oracle validator with the initial admin list, tenure label, and multi-sig threshold |
| 4 | Spend the counter NFT into the counter validator |
| 5 | Register stake/withdrawal certificates for all validators |
| 6 | Deploy reference scripts (membershipIntent, member, proposeIntent, proposal, signOffApproval, treasury) to a destination address |

When prompted at step 3, supply admin bech32 addresses (one per line, blank line ends input), a tenure label (display only, e.g. `365d`), and a threshold ≤ admin count.

The CLI writes a populated `client.env` containing the resulting `CATConstants` (script addresses, policy IDs, ref-script UTxOs). Copy these into `client/.env`.

### 4. Configure the client

Create `client/.env` based on `client/.env.example`:

```sh
NEXT_PUBLIC_NETWORK=preprod
BLOCKFROST_API_KEY_PREPROD=
BLOCKFROST_API_KEY_MAINNET=
NEXT_PUBLIC_AMBASSADOR_POLICY_ID=         # policy ID of the NFT collection used to gate membership
NEXT_PUBLIC_GITHUB_REPO=                  # for in-app docs links (optional)
NEXT_PUBLIC_GITHUB_BRANCH=
CARDANO_FORUM_API_KEY=                    # optional, for forum integration
CARDANO_FORUM_API_USERNAME=system
```

Plus the script addresses, policy IDs, and reference-script UTxOs emitted by the setup CLI.

### 5. Run the client

```sh
cd client
npm run dev          # http://localhost:3000
npm run build        # production build
npm run type-check   # TypeScript check
npm run format       # Prettier
npm test             # Jest
npm run test:e2e     # Playwright
```

### 6. Rotating admins (post-setup)

```sh
cd setup-script
npm run rotate-admin           # builds an admin-rotation tx
npm run operator-sign-submit   # collects signatures and submits
```

Admin rotation is a multi-sig oracle update — the existing threshold of admins must sign before the new admin list takes effect.

---

## Admin Guide

Admins govern the program through multi-sig approvals. The Oracle datum holds the admin list and the minimum number of signatures (`minSigners`) required for any admin action.

### Roles

- Approve or reject membership applications
- Approve or reject funding proposals
- Sign off on treasury withdrawals (two-step)
- Rotate the admin list and threshold (via setup CLI)

### Multi-sig model

- The first admin to act on a pending item **sets the decision** (approve or reject) and signs.
- Subsequent admins can only **second** the existing decision — they cannot flip it.
- Once `minSigners` signatures accumulate, the decision is finalized on-chain.

### Membership applications

`Manage` → `Membership Applications`

1. Open a pending application; review applicant info (name, email, bio, socials) and the NFT used to identify them.
2. As the first admin: click `Approve` or `Reject` and sign.
3. As a subsequent admin: click `Approve` or `Reject` matching the existing decision; you cannot disagree on-chain.
4. When the threshold is reached, approved applications produce a `Member` UTxO; rejected applications burn the intent NFT.

The applicant's NFT stays in their wallet — it is not locked in any contract, but must remain present to evidence membership.

### Proposal applications

`Manage` → `Proposal Applications`

For each pending proposal review:

- Title, description, funding amount (lovelace), receiver address
- Proposer identity and submission date

Approve/reject flow is identical to membership applications. Once the first admin signs, the proposer can no longer edit.

### Treasury sign-offs (two-step)

Releasing funds requires two distinct phases:

**Step 1 — Initial Approval Sign-off (multi-sig)**
- Open the approved proposal page → "Treasury Withdrawal Approval".
- Each admin signs `Sign for Treasury Withdrawal` until `minSigners` is reached.
- This produces a `SignOffApproval` UTxO authorizing the withdrawal.

**Step 2 — Final Withdrawal (single-sig execution)**
- `Manage` → `Treasury Sign-offs`.
- Pick a proposal flagged "Ready for Withdrawal".
- Verify amount and receiver address one final time, then `Execute Final Signoff`.
- A single admin submits the withdrawal tx; funds release to the receiver.

### Oracle / system configuration

`minSigners` and the admin list live in the Oracle UTxO. Changing them requires a multi-sig oracle-spend transaction, executed via the setup CLI's `rotate-admin` workflow. Threshold changes affect new submissions only.

### Operational guidelines

- Always verify receiver addresses and amounts before signing — withdrawals are irreversible.
- Keep at least 5 ADA in the admin wallet for fees.
- After signing, allow 1–2 minutes for confirmation, then use the in-app refresh button.
- Never share your wallet recovery phrase, including with other admins.

---

## Member Guide

This program is run in partnership with [Andamio](https://www.andamio.io/). Onboarding is gated by an Andamio-issued token: each prospective ambassador must bring their own Andamio token to apply.

Members apply through the client, then can submit and edit proposals while they remain unsigned.

### Prerequisites

- A CIP-30 wallet (Eternl, Nami, Lace, etc.) on the configured network.
- ≥ 5 ADA for fees and min-UTxO.
- An **Andamio token** in your wallet, issued through the Andamio onboarding partnership. This token is used to identify your membership and must remain in your wallet — it is never locked by the contract. The expected policy ID is configured via `NEXT_PUBLIC_AMBASSADOR_POLICY_ID`.

### Applying for membership

1. Visit `/sign-up` (or click "Become an Ambassador" in the nav).
2. Connect your wallet and confirm the network.
3. Select the NFT in your wallet to use as your member token.
4. Fill out the application form. All fields are written on-chain.
   - Required: Full Name, Display Name, Email, Bio
   - Optional: Country, City, X handle, GitHub, Discord, SPO ID, DRep ID
5. Submit and sign in your wallet. Wait 20–60 seconds for confirmation.
6. Track status under `My` → `Submissions` (Pending / Approved / Rejected, with admin signature progress).

You can edit a pending application from `Submissions` until the first admin signs — after that, edits are locked.

### Submitting a proposal

After your application is approved:

1. `Proposals` → `New Proposal` (or visit `/proposals/new`).
2. Enter title, description (rich text), funding amount in lovelace, and receiver address.
3. Submit and sign.
4. View and edit drafts in `My` → `Submissions`. Edits are locked once the first admin signs.

### Following up

- The global refresh button in the top nav re-syncs UTxO state from Blockfrost.
- Use it after submitting a tx, or when signature counts look stale.
- All transactions are on-chain and irreversible — review carefully before signing.

### Member dashboard

| Page | Purpose |
|------|---------|
| `/my/profile` | Your member record (editable while pending) |
| `/my/submissions` | Membership and proposal submissions you've made |
| `/my/proposals` | Proposals where you are the proposer |
| `/proposals` | All proposals across the program |
| `/ambassadors` | Public ambassador directory |
| `/treasury-payouts` | History of treasury withdrawals |

---

## Conventions

| Convention | Description |
|------------|-------------|
| Commits | [Conventional Commits](https://www.conventionalcommits.org/) (commitlint enforced) |
| Formatting | Prettier with Tailwind plugin |
| Plutus data | JSON serialization via MeshSDK |
| TypeScript | See `~/.claude/standards/typescript.md` |
| Aiken | Plutus v3, stdlib v2.2.0, vodka v0.1.13 |

## License

Apache-2.0 (see `LICENSE`).
