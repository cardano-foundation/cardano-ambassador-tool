'use client';

import { useNetwork } from '@/context/AppContext';
import { getNetworkDisplayName } from '@/config/cardano';
import { getNetworkSwitchInstructions } from '@/utils/wallet-network';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import Button from './atoms/Button';

export function NetworkErrorBanner() {
  const {
    hasNetworkError,
    networkValidation,
    currentNetwork,
    walletNetwork,
    dismissNetworkError,
    validateCurrentWallet,
    isValidatingNetwork,
  } = useNetwork();

  const [showInstructions, setShowInstructions] = useState(false);

  if (!hasNetworkError || !networkValidation) {
    return null;
  }

  const instructions = getNetworkSwitchInstructions(currentNetwork);

  return (
    <div className="bg-muted border border-border rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <AlertTriangle className="text-primary-base w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-medium text-sm">
              Network Mismatch Detected
            </h3>
            <div className="mt-2 text-muted-foreground text-sm">
              <p>{networkValidation.message}</p>
              {walletNetwork && (
                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                  <span>
                    <strong className="text-foreground">Your wallet:</strong>{' '}
                    <span className={walletNetwork === 'mainnet' ? 'text-primary-base' : 'text-primary-300'}>
                      {getNetworkDisplayName(walletNetwork)}
                    </span>
                  </span>
                  <span>
                    <strong className="text-foreground">App requires:</strong>{' '}
                    <span className={currentNetwork === 'mainnet' ? 'text-primary-base' : 'text-primary-300'}>
                      {getNetworkDisplayName(currentNetwork)}
                    </span>
                  </span>
                </div>
              )}
            </div>
            
            {showInstructions && (
              <div className="mt-3 bg-card border border-border rounded p-3">
                <div className="text-foreground text-xs space-y-1">
                  {instructions.map((instruction, index) => (
                    <div key={index} className={index === 0 ? 'font-medium mb-2 text-primary-base' : 'ml-3 text-muted-foreground'}>
                      {instruction}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-foreground border-border hover:bg-muted"
              >
                {showInstructions ? 'Hide' : 'Show'} Instructions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={validateCurrentWallet}
                disabled={isValidatingNetwork}
                className="text-foreground border-border hover:bg-muted"
              >
                {isValidatingNetwork ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Recheck Network'
                )}
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={dismissNetworkError}
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function NetworkStatusIndicator() {
  const { currentNetwork, isNetworkValid, walletNetwork } = useNetwork();

  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${isNetworkValid ? 'bg-primary-base' : 'bg-primary-400'}`} />
        <span className="text-muted-foreground">
          App: <span className={currentNetwork === 'mainnet' ? 'text-primary-base' : 'text-primary-300'}>
            {getNetworkDisplayName(currentNetwork)}
          </span>
        </span>
      </div>
      {walletNetwork && (
        <div className="flex items-center space-x-1">
          <span className="text-muted-foreground">
            Wallet: <span className={walletNetwork === 'mainnet' ? 'text-primary-base' : 'text-primary-300'}>
              {getNetworkDisplayName(walletNetwork)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
