'use client';

import { useApp } from '@/context';
import { useWallet, useWalletList } from '@meshsdk/react';
import { AlertTriangle, ChevronLeft, X } from 'lucide-react';
import Image from 'next/image';
import { MouseEvent, useEffect } from 'react';
import Button from '../atoms/Button';
import { toast } from '../toast/toast-manager';

const WalletList = () => {
  const walletList = useWalletList();

  const { isNetworkValid, hasNetworkError, dismissNetworkError } = useApp();

  const {
    connected,
    name,
    connecting,
    connect,
    disconnect,
    setPersist,
    address,
    error,
  } = useWallet();

  const handleConnect = async (
    e: MouseEvent<HTMLButtonElement>,
    walletId: string,
  ) => {
    e.stopPropagation();
    setPersist(true);
    disconnect();
    await connect(walletId, true);
  };

  console.log({ hasNetworkError });

  useEffect(() => {
    if (connected && address.length && isNetworkValid) {
      toast.success('Wallet connected', address);
    }

    if (error) {
      console.log(error);
      const errorMessage =
        typeof error === 'string'
          ? error
          : (error as any)?.message || 'Wallet connection error';
      toast.error('Error!', errorMessage);
      return;
    }
  }, [connected, address, error]);

  useEffect(() => {
    if (hasNetworkError) {
      disconnect();
    }
  }, [hasNetworkError]);

  return (
    <div className="flex flex-col items-center gap-3">
      {hasNetworkError && (
        <>
          <div
            className="mr-auto flex items-center gap-2 hover:cursor-pointer"
            onClick={() => dismissNetworkError()}
          >
            <ChevronLeft className="text-primary-base size-4" />
            <span className="text-primary-base text-sm">Back</span>
          </div>
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

      {!hasNetworkError &&
        walletList.map((wallet) => {
          const isConnected = connected && wallet.name === name;
          const shouldShowWarning = isConnected;

          return (
            <div key={wallet.id} className={isConnected ? 'relative' : ''}>
              <Button
                disabled={connecting}
                variant="ghost"
                className={`flex min-w-80 items-center justify-start gap-4 px-20 ${
                  isConnected ? 'border-primary-400! border!' : ''
                } ${shouldShowWarning ? 'border-primary-base border-2!' : ''}`}
                onClick={(e) => {
                  handleConnect(e, wallet.id);
                }}
              >
                <Image
                  src={wallet.icon}
                  alt={wallet.id}
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span className="text-[16px] font-medium capitalize">
                  {wallet.name.includes('Wallet')
                    ? wallet.name
                    : wallet.name + ' wallet'}
                </span>

                {isConnected && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      disconnect();
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
        })}
    </div>
  );
};

export default WalletList;
