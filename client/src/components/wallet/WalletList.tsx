'use client';

import { useWallet, useWalletList } from '@meshsdk/react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Button from '../atoms/Button';
import { toast } from '../toast/toast-manager';

type WalletListProps = {
  onConnected?: (wallet: string) => void;
  onDisconnected?: () => void;
};

const WalletList = ({ onConnected, onDisconnected }: WalletListProps) => {
  const isFirstRender = useRef(true);
  const hasConnectedRef = useRef(false);
  const hasDisconnectedRef = useRef(false);

  const walletList = useWalletList();
  const { connected, name, connecting, connect, disconnect, error, address } =
    useWallet();

  // Show error toast
  useEffect(() => {
    if (!error) return;

    return toast.error(
      'Wallet Error!',
      `${error.toString().replace('[BrowserWallet] ', '').replace('Error: ', '')}`,
    );
  }, [error]);

  // Skip first render to avoid false connect/disconnect messages
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (connected && !hasConnectedRef.current && address) {
      hasConnectedRef.current = true;
      hasDisconnectedRef.current = false;
      toast.success('Success!', 'Wallet connected');
      onConnected?.(address);
    }
    

    // if (!connected && !hasDisconnectedRef.current) {
    //   hasDisconnectedRef.current = true;
    //   hasConnectedRef.current = false;
    //   toast.warning('Disconnected!', 'Wallet disconnected');
    //   onDisconnected?.();
    // }
  }, [connected, onConnected, onDisconnected, address]);

  return (
    <div className="flex flex-col items-center gap-3">
      {walletList.map((wallet) => {
        const isConnected = connected && wallet.name === name;

        return (
          <div key={wallet.id} className={isConnected ? 'relative' : ''}>
            <Button
              disabled={connecting}
              variant="ghost"
              className={`flex min-w-80 items-center justify-start gap-4 px-20 ${
                isConnected ? 'border-primary-300/20! border!' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                disconnect();
                connect(wallet.id, true);
                console.log({ wallet });
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
