import "dotenv/config";
import { SetupTx, ScriptType } from "@sidan-lab/cardano-ambassador-tool";
import { resolveScriptHash } from "@meshsdk/core";
import { createProvider, createWallet } from "./wallet";
import {
  buildCatConstants,
  saveClientEnv,
  loadClientEnv,
  printClientEnv,
  CLIENT_ENV_PATH,
  RefTxInScripts,
  SetupUtxo,
  SetupState,
} from "./config";
import { prompt, promptMultiline, closePrompts } from "./prompts";

const TX_CONFIRM_DELAY_MS = 20_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForTx(provider: any, txHash: string) {
  console.log(`Waiting for tx ${txHash} to confirm...`);
  const MAX_RETRIES = 60;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const utxos = await provider.fetchUTxOs(txHash);
      if (utxos.length > 0) {
        console.log("Confirmed.");
        return;
      }
    } catch {
      // not yet available
    }
    await sleep(TX_CONFIRM_DELAY_MS);
  }
  throw new Error(`Transaction ${txHash} not confirmed after ${MAX_RETRIES * TX_CONFIRM_DELAY_MS / 1000}s`);
}

async function main() {
  console.log("=== Cardano Ambassador Tool Setup ===\n");

  // Step 0: Configuration from environment
  const network = process.env.NETWORK || "preprod";
  if (network !== "preprod" && network !== "mainnet") {
    console.error("Invalid NETWORK. Must be 'preprod' or 'mainnet'.");
    process.exit(1);
  }

  const apiKey = process.env.BLOCKFROST_API_KEY;
  if (!apiKey) {
    console.error("BLOCKFROST_API_KEY is required. Set it in .env or environment.");
    process.exit(1);
  }

  const keyWords = process.env.KEY_WORDS;
  if (!keyWords) {
    console.error("KEY_WORDS is required. Set it in .env or environment.");
    process.exit(1);
  }
  const words = keyWords.trim().split(/\s+/).filter(Boolean);
  if (words.length < 12) {
    console.error("Invalid KEY_WORDS. Expected at least 12 words.");
    process.exit(1);
  }

  const provider = createProvider(apiKey);
  const wallet = createWallet(network as "preprod" | "mainnet", provider, words);
  const address = await wallet.getChangeAddress();
  console.log(`\nWallet address: ${address}\n`);

  // Resume support: load previous progress
  const saved = loadClientEnv();
  if (saved) {
    console.log(`Found existing progress at ${CLIENT_ENV_PATH}`);
  }

  const resumeStepRaw = await prompt("Start from step (1-6) [1]: ");
  const resumeStep = parseInt(resumeStepRaw || "1") || 1;
  if (resumeStep < 1 || resumeStep > 6) {
    console.error("Invalid step. Must be between 1 and 6.");
    process.exit(1);
  }

  // Step 1: Collect setup UTxO hashes
  console.log("\n--- Step 1: Setup UTxO configuration ---");
  const counterTxHash = await prompt("UTxO txHash for counter mint: ");
  const counterTxIndex = parseInt(await prompt("UTxO output index [0]: ") || "0");
  if (isNaN(counterTxIndex) || counterTxIndex < 0) {
    console.error("Invalid counter output index.");
    process.exit(1);
  }

  const oracleTxHash = await prompt("UTxO txHash for oracle mint: ");
  const oracleTxIndex = parseInt(await prompt("UTxO output index [0]: ") || "0");
  if (isNaN(oracleTxIndex) || oracleTxIndex < 0) {
    console.error("Invalid oracle output index.");
    process.exit(1);
  }

  const counterSetupUtxo: SetupUtxo = { txHash: counterTxHash, outputIndex: counterTxIndex };
  const oracleSetupUtxo: SetupUtxo = { txHash: oracleTxHash, outputIndex: oracleTxIndex };

  // Load ref scripts from saved progress or initialize empty
  const emptyUtxo: SetupUtxo = { txHash: "0".repeat(64), outputIndex: 0 };
  const refTxInScripts: RefTxInScripts = saved?.refTxInScripts ?? {
    membershipIntent: { mint: { ...emptyUtxo }, spend: { ...emptyUtxo } },
    member: { mint: { ...emptyUtxo }, spend: { ...emptyUtxo } },
    proposeIntent: { mint: { ...emptyUtxo }, spend: { ...emptyUtxo } },
    proposal: { mint: { ...emptyUtxo }, spend: { ...emptyUtxo } },
    signOffApproval: { mint: { ...emptyUtxo }, spend: { ...emptyUtxo } },
    treasury: { spend: { ...emptyUtxo }, withdrawal: { ...emptyUtxo } },
  };

  const emptyZero: SetupUtxo = { txHash: "0".repeat(64), outputIndex: 0 };
  const state: SetupState = {
    network,
    apiKey,
    oracleSetupUtxo,
    counterSetupUtxo,
    oracleUtxo: saved?.oracleUtxo ?? { ...emptyZero },
    refTxInScripts,
  };

  const catConstants = buildCatConstants(
    network as "preprod" | "mainnet",
    oracleSetupUtxo,
    counterSetupUtxo,
    refTxInScripts,
  );

  // Save after step 1
  saveClientEnv(state);

  // Step 2: Mint Counter NFT
  if (resumeStep <= 2) {
    console.log("\n--- Step 2: Mint Counter NFT ---");
    const counterUtxos = await provider.fetchUTxOs(counterTxHash, counterTxIndex);
    if (!counterUtxos[0]) {
      console.error("Failed to fetch counter UTxO");
      process.exit(1);
    }
    const setup = new SetupTx(address, wallet, provider, catConstants);
    const mintCounterResult = await setup.mintCounterNFT(counterUtxos[0]);
    console.log(`Counter NFT minted. TxHash: ${mintCounterResult}`);
    await waitForTx(provider, mintCounterResult);
  } else {
    console.log("\n--- Step 2: Mint Counter NFT (skipped) ---");
  }

  // Step 3: Mint & Spend Oracle NFT
  if (resumeStep <= 3) {
    console.log("\n--- Step 3: Mint & Spend Oracle NFT ---");
    const oracleUtxos = await provider.fetchUTxOs(oracleTxHash, oracleTxIndex);
    if (!oracleUtxos[0]) {
      console.error("Failed to fetch oracle UTxO");
      process.exit(1);
    }
    const admins = await promptMultiline("Admin addresses (bech32):");
    const tenure = await prompt("Admin tenure (display only, e.g., 365d): ");
    const thresholdRaw = await prompt(`Multi-sig threshold (1-${admins.length}): `);
    const threshold = parseInt(thresholdRaw);
    if (isNaN(threshold) || threshold < 1 || threshold > admins.length) {
      console.error(`Invalid threshold. Must be between 1 and ${admins.length}.`);
      process.exit(1);
    }
    const setup = new SetupTx(address, wallet, provider, catConstants);
    const mintOracleResult = await setup.mintSpendOracleNFT(
      oracleUtxos[0],
      admins,
      tenure,
      threshold,
    );
    console.log(`Oracle NFT minted. TxHash: ${mintOracleResult}`);
    state.oracleUtxo = { txHash: mintOracleResult, outputIndex: 0 };
    saveClientEnv(state);
    await waitForTx(provider, mintOracleResult);
  } else {
    console.log("\n--- Step 3: Mint & Spend Oracle NFT (skipped) ---");
  }

  // Step 4: Spend Counter NFT
  if (resumeStep <= 4) {
    console.log("\n--- Step 4: Spend Counter NFT ---");
    const counterPolicyId = resolveScriptHash(catConstants.scripts.counter.mint.cbor, "V3");
    const walletUtxos = await wallet.getUtxos();
    const counterNftUtxo = walletUtxos.find((u) =>
      u.output.amount.some((a) => a.unit.startsWith(counterPolicyId))
    );
    if (!counterNftUtxo) {
      console.error("Failed to find counter NFT in wallet UTxOs");
      process.exit(1);
    }
    console.log(`Found counter NFT at ${counterNftUtxo.input.txHash}#${counterNftUtxo.input.outputIndex}`);
    const setup = new SetupTx(address, wallet, provider, catConstants);
    const spendCounterResult = await setup.spendCounterNFT(counterNftUtxo);
    console.log(`Counter NFT spent. TxHash: ${spendCounterResult}`);
    saveClientEnv(state);
    await waitForTx(provider, spendCounterResult);
  } else {
    console.log("\n--- Step 4: Spend Counter NFT (skipped) ---");
  }

  // Step 5: Register Certs
  if (resumeStep <= 5) {
    console.log("\n--- Step 5: Register Certificates ---");
    const setup = new SetupTx(address, wallet, provider, catConstants);
    const certsResult = await setup.registerAllCerts();
    console.log(`Certificates registered. TxHash: ${certsResult}`);
    await waitForTx(provider, certsResult);
  } else {
    console.log("\n--- Step 5: Register Certificates (skipped) ---");
  }

  // Step 6: Deploy Reference Scripts
  if (resumeStep <= 6) {
    console.log("\n--- Step 6: Deploy Reference Scripts ---");
    const destAddress = await prompt("Destination address for reference scripts: ");

    const scriptTypes = [
      { type: ScriptType.MembershipIntent, key: "membershipIntent" as const },
      { type: ScriptType.Member, key: "member" as const },
      { type: ScriptType.ProposeIntent, key: "proposeIntent" as const },
      { type: ScriptType.Proposal, key: "proposal" as const },
      { type: ScriptType.SignOffApproval, key: "signOffApproval" as const },
      { type: ScriptType.Treasury, key: "treasury" as const },
    ];

    for (const { type, key } of scriptTypes) {
      // Skip already-deployed scripts (loaded from saved progress)
      const existing = key === "treasury"
        ? refTxInScripts[key].spend
        : refTxInScripts[key].mint;
      if (existing.txHash !== "0".repeat(64)) {
        console.log(`  ${key}: ${existing.txHash} (already deployed, skipping)`);
        continue;
      }

      const setup = new SetupTx(address, wallet, provider, catConstants);
      const result = await setup.txOutScript(destAddress, type);
      const txHash = Object.values(result)[0] as string;
      console.log(`  ${key}: ${txHash}`);

      if (key === "treasury") {
        refTxInScripts[key].spend = { txHash, outputIndex: 0 };
        refTxInScripts[key].withdrawal = { txHash, outputIndex: 1 };
      } else {
        refTxInScripts[key].mint = { txHash, outputIndex: 0 };
        refTxInScripts[key].spend = { txHash, outputIndex: 1 };
      }

      // Save after each script deployment
      saveClientEnv(state);
      await waitForTx(provider, txHash);
    }
  }

  // Final save and print
  saveClientEnv(state);
  printClientEnv(state);

  closePrompts();
  console.log("\nSetup complete!");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
