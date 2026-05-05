import "dotenv/config";
import { createProvider, createWallet } from "./wallet";
import { promptMultiline, closePrompts } from "./prompts";

async function main() {
  console.log("=== Operator Sign & Submit ===\n");

  const network = process.env.NETWORK;
  if (network !== "preprod" && network !== "mainnet") {
    console.error(`NETWORK must be "preprod" or "mainnet", got: ${JSON.stringify(network)}.`);
    process.exit(1);
  }

  const apiKey = process.env.BLOCKFROST_API_KEY;
  if (!apiKey) {
    console.error("BLOCKFROST_API_KEY is required. Set it in .env or environment.");
    process.exit(1);
  }

  const keyWords = process.env.KEY_WORDS;
  if (!keyWords) {
    console.error("KEY_WORDS is required (operator mnemonic).");
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
  console.log(`Operator address: ${address}\n`);

  const lines = await promptMultiline("Paste tx CBOR hex (single line or wrap; finish with empty line):");
  const txHex = lines.join("").replace(/\s+/g, "");
  if (!txHex) {
    console.error("No CBOR provided.");
    process.exit(1);
  }
  if (!/^[0-9a-f]+$/i.test(txHex)) {
    console.error("Input is not valid hex.");
    process.exit(1);
  }

  console.log(`\nReceived ${txHex.length / 2} bytes of tx CBOR.`);

  console.log("Partial-signing with operator wallet...");
  const signedTx = await wallet.signTx(txHex, true);

  console.log("signedTx", signedTx);
  

  // console.log("Submitting...");
  // const txHash = await wallet.submitTx(signedTx);
  // console.log(`\nSubmitted. Tx hash: ${txHash}`);

  closePrompts();
}

main().catch((err) => {
  console.error("Operator sign & submit failed:", err);
  process.exit(1);
});
