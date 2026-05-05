# Vercel Deployment via GitHub Actions

This repo deploys the `client/` Next.js app to Vercel from GitHub Actions instead of Vercel's built-in Git integration. This lets repo maintainers manage all environment variables through **GitHub Secrets** without needing access to the Vercel dashboard.

We name the two deployment tracks after the Cardano network they target — **mainnet** (live) and **preprod** (testing).

- `client/vercel.json` sets `git.deploymentEnabled: false`, which disables Vercel's automatic Git deploys.
- `.github/workflows/vercel-mainnet.yml` deploys `main` against the Cardano **mainnet** (uploads as a Vercel production deployment).
- `.github/workflows/vercel-preprod.yml` deploys every other branch against the Cardano **preprod** network (uploads as a Vercel preview deployment).

`NEXT_PUBLIC_NETWORK` is hardcoded inside each workflow (`mainnet` or `preprod`) so the file name accurately reflects the target network. You don't need to set it as a secret.

Both workflows follow the [official Vercel + GitHub Actions guide](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel): `vercel pull` → `vercel build` → `vercel deploy --prebuilt`.

## Required GitHub Secrets

Add all of these under **Repo Settings → Secrets and variables → Actions → New repository secret**.

### Vercel CLI authentication (3)

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel dashboard → top-right avatar → **Account Settings** → **Tokens** → **Create Token**. Scope it to the `cardano-foundation` team and set a reasonable expiry. Copy once — it cannot be revealed again. |
| `VERCEL_ORG_ID` | Vercel dashboard → switch to the **cardano-foundation** team → **Settings** → **General** → copy **Team ID**. (Alternative: `vercel link`, see below.) |
| `VERCEL_PROJECT_ID` | Open the project in the dashboard → **Settings** → **General** → copy **Project ID**. (Alternative: `vercel link`, see below.) |

### Build & runtime env vars (9)

These are read by the Next.js app. `NEXT_PUBLIC_*` are baked into the browser bundle at build time; the rest are server-side only.

| Secret | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_AMBASSADOR_POLICY_ID` | sign-up page | Cardano native token policy ID |
| `NEXT_PUBLIC_GITHUB_REPO` | proposal pages | `owner/repo` for proposal storage |
| `NEXT_PUBLIC_GITHUB_BRANCH` | proposal pages | branch name |
| `BLOCKFROST_API_KEY_PREPROD` | `/api/*` routes | server-side only |
| `BLOCKFROST_API_KEY_PREVIEW` | `/api/blockfrost/*` | server-side only |
| `BLOCKFROST_API_KEY_TESTNET` | `/api/blockfrost/*` | server-side only |
| `BLOCKFROST_API_KEY_MAINNET` | `/api/*` routes | server-side only |
| `CARDANO_FORUM_API_KEY` | ambassador service | server-side only |
| `CARDANO_FORUM_API_USERNAME` | ambassador service | typically `system` |

> `NEXT_PUBLIC_NETWORK` is **not** a secret — it's hardcoded inside each workflow file (`mainnet` for `vercel-mainnet.yml`, `preprod` for `vercel-preprod.yml`).

> Each env var is consumed twice in the workflow: at `vercel build` time (so Next.js can inline `NEXT_PUBLIC_*` and run server bundling), and via `vercel deploy --env KEY=...` (so server-side vars exist at runtime in the deployed function). This avoids needing to set anything in the Vercel project settings.

## Alternative: get the IDs via `vercel link`

The dashboard route above is the easiest. If you'd rather use the CLI (e.g. you already have it installed for local deploys), run this once on your laptop:

```bash
npm install --global vercel@latest

cd client
vercel login           # authenticate (opens browser)
vercel link            # pick the cardano-foundation team and the existing project

cat .vercel/project.json
# {
#   "orgId":     "team_xxxxxxxxxxxx",   <-- VERCEL_ORG_ID
#   "projectId": "prj_xxxxxxxxxxxxxx"   <-- VERCEL_PROJECT_ID
# }
```

The `.vercel/` folder is git-ignored — do **not** commit it. Just copy the two IDs into GitHub Secrets.

## Triggering a deployment

| Action | Trigger |
|---|---|
| Mainnet (live) | Push or merge to `main` **that touches `client/**` or the workflow file** |
| Preprod (testing) | Push to any branch other than `main` **that touches `client/**` or the workflow file** |
| Manual | **Actions → Vercel Mainnet/Preprod Deployment → Run workflow** (ignores the path filter) |

The workflows use a `paths:` filter so changes to `on-chain/`, `off-chain/`, or `setup-script/` don't trigger a Vercel deploy — the client only consumes the SDK from npm (`@sidan-lab/cardano-ambassador-tool`), so SDK source changes don't affect the deployed bundle until they're published and the client's `package.json` is bumped (which lives under `client/`, so it's already covered).

If you ever need to redeploy without a code change (e.g. after rotating a secret), use the **Run workflow** button on the Actions tab — `workflow_dispatch` bypasses the path filter.

Each workflow run will:
1. `vercel pull` — fetch project framework config (no env vars are pulled from Vercel; we override locally).
2. `vercel build` — run `next build` inside the runner with all env vars from GitHub Secrets present in `process.env`.
3. `vercel deploy --prebuilt --env ...` — upload the built artifact and attach runtime env vars to the deployment.

The mainnet workflow passes `--prod` to Vercel, so `main` updates the project's primary domain. The preprod workflow uploads as a Vercel preview deployment, getting a unique branch URL.

## Why disable Vercel's Git auto-deploys?

Without `vercel.json`'s `git.deploymentEnabled: false`, every push would trigger **two** deployments — one from Vercel's GitHub integration (which uses the dashboard's env vars) and one from our GitHub Action. The `vercel.json` setting keeps the project linked (so `vercel deploy` from CI still works) while turning off Git auto-deploys.

If you ever need to revert to Vercel-managed deploys, delete or edit `client/vercel.json`.

## Rotating secrets

- **`VERCEL_TOKEN`**: revoke in Account Settings → Tokens, generate a new one, update the GitHub Secret. No code changes needed.
- **Blockfrost / Forum keys**: update the GitHub Secret. The next deployment picks up the new value.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Error: Project not found` on `vercel pull` | `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID` is wrong, or the token doesn't have access to that team |
| Build succeeds but `NEXT_PUBLIC_*` vars are `undefined` in the browser | The secret is missing from the workflow's `env:` block (must be present at `vercel build` time, not just `vercel deploy`) |
| Server-side var works locally but is `undefined` in production | The secret is missing from the `--env KEY=...` flags on `vercel deploy` |
| Two deployments fire per push | `client/vercel.json` is missing or `git.deploymentEnabled` is not `false` |
| App shows wrong network in the UI | `NEXT_PUBLIC_NETWORK` literal at the top of the workflow doesn't match the file's intent — confirm `mainnet` in `vercel-mainnet.yml` and `preprod` in `vercel-preprod.yml` |
