"use client";
import { useWallet, useWalletList } from "@meshsdk/react";
import React, { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import Button from "../atoms/Button";
import { toast } from "../toast/toast-manager";

const WalletList = ({ onConnected }: { onConnected: () => void }) => {
  const walletList = useWalletList();

  const { connected, name, connecting, connect, disconnect, error } =
    useWallet();

  useEffect(() => {
    if (!error) return;

    return toast.error(
      "Wallet Error!",
      `${error.toString().replace("[BrowserWallet] ", "").replace("Error: ", "")}`
    );
  }, [error]);

  useEffect(() => {
    if (connected) {
      if (onConnected) onConnected();
    }
  }, [connected, onConnected]);

  return (
    <>
      {walletList.map((wallet) => {
        const isConnected = connected && wallet.name === name;

        return (
          <div key={wallet.id} className={` ${isConnected ? "relative" : ""}`}>
            <Button
              disabled={connecting}
              variant="ghost"
              className={`flex justify-start gap-4  min-w-80 px-20 items-center ${isConnected ? "border-primary-300/20!  border! " : ""}`}
              onClick={() => connect(wallet.id, true)}
            >
              <Image
                src={wallet.icon}
                alt={wallet.id}
                width={24}
                height={24}
                className="rounded"
              />
              <span className="capitalize font-medium text-[16px]">
                {wallet.name.includes("Wallet")
                  ? wallet.name
                  : wallet.name + " wallet"}
              </span>

              {isConnected && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    disconnect();
                  }}
                  className="absolute right-3  p-1 rounded cursor-pointer z-10 flex items-center"
                  title="Disconnect"
                >
                  <X className="h-4 w-4 text-primary-base" />
                </span>
              )}
            </Button>
          </div>
        );
      })}
    </>
  );
};

export default WalletList;
