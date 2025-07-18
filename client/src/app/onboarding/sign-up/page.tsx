"use client";

import Paragraph from "@/components/atoms/Paragraph";
import Title from "@/components/atoms/Title";
import React, {  useState } from "react";
import { MeshProvider } from "@meshsdk/react";
// import Button from "@/components/atoms/Button";
// import { CardHeader } from "@/components/atoms/Card";
// import Input from "@/components/atoms/Input";
// import TextArea from "@/components/atoms/TextArea";
// import Checkbox from "@/components/atoms/Checkbox";
// import Footer from "@/components/Footer";
// import AuthLayout from "../layout";
import WalletList from "@/components/wallet/WalletList";

function SignUp({}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    wallet_address: "",
    full_name: "",
    display_name: "",
    country: "",
    notifications: false,
    newsletter: false,
  });
  return (
    <MeshProvider>
      <div className="flex lg:p-24 p-6 flex-col gap-8 items-center justify-center h-full">
        {/* wallets */}
        <div className="flex flex-col items-center">
          <Title level="5">Connect Wallet</Title>
          <Paragraph>Use a supported Cardano wallet:</Paragraph>
        </div>
        <WalletList />

        <Paragraph className="text-center text-light">
          If your wallet is whitelisted and holds a CIP-68 token, you’ll proceed
          as an Ambassador.
        </Paragraph>

        {/* sign up */}
        {/* <CardHeader
              title="You're Whitelisted!"
              subtitle="Your wallet has been verified, and you're eligible to join as a Cardano Ambassador. Complete your profile to get started"
            />
            <div className="space-y-6 w-full">
              <Input
                label="Wallet Address"
                placeholder="addr123..."
                type="text"
                value={formData.wallet_address}
                onChange={(e) =>
                  setFormData({ ...formData, wallet_address: e.target.value })
                }
              />
              <Input
                label="Full Name"
                placeholder="Lovelace"
                type="name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
              <Input
                label="Display name"
                placeholder="$ada"
                type="email"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
              />
              <Input
                label="Email Address"
                placeholder="john.doe@example.com"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <TextArea
                label="Bio"
                rows={4}
                errorMessage="Please enter a valid Bio."
              />

              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={formData.notifications}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, notifications: checked })
                  }
                />
                <Paragraph size="base" as="span">
                  I agree to receive notifications and updates
                </Paragraph>
              </div>

              <div className="pt-2 pt-2 w-ful">
                <Button variant="primary" className="w-full">
                  Create Account
                </Button>
              </div>
            </div> */}

        {/* sign in  */}
        {/* <div>
              <CardHeader
                title="Sign in"
                subtitle="Your wallet has been verified, and you're eligible to join as a Cardano Ambassador. Complete your profile to get started"
              />
              <Input
                label="Display name"
                placeholder="$ada"
                type="email"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
              />
              <Input
                label="Email Address"
                placeholder="john.doe@example.com"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <div className="pt-2 w-full">
                <Button variant="primary" className="w-full">
                  Sign In
                </Button>
              </div>
              <Paragraph className="text-center text-muted-foreground">
                Access your Ambassador tools and continue making an impact in
                the Cardano community.
              </Paragraph>
            </div> */}
      </div>
    </MeshProvider>
  );
}


export default SignUp;
