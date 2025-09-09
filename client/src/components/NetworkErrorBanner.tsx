'use client';

import { NetworkConfig } from '@types';

export function NetworkStatusIndicator({
  currentNetwork,
  isNetworkValid,
}: {
  currentNetwork: NetworkConfig;
  isNetworkValid?: boolean;
}) {
  return (
    <div className="flex items-center space-x-2 text-xs">
      <div className="flex items-center space-x-1">
        <div
          className={`h-2 w-2 rounded-full ${isNetworkValid ? 'bg-primary-base' : 'bg-primary-400'}`}
        />
      </div>
      {currentNetwork.name && (
        <div className="flex items-center space-x-1">
          <span className="text-muted-foreground">
            Wallet:{' '}
            <span
              className={
                currentNetwork.name === 'mainnet'
                  ? 'text-primary-base'
                  : 'text-primary-300'
              }
            >
              {currentNetwork.name}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
