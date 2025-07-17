"use client";

import AppLogo from "@/components/atoms/Logo";
import OnboardingSvg from "@/components/atoms/onboarding";
import Paragraph from "@/components/atoms/Paragraph";
import Title from "@/components/atoms/Title";
import React from "react";
import { MeshProvider } from "@meshsdk/react";
import WalletList from "@/components/wallet/WalletList";

export default function Onboarding({}) {
  return (
    <MeshProvider>
      <div className="flex h-screen w-full p-2  ">
        <div className=" flex-1 items-center h-full relative flex flex-col">
          <div className="flex p-8 top-0 left-0 absolute">
            <AppLogo />
          </div>

          <div className="flex p-24 flex-col gap-8 items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <Title level="5">Connect Wallet</Title>
              <Paragraph>Use a supported Cardano wallet:</Paragraph>
            </div>
            <WalletList />

            <Paragraph className="text-center">
              If your wallet is whitelisted and holds a CIP-68 token, you’ll
              proceed as an Ambassador.
            </Paragraph>
          </div>
        </div>
        <div className="bg-background-light pt-24 pl-24 flex-1 rounded-lg min-h-[1153.169px]">
          <div className="bg-[url(/images/onboarding.png)] relative  h-full pl-8">
            <div className="top-19 absolute flex w-full flex-col items-center justify-center">
              <div>
                <Title className="text-white" level="4">
                  Cardano Ambassador Tools
                </Title>
                <Paragraph className="max-w-[450px] text-white">
                  Onboard, collaborate, and contribute to the ecosystem through
                  a streamlined, token-based platform.
                </Paragraph>
              </div>
            </div>
            <OnboardingSvg className="absolute bottom-0 -right-1" />
          </div>
        </div>
      </div>
    </MeshProvider>
  );
}
