'use client';

import { getCurrentNetworkConfig, NETWORK_NAMES } from '@/config/cardano';
import { IWallet } from '@meshsdk/core';
import { NetworkConfig, NetworkValidationResult } from '@types';
import { useCallback, useEffect, useState } from 'react';

interface UseNetworkValidationProps {
  wallet: IWallet | null;
  isConnected: boolean;
}

export function useNetworkValidation({
  wallet,
  isConnected,
}: UseNetworkValidationProps) {
  // Network state
  const [currentNetwork] = useState<NetworkConfig>(() =>
    getCurrentNetworkConfig(),
  );

  const [networkValidation, setNetworkValidation] =
    useState<NetworkValidationResult | null>(null);

  const [isValidatingNetwork, setIsValidatingNetwork] = useState(false);

  // Network validation functions
  const validateCurrentWallet = useCallback(async () => {
    if (!isConnected && !networkValidation) {
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

      const walletNetwork = await wallet.getNetworkId();

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
  }, [isConnected, wallet, currentNetwork.name]);

  const dismissNetworkError = () => {
    setNetworkValidation(null);
  };

  // Validate network before connection attempt
  const validateBeforeConnection = useCallback(
    async (testWallet: IWallet): Promise<boolean> => {
      setIsValidatingNetwork(true);

      try {
        const expectedNetwork = getCurrentNetworkConfig();
        const walletNetwork = await testWallet.getNetworkId();
        const isValid = walletNetwork == expectedNetwork.networkId;

        if (!isValid) {
          setNetworkValidation({
            isValid: false,
            walletNetwork: NETWORK_NAMES[walletNetwork],
            expectedNetwork: expectedNetwork.name,
            error: 'NETWORK_MISMATCH',
            message: `Network mismatch! Your wallet is connected to ${NETWORK_NAMES[walletNetwork]}, but this app is configured for ${expectedNetwork.name}. Please switch your wallet to ${expectedNetwork.name} network.`,
          });
          return false;
        }

        return true;
      } catch (error) {
        console.error('Network validation error:', error);
        setNetworkValidation({
          isValid: false,
          expectedNetwork: currentNetwork.name,
          error: 'WALLET_ERROR',
          message:
            'Failed to validate wallet network. Please try reconnecting your wallet.',
        });
        return false;
      } finally {
        setIsValidatingNetwork(false);
      }
    },
    [currentNetwork.name],
  );

  useEffect(() => {
    if (!isConnected) {
      setNetworkValidation(null);
    }
  }, [isConnected]);

  return {
    currentNetwork,
    networkValidation,
    isValidatingNetwork,
    validateCurrentWallet,
    validateBeforeConnection,
    dismissNetworkError,
    // Helper computed values
    isNetworkValid: networkValidation?.isValid,
    hasNetworkError: networkValidation && !networkValidation.isValid,
    networkErrorMessage: networkValidation?.message,
    walletNetwork: networkValidation?.walletNetwork,
  };
}
