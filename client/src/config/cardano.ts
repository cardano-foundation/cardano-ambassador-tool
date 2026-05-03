import { CardanoNetwork, NetworkConfig } from "@types";

/**
 * Network configurations for different Cardano environments
 */
export const NETWORK_CONFIGS: Record<CardanoNetwork, NetworkConfig> = {
  mainnet: {
    network: "mainnet",
    name: "Mainnet",
    networkId: 1,
    isTestnet: false,
    blockfrostUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    explorerUrl: "https://cardanoscan.io",
  },
  preprod: {
    network: "preprod",
    name: "Preprod (Testnet)",
    networkId: 0,
    isTestnet: true,
    blockfrostUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    explorerUrl: "https://preprod.cardanoscan.io",
  },
};

/**
 * Gets the current Cardano network from environment variables.
 * Throws if NEXT_PUBLIC_NETWORK is missing or invalid — prevents silent
 * fall-through to testnet in production.
 */
export function getCurrentNetworkConfig(): NetworkConfig {
  const envNetwork = process.env.NEXT_PUBLIC_NETWORK;

  if (envNetwork === "mainnet" || envNetwork === "preprod") {
    return NETWORK_CONFIGS[envNetwork];
  }

  throw new Error(
    `NEXT_PUBLIC_NETWORK must be "mainnet" or "preprod", got: ${JSON.stringify(
      envNetwork,
    )}. Set NEXT_PUBLIC_NETWORK at build time.`,
  );
}

/**
 * Network color coding for UI
 */
export const NETWORK_COLORS: Record<CardanoNetwork, string> = {
  mainnet: "text-green-500",
  preprod: "text-yellow-500",
};

export const NETWORK_NAMES: Record<number, string> = {
  1: "Mainnet",
  0: "Preprod (Testnet)",
};
