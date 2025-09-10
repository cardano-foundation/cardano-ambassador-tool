'use client';

import { getCurrentNetworkConfig, NETWORK_NAMES } from '@/config/cardano';
import { useWallet } from '@meshsdk/react';
import { NetworkConfig, NetworkValidationResult } from '@types';
import { useEffect, useState } from 'react';

export function useNetworkValidation() {
  // Network state
  const [currentNetwork] = useState<NetworkConfig>(() =>
    getCurrentNetworkConfig(),
  );

  const [networkValidation, setNetworkValidation] =
    useState<NetworkValidationResult | null>(null);

  const [isValidatingNetwork, setIsValidatingNetwork] = useState(false);

  const { wallet, connected } = useWallet();

  // Validate wallet network when wallet or address changes
  useEffect(() => {
    if (connected) {
      validateCurrentWallet();
    }
  }, [connected]);

  // Network validation functions
  const validateCurrentWallet = async () => {
    if (!connected && !networkValidation) {
      setNetworkValidation(null);
      return;
    }

    setIsValidatingNetwork(true);

    try {
      const expectedNetwork = getCurrentNetworkConfig();

      if (!wallet) {
        setNetworkValidation({
          isValid: false,
          expectedNetwork: currentNetwork.name,
          error: 'WALLET_ERROR',
          message:
            'Failed to validate wallet network. Please try reconnecting your wallet.',
        });

        return;
      }

      let walletNetwork = await wallet.getNetworkId();

      const isValid = walletNetwork == expectedNetwork.networkId;

      if (isValid) {
        setNetworkValidation({
          isValid: true,
          walletNetwork: NETWORK_NAMES[walletNetwork],
          expectedNetwork: expectedNetwork.name,
          message: `Wallet is connected to the correct network (${expectedNetwork.name})`,
        });
      } else {
        setNetworkValidation({
          isValid: false,
          walletNetwork: NETWORK_NAMES[walletNetwork],
          expectedNetwork: expectedNetwork.name,
          error: 'NETWORK_MISMATCH',
          message: `Network mismatch! Your wallet is connected to ${NETWORK_NAMES[walletNetwork]}, but this app is configured for ${expectedNetwork.name}.`,
        });
      }
    } catch (error) {
      console.error('Network validation error:', error);
      setNetworkValidation({
        isValid: false,
        expectedNetwork: currentNetwork.name,
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
    isNetworkValid: networkValidation?.isValid,
    hasNetworkError: networkValidation && !networkValidation.isValid,
    networkErrorMessage: networkValidation?.message,
    walletNetwork: networkValidation?.walletNetwork,
  };
}
