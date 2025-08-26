'use client';

import { useWallet, useWalletList } from '@meshsdk/react';
import { X, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { MouseEvent, useEffect } from 'react';
import Button from '../atoms/Button';
import { toast } from '../toast/toast-manager';
import { useNetwork } from '@/context/AppContext';

const WalletList = () => {
  const walletList = useWalletList();
  const { hasNetworkError, isNetworkValid } = useNetwork();

  const {
    connected,
    name,
    connecting,
    connect,
    disconnect,
    setPersist,
    address,
    wallet,
    error,
  } = useWallet();

  const handleConnect = async (e: MouseEvent<HTMLButtonElement, MouseEvent>, walletId: string) => {
    e.stopPropagation();
    setPersist(true);
    disconnect();
    await connect(walletId, true);
  };

  useEffect(() => {
    if (connected && address.length) {
      if (isNetworkValid) {
        toast.success('Wallet connected', address);
      } else {
        toast.warning('Wallet connected', 'Network mismatch detected. Please check the network warning above.');
      }
    }

    if (error) {
      console.log(error);
      toast.error('Error!', error.info);
      return;
    }
  }, [connected, address, error, isNetworkValid]);

  return (
    <div className="flex flex-col items-center gap-3">
      {hasNetworkError && (
        <div className="bg-muted border border-border rounded-lg p-3 mb-2 w-full">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="text-primary-base w-4 h-4 flex-shrink-0" />
            <span className="text-muted-foreground">
              Wallet functionality may be limited due to network mismatch.
            </span>
          </div>
        </div>
      )}
      
      {walletList.map((wallet) => {
        const isConnected = connected && wallet.name === name;
        const shouldShowWarning = isConnected && hasNetworkError;

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
