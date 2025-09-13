'use client';

import Button from '@/components/atoms/Button';
import { CardHeader } from '@/components/atoms/Card';
import Checkbox from '@/components/atoms/Checkbox';
import Input from '@/components/atoms/Input';
import Paragraph from '@/components/atoms/Paragraph';
import TextArea from '@/components/atoms/TextArea';
import { toast } from '@/components/toast/toast-manager';
import { getCatConstants, getProvider } from '@/utils';
import { stringToHex } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import {
  membershipMetadata,
  MembershipMetadata,
  UserActionTx,
} from '@sidan-lab/cardano-ambassador-tool';
import { MembershipIntentPayoad, MemberTokenDetail } from '@types';
import { useState } from 'react';

const SubmitIntent = ({
  asset,
  goNext,
}: {
  asset?: MemberTokenDetail;
  goNext?: () => void;
}) => {
  const { address, wallet } = useWallet();
  const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
  const ORACLE_OUTPUT_INDEX = parseInt(
    process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
  );

  const blockfrost = getProvider();

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
    if (!wallet || !address || !asset?.txHash || asset.outputIndex === null)
      return;

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
      console.log({ result });

      if (result.success && goNext) {
        goNext();
      }
    } catch (error) {
      console.error('Failed to apply membership:', error);
    }
  };

  const applyMembership = async (payload: MembershipIntentPayoad) => {
    const {
      tokenUtxoHash,
      tokenUtxoIndex,
      address,
      wallet,
      tokenPolicyId,
      tokenAssetName,
      userMetadata,
    } = payload;


    const [oracleUtxos, tokenUtxos] = await Promise.all([
      blockfrost.fetchUTxOs(ORACLE_TX_HASH, ORACLE_OUTPUT_INDEX),
      blockfrost.fetchUTxOs(tokenUtxoHash, tokenUtxoIndex),
    ]);

    if (!oracleUtxos?.length) {
      toast.error(
        'Submission Failed!',
        'Unexpected error during membership application.',
      );
      return {
        success: false,
        message: 'Membership application failed.',
        data: null,
      };
    }

    if (!tokenUtxos?.length) {
      toast.error(
        'Submission Failed!',
        'Unexpected error during membership application.',
      );
      return {
        success: false,
        message: 'Membership application failed.',
        data: null,
      };
    }

    const oracleUtxo = oracleUtxos[0];
    const tokenUtxo = tokenUtxos[0];

    const userAction = new UserActionTx(
      address,
      wallet,
      blockfrost,
      getCatConstants(),
    );


    const metadata: MembershipMetadata = membershipMetadata(
      address,
      stringToHex(userMetadata.fullname),
      stringToHex(userMetadata.displayName),
      stringToHex(userMetadata.email),
      stringToHex(userMetadata.bio),
    );

    const result = await userAction.applyMembership(
      oracleUtxo,
      tokenUtxo,
      tokenPolicyId,
      tokenAssetName,
      metadata,
    );

    if (!result) {
      toast.error(
        'Submission Failed!',
        'Unexpected error during membership application.',
      );
      return {
        success: false,
        message: 'Membership successfully applied.',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Membership successfully applied.',
      data: result,
    };
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
