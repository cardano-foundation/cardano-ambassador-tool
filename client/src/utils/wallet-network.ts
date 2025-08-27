/**
 * Wallet Network Validation Utilities
 * 
 * This module provides utilities to validate wallet network compatibility
 * with the configured Cardano environment (mainnet vs preprod).
 */

import { IWallet } from '@meshsdk/core';
import { 
  CardanoNetwork, 
  getCurrentNetwork, 
  getCurrentNetworkConfig, 
  getNetworkDisplayName 
} from '@/config/cardano';

export interface NetworkValidationResult {
  isValid: boolean;
  walletNetwork?: CardanoNetwork;
  expectedNetwork: CardanoNetwork;
  error?: string;
  message?: string;
}

export interface NetworkValidationError {
  type: 'NETWORK_MISMATCH' | 'DETECTION_FAILED' | 'WALLET_ERROR';
  walletNetwork?: CardanoNetwork;
  expectedNetwork: CardanoNetwork;
  message: string;
}

/**
 * Detects the network a wallet is connected to based on its addresses
 */
export async function detectWalletNetwork(wallet: IWallet): Promise<CardanoNetwork | null> {
  try {
    // Get a wallet address to analyze
    const addresses = await wallet.getUsedAddresses();
    if (!addresses || addresses.length === 0) {
      return null;
    }

    const address = addresses[0];
    
    // Cardano addresses contain network information in their first byte
    // We can decode this to determine if it's mainnet or testnet
    const networkId = await getAddressNetworkId(address);
    
    if (networkId === 1) {
      return 'mainnet';
    } else if (networkId === 0) {
      return 'preprod';
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting wallet network:', error);
    return null;
  }
}

/**
 * Alternative method: Check wallet network using protocol parameters
 */
export async function detectWalletNetworkFromProtocol(wallet: IWallet): Promise<CardanoNetwork | null> {
  try {
    // Try to get network ID from wallet's network parameters
    const networkId = await wallet.getNetworkId();
    
    if (networkId === 1) {
      return 'mainnet';
    } else if (networkId === 0) {
      return 'preprod';
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting wallet network from protocol:', error);
    return null;
  }
}

/**
 * Extract network ID from a Cardano address
 */
async function getAddressNetworkId(address: string): Promise<number | null> {
  try {
    // Import CardanoWasm dynamically to avoid SSR issues
    const CardanoWasm = await import('@emurgo/cardano-serialization-lib-browser');
    
    const addr = CardanoWasm.Address.from_bech32(address);
    const baseAddr = CardanoWasm.BaseAddress.from_address(addr);
    
    if (baseAddr) {
      return baseAddr.to_address().network_id();
    }
    
    // Try enterprise address
    const enterpriseAddr = CardanoWasm.EnterpriseAddress.from_address(addr);
    if (enterpriseAddr) {
      return enterpriseAddr.to_address().network_id();
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing address network ID:', error);
    return null;
  }
}

/**
 * Validates if a wallet is connected to the correct network
 */
export async function validateWalletNetwork(wallet: IWallet): Promise<NetworkValidationResult> {
  const expectedNetwork = getCurrentNetwork();
  
  try {
    // Try multiple detection methods
    let walletNetwork = await detectWalletNetworkFromProtocol(wallet);
    
    if (!walletNetwork) {
      walletNetwork = await detectWalletNetwork(wallet);
    }
    
    if (!walletNetwork) {
      return {
        isValid: false,
        expectedNetwork,
        error: 'DETECTION_FAILED',
        message: 'Unable to detect wallet network. Please ensure your wallet is properly connected.'
      };
    }
    
    const isValid = walletNetwork === expectedNetwork;
    
    if (isValid) {
      return {
        isValid: true,
        walletNetwork,
        expectedNetwork,
        message: `Wallet is connected to the correct network (${getNetworkDisplayName(walletNetwork)})`
      };
    } else {
      return {
        isValid: false,
        walletNetwork,
        expectedNetwork,
        error: 'NETWORK_MISMATCH',
        message: `Network mismatch! Your wallet is connected to ${getNetworkDisplayName(walletNetwork)}, but this app is configured for ${getNetworkDisplayName(expectedNetwork)}.`
      };
    }
  } catch (error) {
    console.error('Wallet network validation error:', error);
    return {
      isValid: false,
      expectedNetwork,
      error: 'WALLET_ERROR',
      message: 'Error validating wallet network. Please try reconnecting your wallet.'
    };
  }
}

/**
 * Creates a user-friendly error message for network validation failures
 */
export function createNetworkMismatchMessage(
  walletNetwork: CardanoNetwork | undefined,
  expectedNetwork: CardanoNetwork
): string {
  if (!walletNetwork) {
    return `Unable to detect your wallet's network. Please ensure you're connected to ${getNetworkDisplayName(expectedNetwork)}.`;
  }
  
  return `Network mismatch! Your wallet is connected to ${getNetworkDisplayName(walletNetwork)}, but this app requires ${getNetworkDisplayName(expectedNetwork)}. Please switch your wallet to the correct network.`;
}

/**
 * Gets instructions for switching wallet network
 */
export function getNetworkSwitchInstructions(targetNetwork: CardanoNetwork): string[] {
  const networkName = getNetworkDisplayName(targetNetwork);
  
  return [
    `Switch your wallet to ${networkName}:`,
    '1. Open your Cardano wallet extension',
    '2. Look for network/environment settings',
    `3. Select "${networkName}" from the available networks`,
    '4. Reconnect your wallet to this application'
  ];
}

/**
 * Checks if the current environment supports wallet network validation
 */
export function isNetworkValidationSupported(): boolean {
  // Network validation is supported in browser environments
  return typeof window !== 'undefined';
}
