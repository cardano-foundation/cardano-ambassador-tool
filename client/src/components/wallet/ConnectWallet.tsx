'use client';

import Button from '@/components/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Dialog';
import { useApp } from '@/context';
import { shortenString } from '@/utils';
import { useState } from 'react';
import { toast } from '../toast/toast-manager';
import WalletList from './WalletList';

const ConnectWallet = () => {
  const [open, setOpen] = useState(false);
  const { wallet, isNetworkValid, hasNetworkError, dismissNetworkError } =
    useApp();

  const { isConnected, address, disconnectWallet, clearError } = wallet;

  const handlechange = (open: boolean | ((prevState: boolean) => boolean)) => {
    if (!open) {
      // Dismiss network errors when dialog closes
      clearError();
    }
    setOpen(open);
  };

  // Don't auto-close dialog on connection - let user see network errors in dialog

  return (
    <Dialog open={open} onOpenChange={(open) => handlechange(open)}>
      {isConnected && address ? (
        <div className="flex justify-between">
          <span className="text-sm">{shortenString(address || '', 8)}</span>
          <span
            className="text-primary-base border-primary-base border-b border-dotted text-sm hover:cursor-pointer"
            onClick={(e) => {
              disconnectWallet();
              toast.warning('Warning!', 'Wallet disconnected');
            }}
          >
            Disconnect
          </span>
        </div>
      ) : (
        <DialogTrigger asChild>
          <Button variant="primary" className="w-full">
            Connect Wallet
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="flex flex-col items-center sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose from one of the supported Cardano wallets to connect to this
            application.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full w-full flex-col gap-6 p-6">
          <WalletList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
