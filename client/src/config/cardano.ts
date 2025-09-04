import { CardanoNetwork, NetworkConfig } from "@types";

/**
 * Network configurations for different Cardano environments
 */
export const NETWORK_CONFIGS: Record<CardanoNetwork, NetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    name: 'Mainnet',
    networkId: 1,
    isTestnet: false,
    blockfrostUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
    explorerUrl: 'https://cardanoscan.io'
  },
  preprod: {
    network: 'preprod',
    name: 'Preprod (Testnet)',
    networkId: 0,
    isTestnet: true,
    blockfrostUrl: 'https://cardano-preprod.blockfrost.io/api/v0',
    explorerUrl: 'https://preprod.cardanoscan.io'
  }
};

/**
 * Gets the current Cardano network from environment variables
 * Defaults to preprod if not specified or invalid
 */
export function getCurrentNetworkConfig(): NetworkConfig {
  const envNetwork = process.env.NEXT_PUBLIC_NETWORK as CardanoNetwork;

  if (envNetwork && (envNetwork === 'mainnet' || envNetwork === 'preprod')) {
    return NETWORK_CONFIGS[envNetwork];
  }

  console.warn(
    `Invalid or missing NEXT_PUBLIC_NETWORK: "${envNetwork}". Defaulting to preprod.`
  );
  return NETWORK_CONFIGS['preprod'];
}


/**
 * Network color coding for UI
 */
export const NETWORK_COLORS: Record<CardanoNetwork, string> = {
  mainnet: 'text-green-500',
  preprod: 'text-yellow-500'
};


export const NETWORK_NAMES: Record<number, string> = {
  1: 'Mainnet',
  0: 'Preprod (Testnet)'
}



