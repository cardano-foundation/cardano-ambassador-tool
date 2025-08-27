/**
 * Cardano Network Configuration
 * 
 * This module handles environment-driven network configuration for Cardano.
 * It supports preprod (testnet) and mainnet environments with proper validation.
 */

export type CardanoNetwork = 'mainnet' | 'preprod';

export interface NetworkConfig {
  network: CardanoNetwork;
  networkId: number;
  protocolMagic: number;
  isTestnet: boolean;
  blockfrostUrl: string;
  explorerUrl: string;
}

/**
 * Network configurations for different Cardano environments
 */
export const NETWORK_CONFIGS: Record<CardanoNetwork, NetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    networkId: 1,
    protocolMagic: 764824073,
    isTestnet: false,
    blockfrostUrl: 'https://cardano-mainnet.blockfrost.io/api/v0',
    explorerUrl: 'https://cardanoscan.io'
  },
  preprod: {
    network: 'preprod',
    networkId: 0,
    protocolMagic: 1,
    isTestnet: true,
    blockfrostUrl: 'https://cardano-preprod.blockfrost.io/api/v0',
    explorerUrl: 'https://preprod.cardanoscan.io'
  }
};

/**
 * Gets the current Cardano network from environment variables
 * Defaults to preprod if not specified or invalid
 */
export function getCurrentNetwork(): CardanoNetwork {
  const envNetwork = process.env.NEXT_PUBLIC_NETWORK as CardanoNetwork;
  
  if (envNetwork && (envNetwork === 'mainnet' || envNetwork === 'preprod')) {
    return envNetwork;
  }
  
  console.warn(
    `Invalid or missing NEXT_PUBLIC_NETWORK: "${envNetwork}". Defaulting to preprod.`
  );
  return 'preprod';
}

/**
 * Gets the current network configuration
 */
export function getCurrentNetworkConfig(): NetworkConfig {
  const network = getCurrentNetwork();
  return NETWORK_CONFIGS[network];
}

/**
 * Validates if a network is supported
 */
export function isNetworkSupported(network: string): network is CardanoNetwork {
  return network === 'mainnet' || network === 'preprod';
}

/**
 * Network display names for UI
 */
export const NETWORK_DISPLAY_NAMES: Record<CardanoNetwork, string> = {
  mainnet: 'Mainnet',
  preprod: 'Preprod (Testnet)'
};

/**
 * Network color coding for UI
 */
export const NETWORK_COLORS: Record<CardanoNetwork, string> = {
  mainnet: 'text-green-500',
  preprod: 'text-yellow-500'
};

/**
 * Gets human-readable network name
 */
export function getNetworkDisplayName(network: CardanoNetwork): string {
  return NETWORK_DISPLAY_NAMES[network];
}

