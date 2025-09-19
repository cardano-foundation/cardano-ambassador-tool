'use client';

import LocationSelector from '@/app/(onboarding)/sign-up/components/LocationSelector';
import Button from '@/components/atoms/Button';
import { CardHeader } from '@/components/atoms/Card';
import Checkbox from '@/components/atoms/Checkbox';
import ForumUsernameInput from '@/components/atoms/ForumUsernameInput';
import Input from '@/components/atoms/Input';
import Paragraph from '@/components/atoms/Paragraph';
import TextArea from '@/components/atoms/TextArea';
import { toast } from '@/components/toast/toast-manager';
import { useApp } from '@/context/AppContext';
import { getCatConstants, getProvider } from '@/utils';
import { stringToHex } from '@meshsdk/core';
import {
  membershipMetadata,
  MembershipMetadata,
  UserActionTx,
} from '@sidan-lab/cardano-ambassador-tool';
import { MembershipIntentPayoad, MemberTokenDetail } from '@types';
import { useEffect, useState } from 'react';

const SubmitIntent = ({
  asset,
  goNext,
}: {
  asset?: MemberTokenDetail;
  goNext?: () => void;
}) => {
  const { wallet: walletState } = useApp();
  const { address, wallet } = walletState;
  const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
  const ORACLE_OUTPUT_INDEX = parseInt(
    process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
  );

  const blockfrost = getProvider();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    wallet_address: address,
    forum_username: '',
    country: '',
    city: '',
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
        walletAddress: address,
        fullName: formData.fullName,
        displayName: formData.forum_username,
        emailAddress: formData.email,
        bio: formData.bio,
      },
      wallet,
      address,
      tokenPolicyId: asset.policyId,
      tokenAssetName: asset.assetName,
    };

    try {
      const result = await applyMembership(payload);
      console.log({ result });

      if (result?.success && goNext) {
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
      tokenPolicyId,
      address,
      wallet,
      userMetadata,
      tokenAssetName,
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
      stringToHex(userMetadata.walletAddress || ''),
      stringToHex(userMetadata.fullName || ''),
      stringToHex(userMetadata.displayName || ''),
      stringToHex(userMetadata.emailAddress || ''),
      stringToHex(userMetadata.bio || ''),
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

  useEffect(() => {
    console.log('FormData updated:', {
      country: formData.country,
      city: formData.city,
      forum_username: formData.forum_username,
      fullFormData: formData,
    });
  }, [formData.country, formData.city, formData.forum_username]);

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
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />

        <Input
          label="Email Address"
          placeholder="john.doe@example.com"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <ForumUsernameInput
          value={formData.forum_username}
          onChange={(forum_username) => {
            setFormData((prev) => ({ ...prev, forum_username }));
          }}
        />

        <LocationSelector
          countryCode={formData.country}
          city={formData.city}
          onCountryChange={(country) => {
            setFormData((prev) => ({ ...prev, country, city: '' }));
          }}
          onCityChange={(city) => {
            setFormData((prev) => ({ ...prev, city }));
          }}
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
