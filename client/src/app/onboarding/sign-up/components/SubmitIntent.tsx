
import Button from '@/components/atoms/Button';
import { CardHeader } from '@/components/atoms/Card';
import Checkbox from '@/components/atoms/Checkbox';
import Input from '@/components/atoms/Input';
import Paragraph from '@/components/atoms/Paragraph';
import TextArea from '@/components/atoms/TextArea';
import { useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { MemberTokenDetail } from '@types';
import { applyMembership } from '@/services/memberService';


const SubmitIntent = ({ asset }: { asset?: MemberTokenDetail }) => {
  const { address, wallet } = useWallet();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    wallet_address: address,
    full_name: '',
    display_name: '',
    country: '',
    t_c: false,
    bio: '',
    asset,
  });

  const handleSubmit = async () => {
    if (!wallet || !address || !asset?.txHash || asset.outputIndex === null) return;

    const payload = {
      tokenUtxoHash: asset.txHash,
      tokenUtxoIndex: asset.outputIndex,
      userMetadata: {
        fullname: formData.full_name,
        bio: formData.bio,
        email: formData.email,
        displayName: formData.display_name,
      },
      wallet,
      address,
      tokenPolicyId: asset.policyId,
      tokenAssetName: asset.assetName,
    };

    try {
      const result = await applyMembership(payload);
      console.log('Membership applied:', result);
    } catch (error) {
      console.error('Failed to apply membership:', error);
    }
  };
  return (
    <>
      <CardHeader
        title="You're Whitelisted!"
        subtitle="Your wallet has been verified, and you're eligible to join as a Cardano Ambassador. Complete your profile to get started"
      />
      <div className="w-full space-y-6">
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
          type="name "
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
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />

        <div className="flex items-start justify-between space-x-3">
          <div>
            <h1 className="text-[16px] leading-[24px] tracking-normal">
              Accept Terms & Conditions
            </h1>
            <Paragraph size="base" className="text-muted-foreground">
              By creating an account, you agree to our Terms of Use and Privacy
              Policy
            </Paragraph>
          </div>

          <Checkbox
            checked={formData.t_c}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, t_c: checked })
            }
          />
        </div>

        <div className="w-full pt-2">
          <Button variant="primary" className="w-full" onClick={handleSubmit}>
            Create Account
          </Button>
        </div>
      </div>
    </>
  );
};

export default SubmitIntent;
