import { CATConstants } from "@sidan-lab/cardano-ambassador-tool";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CLIENT_ENV_PATH = path.resolve(__dirname, "../.env.setup");

export interface SetupUtxo {
  txHash: string;
  outputIndex: number;
}

export interface RefTxInScripts {
  membershipIntent: { mint: SetupUtxo; spend: SetupUtxo };
  member: { mint: SetupUtxo; spend: SetupUtxo };
  proposeIntent: { mint: SetupUtxo; spend: SetupUtxo };
  proposal: { mint: SetupUtxo; spend: SetupUtxo };
  signOffApproval: { mint: SetupUtxo; spend: SetupUtxo };
  treasury: { spend: SetupUtxo; withdrawal: SetupUtxo };
}

export function buildCatConstants(
  network: "preprod" | "mainnet",
  oracleSetupUtxo: SetupUtxo,
  counterSetupUtxo: SetupUtxo,
  refTxInScripts: RefTxInScripts,
): CATConstants {
  return new CATConstants(
    network,
    { oracle: oracleSetupUtxo, counter: counterSetupUtxo },
    refTxInScripts,
  );
}

export interface SetupState {
  network: string;
  apiKey: string;
  oracleSetupUtxo: SetupUtxo;
  counterSetupUtxo: SetupUtxo;
  refTxInScripts: RefTxInScripts;
}

function buildClientEnv(state: SetupState): string {
  const { network, apiKey, oracleSetupUtxo, counterSetupUtxo, refTxInScripts } = state;
  return `# Network
NEXT_PUBLIC_NETWORK=${network}
BLOCKFROST_API_KEY_PREPROD=${network === "preprod" ? apiKey : ""}
BLOCKFROST_API_KEY_MAINNET=${network === "mainnet" ? apiKey : ""}

# Setup UTxOs
NEXT_PUBLIC_ORACLE_SETUP_TX_HASH=${oracleSetupUtxo.txHash}
NEXT_PUBLIC_ORACLE_SETUP_OUTPUT_INDEX=${oracleSetupUtxo.outputIndex}
NEXT_PUBLIC_COUNTER_SETUP_TX_HASH=${counterSetupUtxo.txHash}
NEXT_PUBLIC_COUNTER_SETUP_OUTPUT_INDEX=${counterSetupUtxo.outputIndex}

# Reference Transaction Scripts - Membership Intent
NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_TX_HASH=${refTxInScripts.membershipIntent.mint.txHash}
NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_OUTPUT_INDEX=${refTxInScripts.membershipIntent.mint.outputIndex}
NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_TX_HASH=${refTxInScripts.membershipIntent.spend.txHash}
NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_OUTPUT_INDEX=${refTxInScripts.membershipIntent.spend.outputIndex}

# Reference Transaction Scripts - Member
NEXT_PUBLIC_MEMBER_MINT_TX_HASH=${refTxInScripts.member.mint.txHash}
NEXT_PUBLIC_MEMBER_MINT_OUTPUT_INDEX=${refTxInScripts.member.mint.outputIndex}
NEXT_PUBLIC_MEMBER_SPEND_TX_HASH=${refTxInScripts.member.spend.txHash}
NEXT_PUBLIC_MEMBER_SPEND_OUTPUT_INDEX=${refTxInScripts.member.spend.outputIndex}

# Reference Transaction Scripts - Propose Intent
NEXT_PUBLIC_PROPOSE_INTENT_MINT_TX_HASH=${refTxInScripts.proposeIntent.mint.txHash}
NEXT_PUBLIC_PROPOSE_INTENT_MINT_OUTPUT_INDEX=${refTxInScripts.proposeIntent.mint.outputIndex}
NEXT_PUBLIC_PROPOSE_INTENT_SPEND_TX_HASH=${refTxInScripts.proposeIntent.spend.txHash}
NEXT_PUBLIC_PROPOSE_INTENT_SPEND_OUTPUT_INDEX=${refTxInScripts.proposeIntent.spend.outputIndex}

# Reference Transaction Scripts - Proposal
NEXT_PUBLIC_PROPOSAL_MINT_TX_HASH=${refTxInScripts.proposal.mint.txHash}
NEXT_PUBLIC_PROPOSAL_MINT_OUTPUT_INDEX=${refTxInScripts.proposal.mint.outputIndex}
NEXT_PUBLIC_PROPOSAL_SPEND_TX_HASH=${refTxInScripts.proposal.spend.txHash}
NEXT_PUBLIC_PROPOSAL_SPEND_OUTPUT_INDEX=${refTxInScripts.proposal.spend.outputIndex}

# Reference Transaction Scripts - Sign Off Approval
NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_TX_HASH=${refTxInScripts.signOffApproval.mint.txHash}
NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_OUTPUT_INDEX=${refTxInScripts.signOffApproval.mint.outputIndex}
NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_TX_HASH=${refTxInScripts.signOffApproval.spend.txHash}
NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_OUTPUT_INDEX=${refTxInScripts.signOffApproval.spend.outputIndex}

# Reference Transaction Scripts - Treasury
NEXT_PUBLIC_TREASURY_SPEND_TX_HASH=${refTxInScripts.treasury.spend.txHash}
NEXT_PUBLIC_TREASURY_SPEND_OUTPUT_INDEX=${refTxInScripts.treasury.spend.outputIndex}
NEXT_PUBLIC_TREASURY_WITHDRAWAL_TX_HASH=${refTxInScripts.treasury.withdrawal.txHash}
NEXT_PUBLIC_TREASURY_WITHDRAWAL_OUTPUT_INDEX=${refTxInScripts.treasury.withdrawal.outputIndex}
`;
}

