"use client";

import Paragraph from "@/components/atoms/Paragraph";
import Title from "@/components/atoms/Title";
import { toast } from "@/components/toast/toast-manager";
import WalletList from "@/components/wallet/WalletList";
import React from "react";

const ConnectWallet = () => {
  return (
    <>
      <div className="flex flex-col items-center">
        <Title level="5">Connect Wallet</Title>
        <Paragraph size="sm">Use a supported Cardano wallet:</Paragraph>
      </div>
      <WalletList
        onConnected={() => toast.success("Success!", "Wallet connected")}
      />

      <Paragraph size="sm" className="text-center text-light">
        If your wallet is whitelisted and holds the CIP-68 token issued to
        Ambassadors, you’ll proceed as an Ambassador.
      </Paragraph>
    </>
  );
};

export default ConnectWallet;
