import { blockfrost } from "@/services";
import { MeshWallet } from "@meshsdk/core";
import React, { useState } from "react";

const adminMnemonic1 = process.env.ADMIN_MNEMONIC_1 || "";
const adminMnemonic2 = process.env.ADMIN_MNEMONIC_2 || "";
const adminMnemonic3 = process.env.ADMIN_MNEMONIC_3 || "";

const getWallet = (mnemonic: string): MeshWallet => {
  return new MeshWallet({
    networkId: 0,
    fetcher: blockfrost,
    key: {
      type: "mnemonic",
      words: mnemonic.split(","),
    },
  });
};

const admin = () => {
  const [membershipApplications, setMembershipApplications] = useState([]);

  const admin1 = getWallet();

  const fetchMembershipApplication = async () => {
    const xxx = await blockfrost.fetchAddressAssets();
  };

  return (
    <div>
      {membershipApplications.map((x) => (
        <></>
      ))}
    </div>
  );
};

export default admin;
