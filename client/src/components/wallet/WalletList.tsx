'use client';

import { useApp } from '@/context';
import { shortenString } from '@/utils';
import { AlertTriangle, X } from 'lucide-react';
import Image from 'next/image';
import { MouseEvent, useEffect } from 'react';
import Button from '../atoms/Button';
import { toast } from '../toast/toast-manager';

const WalletList = () => {
  const { wallet, isNetworkValid, logout } = useApp();

  const {
    availableWallets,
    isConnected,
    isConnecting,
    selectedWalletId,
    address,
    error,
    connectWallet,
    disconnectWallet,
  } = wallet;

  const handleConnect = async (
    e: MouseEvent<HTMLButtonElement>,
    walletId: string,
  ) => {
    e.stopPropagation();
    await connectWallet(walletId);
  };

  useEffect(() => {
    if (isConnected && address && isNetworkValid === true) {
      toast.success('Wallet connected', shortenString(address, 8));
    }
  }, [isConnected, address, error, isNetworkValid]);

  return (
    <div className="flex flex-col items-center gap-3">
      {error && (
        <>
          <div className="bg-muted border-border mb-2 w-full rounded-lg border p-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="text-primary-base h-4 w-4 flex-shrink-0" />
              <span className="text-muted-foreground">
                Wallet functionality may be limited due to network mismatch.
              </span>
            </div>
          </div>
        </>
      )}

      {availableWallets.length ? (
        availableWallets.map((walletItem) => {
          const isWalletConnected =
            isConnected && walletItem.id === selectedWalletId;
          const shouldShowWarning = isWalletConnected;

          return (
            <div
              key={walletItem.id}
              className={isWalletConnected ? 'relative' : ''}
            >
              <Button
                disabled={isConnecting}
                variant="ghost"
                className={`flex min-w-80 items-center justify-start gap-4 px-20 ${
                  isWalletConnected ? 'border-primary-400! border!' : ''
                } ${shouldShowWarning ? 'border-primary-base border-2!' : ''}`}
                onClick={(e) => {
                  handleConnect(e, walletItem.id);
                }}
              >
                <Image
                  src={walletItem.icon}
                  alt={walletItem.id}
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span className="text-[16px] font-medium capitalize">
                  {walletItem.name.includes('Wallet')
                    ? walletItem.name
                    : walletItem.name + ' wallet'}
                </span>

                {isWalletConnected && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      disconnectWallet();
                      logout();
                      toast.warning('Warning!', 'Wallet disconnected');
                    }}
                    className="absolute right-3 z-10 flex cursor-pointer items-center rounded p-1"
                    title="Disconnect"
                  >
                    <X className="text-primary-base h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          );
        })
      ) : (
        <span className="text-primary-base">No wallets found!</span>
      )}
    </div>
  );
};

export default WalletList;