export function saveClientEnv(state: SetupState) {
  const envContent = buildClientEnv(state);
  fs.writeFileSync(CLIENT_ENV_PATH, envContent);
  console.log(`Saved progress to ${CLIENT_ENV_PATH}`);
}

export function loadClientEnv(): Partial<SetupState> | null {
  if (!fs.existsSync(CLIENT_ENV_PATH)) return null;

  const content = fs.readFileSync(CLIENT_ENV_PATH, "utf-8");
  const vars: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) vars[match[1]] = match[2];
  }

  const emptyUtxo: SetupUtxo = { txHash: "0".repeat(64), outputIndex: 0 };

  function utxo(hashKey: string, indexKey: string): SetupUtxo {
    const txHash = vars[hashKey];
    if (!txHash || txHash === "0".repeat(64)) return { ...emptyUtxo };
    return { txHash, outputIndex: parseInt(vars[indexKey] || "0") };
  }

  return {
    network: vars["NEXT_PUBLIC_NETWORK"],
    oracleSetupUtxo: utxo("NEXT_PUBLIC_ORACLE_SETUP_TX_HASH", "NEXT_PUBLIC_ORACLE_SETUP_OUTPUT_INDEX"),
    counterSetupUtxo: utxo("NEXT_PUBLIC_COUNTER_SETUP_TX_HASH", "NEXT_PUBLIC_COUNTER_SETUP_OUTPUT_INDEX"),
    refTxInScripts: {
      membershipIntent: {
        mint: utxo("NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_TX_HASH", "NEXT_PUBLIC_MEMBERSHIP_INTENT_MINT_OUTPUT_INDEX"),
        spend: utxo("NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_TX_HASH", "NEXT_PUBLIC_MEMBERSHIP_INTENT_SPEND_OUTPUT_INDEX"),
      },
      member: {
        mint: utxo("NEXT_PUBLIC_MEMBER_MINT_TX_HASH", "NEXT_PUBLIC_MEMBER_MINT_OUTPUT_INDEX"),
        spend: utxo("NEXT_PUBLIC_MEMBER_SPEND_TX_HASH", "NEXT_PUBLIC_MEMBER_SPEND_OUTPUT_INDEX"),
      },
      proposeIntent: {
        mint: utxo("NEXT_PUBLIC_PROPOSE_INTENT_MINT_TX_HASH", "NEXT_PUBLIC_PROPOSE_INTENT_MINT_OUTPUT_INDEX"),
        spend: utxo("NEXT_PUBLIC_PROPOSE_INTENT_SPEND_TX_HASH", "NEXT_PUBLIC_PROPOSE_INTENT_SPEND_OUTPUT_INDEX"),
      },
      proposal: {
        mint: utxo("NEXT_PUBLIC_PROPOSAL_MINT_TX_HASH", "NEXT_PUBLIC_PROPOSAL_MINT_OUTPUT_INDEX"),
        spend: utxo("NEXT_PUBLIC_PROPOSAL_SPEND_TX_HASH", "NEXT_PUBLIC_PROPOSAL_SPEND_OUTPUT_INDEX"),
      },
      signOffApproval: {
        mint: utxo("NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_TX_HASH", "NEXT_PUBLIC_SIGN_OFF_APPROVAL_MINT_OUTPUT_INDEX"),
        spend: utxo("NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_TX_HASH", "NEXT_PUBLIC_SIGN_OFF_APPROVAL_SPEND_OUTPUT_INDEX"),
      },
      treasury: {
        spend: utxo("NEXT_PUBLIC_TREASURY_SPEND_TX_HASH", "NEXT_PUBLIC_TREASURY_SPEND_OUTPUT_INDEX"),
        withdrawal: utxo("NEXT_PUBLIC_TREASURY_WITHDRAWAL_TX_HASH", "NEXT_PUBLIC_TREASURY_WITHDRAWAL_OUTPUT_INDEX"),
      },
    },
  };
}

export function printClientEnv(state: SetupState) {
  console.log("\n========================================");
  console.log("Client .env.setup contents:");
  console.log("========================================\n");
  console.log(buildClientEnv(state));
}
