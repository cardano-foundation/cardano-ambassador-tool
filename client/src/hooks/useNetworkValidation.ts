'use client';

import { CardanoNetwork, getCurrentNetwork } from '@/config/cardano';
import {
  NetworkValidationResult,
  validateWalletNetwork,
} from '@/utils/wallet-network';
import { IWallet } from '@meshsdk/core';
import { useEffect, useState } from 'react';

export function useNetworkValidation(wallet: IWallet | null, address: string | null) {
  // Network state
  const [currentNetwork] = useState<CardanoNetwork>(() => getCurrentNetwork());
  const [networkValidation, setNetworkValidation] =
    useState<NetworkValidationResult | null>(null);
  const [isValidatingNetwork, setIsValidatingNetwork] = useState(false);

  // Validate wallet network when wallet or address changes
  useEffect(() => {
    if (wallet && address && address.length > 0) {
      validateCurrentWallet();
    } else {
      // Clear network validation when wallet is disconnected
      setNetworkValidation(null);
    }
  }, [wallet, address]);

  // Network validation functions
  const validateCurrentWallet = async () => {
    if (!wallet) {
      setNetworkValidation(null);
      return;
    }

    setIsValidatingNetwork(true);
    try {
      const validation = await validateWalletNetwork(wallet);
      setNetworkValidation(validation);

      // Log validation result for debugging
      if (validation.isValid) {
        console.log('[Network] Wallet network validation passed:', validation.message);
      } else {
        console.warn(
          '[Network] Wallet network validation failed:',
          validation.message,
        );
      }
    } catch (error) {
      console.error('Network validation error:', error);
      setNetworkValidation({
        isValid: false,
        expectedNetwork: currentNetwork,
        error: 'WALLET_ERROR',
        message:
          'Failed to validate wallet network. Please try reconnecting your wallet.',
      });
    } finally {
      setIsValidatingNetwork(false);
    }
  };

  const dismissNetworkError = () => {
    setNetworkValidation(null);
  };

  return {
    currentNetwork,
    networkValidation,
    isValidatingNetwork,
    validateCurrentWallet,
    dismissNetworkError,
    // Helper computed values
    isNetworkValid: networkValidation?.isValid ?? true,
    hasNetworkError: networkValidation && !networkValidation.isValid,
    networkErrorMessage: networkValidation?.message,
    walletNetwork: networkValidation?.walletNetwork,
  };
}
