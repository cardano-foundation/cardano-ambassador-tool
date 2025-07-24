"use client";

import React, {   } from "react";
import { MeshProvider } from "@meshsdk/react";

import ConnectWallet from "./components/ConnectWallet";

function SignUp({}) {

  return (
    <MeshProvider>
      <div className="flex lg:p-24 p-6 flex-col gap-8 items-center justify-center h-full">
        {/* wallets */}
        <ConnectWallet/>

        {/* sign up */}


        {/* sign in  */}
 
      </div>
    </MeshProvider>
  );
}


export default SignUp;
