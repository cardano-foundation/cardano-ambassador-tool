import "dotenv/config";
import { AdminActionTx } from "@sidan-lab/cardano-ambassador-tool";
import { deserializeAddress } from "@meshsdk/core";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createProvider, createWallet } from "./wallet";
import {
  buildCatConstants,
  loadClientEnv,
  CLIENT_ENV_PATH,
} from "./config";
import { prompt, promptMultiline, closePrompts } from "./prompts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ZERO_HASH = "0".repeat(64);

function assertBech32Addresses(label: string, values: string[], expectedNetwork: "preprod" | "mainnet") {
  const expectedPrefix = expectedNetwork === "mainnet" ? "addr1" : "addr_test1";
  for (const v of values) {
    if (!v.startsWith(expectedPrefix)) {
      console.error(
        `Invalid ${label} entry: "${v}". Expected a ${expectedNetwork} bech32 address (prefix "${expectedPrefix}").`,
      );
      process.exit(1);
    }
    try {
      const { pubKeyHash } = deserializeAddress(v);
      if (!pubKeyHash) {
        console.error(`Invalid ${label} entry: "${v}". Address has no payment pubKeyHash (script address?).`);
        process.exit(1);
      }
    } catch (e) {
      console.error(`Invalid ${label} entry: "${v}". Failed to parse: ${(e as Error).message}`);
      process.exit(1);
    }
  }
}

function addressToPubKeyHash(label: string, value: string, expectedNetwork: "preprod" | "mainnet"): string {
  const expectedPrefix = expectedNetwork === "mainnet" ? "addr1" : "addr_test1";
  if (!value.startsWith(expectedPrefix)) {
    console.error(
      `Invalid ${label} entry: "${value}". Expected a ${expectedNetwork} bech32 address (prefix "${expectedPrefix}").`,
    );
    process.exit(1);
  }
  try {
    const { pubKeyHash } = deserializeAddress(value);
    if (!pubKeyHash) {
      console.error(`Invalid ${label} entry: "${value}". Address has no payment pubKeyHash (script address?).`);
      process.exit(1);
    }
    return pubKeyHash;
  } catch (e) {
    console.error(`Invalid ${label} entry: "${value}". Failed to parse: ${(e as Error).message}`);
    process.exit(1);
  }
}

async function main() {
  console.log("=== Cardano Ambassador Tool: Rotate Admin ===\n");

  const network = process.env.NETWORK;
  if (network !== "preprod" && network !== "mainnet") {
    console.error(
      `NETWORK must be "preprod" or "mainnet", got: ${JSON.stringify(network)}.`,
    );
    process.exit(1);
  }

  const apiKey = process.env.BLOCKFROST_API_KEY;
  if (!apiKey) {
    console.error("BLOCKFROST_API_KEY is required. Set it in .env or environment.");
    process.exit(1);
  }

  const keyWords = process.env.KEY_WORDS;
  if (!keyWords) {
    console.error("KEY_WORDS is required (operator/fee-payer mnemonic).");
    process.exit(1);
  }
  const words = keyWords.trim().split(/\s+/).filter(Boolean);
  if (words.length < 12) {
    console.error("Invalid KEY_WORDS. Expected at least 12 words.");
    process.exit(1);
  }

  const saved = loadClientEnv();
  if (!saved) {
    console.error(`Setup state not found at ${CLIENT_ENV_PATH}. Run \`npm run setup\` first.`);
    process.exit(1);
  }
  if (
    !saved.oracleUtxo ||
    saved.oracleUtxo.txHash === ZERO_HASH ||
    !saved.oracleSetupUtxo ||
    !saved.counterSetupUtxo ||
    !saved.refTxInScripts
  ) {
    console.error(`Setup state in ${CLIENT_ENV_PATH} is incomplete (need oracle/counter setup UTxOs, current oracle UTxO, and ref scripts).`);
    process.exit(1);
  }

  const provider = createProvider(apiKey);
  const wallet = createWallet(network as "preprod" | "mainnet", provider, words);
  const address = await wallet.getChangeAddress();
  console.log(`Operator (fee-payer) address: ${address}`);
  console.log(`Current oracle UTxO ref: ${saved.oracleUtxo.txHash}#${saved.oracleUtxo.outputIndex}\n`);

  const catConstants = buildCatConstants(
    network as "preprod" | "mainnet",
    saved.oracleSetupUtxo,
    saved.counterSetupUtxo,
    saved.refTxInScripts,
  );

  const oracleUtxos = await provider.fetchUTxOs(
    saved.oracleUtxo.txHash,
    saved.oracleUtxo.outputIndex,
  );
  if (!oracleUtxos[0]) {
    console.error(
      `Oracle UTxO not found on-chain at ${saved.oracleUtxo.txHash}#${saved.oracleUtxo.outputIndex}. ` +
      `It may already have been spent. Update NEXT_PUBLIC_ORACLE_TX_HASH/INDEX in ${CLIENT_ENV_PATH} to the latest oracle UTxO.`,
    );
    process.exit(1);
  }
  const oracleUtxo = oracleUtxos[0];

  const adminSignedAddrs = await promptMultiline(
    `Current admin signer addresses (≥ multi-sig threshold). Bech32, network: ${network}:`,
  );
  if (adminSignedAddrs.length === 0) {
    console.error("At least one current admin signer is required.");
    process.exit(1);
  }
  const adminSigned = adminSignedAddrs.map((a) =>
    addressToPubKeyHash("current admin signer", a, network as "preprod" | "mainnet"),
  );

  const newAdmins = await promptMultiline(
    `New admins as bech32 addresses (validator requires ALL of them to sign). Network: ${network}:`,
  );
  if (newAdmins.length === 0) {
    console.error("At least one new admin is required.");
    process.exit(1);
  }
  assertBech32Addresses("new admin", newAdmins, network as "preprod" | "mainnet");

  const newAdminsTenure = await prompt("New admin tenure (display only, e.g., 365d): ");

  const adminAction = new AdminActionTx(address, wallet, provider, catConstants);
  const { txHex } = await adminAction.rotateAdmin(
    oracleUtxo,
    adminSigned,
    newAdmins,
    newAdminsTenure,
  );

  const outPath = path.resolve(__dirname, "../rotate-admin-tx.hex");
  fs.writeFileSync(outPath, txHex);

  console.log("\n=== Unsigned tx built ===");
  console.log(`Tx hex saved to: ${outPath}`);
  console.log("\nSignatures required:");
  console.log(`  - Current admins (≥ threshold):`);
  for (let i = 0; i < adminSignedAddrs.length; i++) {
    console.log(`      ${adminSignedAddrs[i]}  (pkh: ${adminSigned[i]})`);
  }
  console.log(`  - New admins (ALL):`);
  for (const a of newAdmins) console.log(`      ${a}`);
  console.log(
    `\nAfter the tx is submitted and confirmed, update NEXT_PUBLIC_ORACLE_TX_HASH (and OUTPUT_INDEX=0) in ${CLIENT_ENV_PATH} to the new tx hash.`,
  );

  closePrompts();
}

main().catch((err) => {
  console.error("Rotate admin failed:", err);
  process.exit(1);
});
