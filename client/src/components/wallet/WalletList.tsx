'use client';

import { useWallet, useWalletList } from '@meshsdk/react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';
import Button from '../atoms/Button';
import { toast } from '../toast/toast-manager';

const WalletList = () => {
  const walletList = useWalletList();

  const { connected, name, connecting, connect, disconnect, setPersist } =
    useWallet();

  useEffect(() => {
    setPersist(true);
  }, [setPersist]);

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
                isConnected ? 'border-primary-400! border!' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setPersist(true);
                disconnect();
                connect(wallet.id, true);
                toast.success('Success!', 'Wallet connected');
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
