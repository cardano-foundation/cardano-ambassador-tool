'use client';

import Button from '@/components/atoms/Button';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/Dialog';
import { NetworkErrorBanner, NetworkStatusIndicator } from '@/components/NetworkErrorBanner';
import { useWallet } from '@meshsdk/react';
import { useState } from 'react';
import WalletList from './WalletList';

const ConnectWallet = () => {
  const [open, setOpen] = useState(false);

  const { connected, name, connecting, connect, disconnect, setPersist } =
    useWallet();

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button variant="primary" className="w-full">
          Connect Wallet
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <div className="flex h-full w-full flex-col gap-6 p-6">
          <DialogHeader>
            <div className="flex flex-col items-center">
              <Title level="6">Connect Wallet</Title>
              <Paragraph size="sm">Use a supported Cardano wallet:</Paragraph>
              <div className="mt-2">
                <NetworkStatusIndicator />
              </div>
            </div>
          </DialogHeader>
                    
          <WalletList />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWallet;
