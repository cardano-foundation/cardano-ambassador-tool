
import Button from "@/components/atoms/Button";
import { CardHeader } from "@/components/atoms/Card";
import Checkbox from "@/components/atoms/Checkbox";
import Input from "@/components/atoms/Input";
import Paragraph from "@/components/atoms/Paragraph";
import TextArea from "@/components/atoms/TextArea";
import React, { useState } from "react";

const SubmitIntent = () => {
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
    <>
      <CardHeader
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
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

        {/* <div className="pt-2  w-full">
          <Button variant="primary" className="w-full">
            Create Account
          </Button>
        </div> */}
      </div>
    </>
  );
};

export default SubmitIntent;
