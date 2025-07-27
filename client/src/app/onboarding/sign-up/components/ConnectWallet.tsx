'use client';

import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import WalletList from '@/components/wallet/WalletList';

const ConnectWallet = ({
  onConnected,
}: {
  onConnected?: (wallet: string) => void;
}) => {
  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="flex flex-col items-center">
        <Title level="5">Connect Wallet</Title>
        <Paragraph size="sm">Use a supported Cardano wallet:</Paragraph>
      </div>

      <WalletList
        onConnected={(address) => {
          onConnected?.(address);
        }}
      />

      <Paragraph size="sm" className="text-center">
        If your wallet is whitelisted and holds the CIP-68 token issued to
        Ambassadors, you’ll proceed as an Ambassador.
      </Paragraph>
    </div>
  );
};

export default ConnectWallet;
