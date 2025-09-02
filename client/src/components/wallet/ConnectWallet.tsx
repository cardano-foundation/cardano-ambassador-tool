'use client';

import Button from '@/components/atoms/Button';
import Paragraph from '@/components/atoms/Paragraph';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Dialog';
import { NetworkStatusIndicator } from '@/components/NetworkErrorBanner';
import { useApp } from '@/context';
import { shortenString } from '@/utils';
import { useWallet } from '@meshsdk/react';
import { useState } from 'react';
import WalletList from './WalletList';

const ConnectWallet = () => {
  const [open, setOpen] = useState(false);
  const { connected, disconnect, address } = useWallet();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {connected ? (
          <div className="flex justify-between">
            <span className="text-sm">{shortenString(address, 8)}</span>
            <span
              className="text-primary-base border-primary-base border-b border-dotted text-sm hover:cursor-pointer"
              onClick={() => disconnect()}
            >
              Disconnect
            </span>
          </div>
        ) : (
          <Button variant="primary" className="w-full">
            Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center sm:max-w-[500px]">
        <DialogTitle>Connect Wallet</DialogTitle>

        <div className="flex h-full w-full flex-col gap-6 p-6">
          <DialogHeader>
            <div className="flex flex-col items-center">
              <Paragraph size="sm">Use a supported Cardano wallet:</Paragraph>
            </div>
          </DialogHeader>

          <WalletList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
