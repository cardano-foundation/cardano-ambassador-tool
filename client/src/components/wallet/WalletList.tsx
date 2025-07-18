import { useWalletList } from "@meshsdk/react";
import React from "react";
import Button from "../atoms/Button";
import Image from "next/image";

const WalletList = () => {
  const WalletList = useWalletList();

  console.log({ WalletList });

  return (
    <>
      {WalletList.map((wallet) => (
        <Button
          key={wallet.id}
          variant="ghost"
          className="flex justify-start gap-4  min-w-80 px-20 items-center"
        >
          <Image
            src={wallet.icon}
            alt={wallet.id}
            width={24}
            height={24}
            className="rounded"
          />
          <span className="capitalize font-normal text-[16px]">{`${wallet.name.includes("Wallet") ? wallet.name : wallet.name + " wallet"} `}</span>
        </Button>
      ))}
    </>
  );
};

export default WalletList;
