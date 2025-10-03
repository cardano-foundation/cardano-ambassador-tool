'use client';

import LocationSelector from '@/app/(onboarding)/sign-up/components/LocationSelector';
import Button from '@/components/atoms/Button';
import { CardHeader } from '@/components/atoms/Card';
import Checkbox from '@/components/atoms/Checkbox';
import ForumUsernameInput from '@/components/atoms/ForumUsernameInput';
import Input from '@/components/atoms/Input';
import Paragraph from '@/components/atoms/Paragraph';
import TextArea from '@/components/atoms/TextArea';
import ErrorAccordion from '@/components/ErrorAccordion';
import { toast } from '@/components/toast/toast-manager';
import { useApp } from '@/context/AppContext';
import { getCatConstants, getProvider } from '@/utils';
import {
  getFieldError,
  validateIntentForm,
  ValidationError,
} from '@/utils/validation';
import {
  membershipMetadata,
  MembershipMetadata,
  UserActionTx,
} from '@sidan-lab/cardano-ambassador-tool';
import { MembershipIntentPayoad, MemberTokenDetail } from '@types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const SubmitIntent = ({
  asset,
  goNext,
  goBack,
}: {
  asset?: MemberTokenDetail;
  goNext?: () => void;
  goBack?: () => void;
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

  // Validation and error state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [submitError, setSubmitError] = useState<{
    message: string;
    details?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear submit error when form data changes
  useEffect(() => {
    if (submitError) {
      setSubmitError(null);
    }
  }, [formData]);

  const handleSubmit = async () => {
    // Clear previous errors
    setValidationErrors([]);
    setSubmitError(null);

    // Validate form data
    const validation = validateIntentForm({
      fullName: formData.fullName,
      email: formData.email,
      forum_username: formData.forum_username,
      country: formData.country,
      city: formData.city,
      bio: formData.bio,
      t_c: formData.t_c,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      // Focus on the first error field
      const firstError = validation.errors[0];
      const errorElement = document.querySelector(
        `[name="${firstError.field}"]`,
      ) as HTMLElement;
      if (errorElement) {
        errorElement.focus();
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Check required wallet and asset data
    if (!wallet || !address || !asset?.txHash || asset.outputIndex === null) {
      setSubmitError({
        message: 'Wallet or asset information is missing',
        details: `Wallet: ${!!wallet}, Address: ${!!address}, Asset TX: ${!!asset?.txHash}, Output Index: ${asset?.outputIndex}`,
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      tokenUtxoHash: asset.txHash,
      tokenUtxoIndex: asset.outputIndex,
      userMetadata: {
        walletAddress: address,
        fullName: formData.fullName.trim(),
        displayName: formData.forum_username.trim(),
        emailAddress: formData.email.trim(),
        bio: formData.bio.trim(),
        country: formData.country,
        city: formData.city,
      },
      wallet,
      address,
      tokenPolicyId: asset.policyId,
      tokenAssetName: asset.assetName,
    };

    const result = await applyMembership(payload);

    if (result?.success && goNext) {
      toast.success(
        'Success!',
        'Your membership application has been submitted successfully.',
      );
      goNext();
    } else if (!result?.success) {
      setSubmitError({
        message: result?.message || 'Submission failed',
        details: result?.error || JSON.stringify(result, null, 2),
      });
       setIsSubmitting(false);
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

    // Fetch UTxOs with better error handling
    let oracleUtxos, tokenUtxos;
    try {
      [oracleUtxos, tokenUtxos] = await Promise.all([
        blockfrost.fetchUTxOs(ORACLE_TX_HASH, ORACLE_OUTPUT_INDEX),
        blockfrost.fetchUTxOs(tokenUtxoHash, tokenUtxoIndex),
      ]);
    } catch (fetchError) {
      return {
        success: false,
        message: 'Failed to fetch required UTxOs',
        data: null,
        error: `UTxO fetch error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
      };
    }

    if (!oracleUtxos?.length) {
      return {
        success: false,
        message: 'Oracle UTxO not found',
        data: null,
        error: `Oracle UTxO not found at ${ORACLE_TX_HASH}#${ORACLE_OUTPUT_INDEX}`,
      };
    }

    if (!tokenUtxos?.length) {
      return {
        success: false,
        message: 'Token UTxO not found',
        data: null,
        error: `Token UTxO not found at ${tokenUtxoHash}#${tokenUtxoIndex}`,
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

    const metadata: MembershipMetadata = membershipMetadata({
      walletAddress: userMetadata.walletAddress,
      fullName: userMetadata.fullName || '',
      displayName: userMetadata.displayName || '',
      emailAddress: userMetadata.emailAddress || '',
      bio: userMetadata.bio || '',
      country: userMetadata.country || '',
      city: userMetadata.city || '',
    });

    // Apply membership 
    let result;
    try {
      result = await userAction.applyMembership(
        oracleUtxo,
        tokenUtxo,
        tokenPolicyId,
        tokenAssetName,
        metadata,
      );
    } catch (membershipError) {
            
      return {
        success: false,
        message: 'Membership application failed',
        data: null,
        error: `Membership error: ${membershipError instanceof Error ? membershipError.message : String(membershipError)}`,
      };
    }

    if (!result) {
      return {
        success: false,
        message: 'Membership application failed',
        data: null,
        error: 'UserAction.applyMembership returned null or undefined',
      };
    }

    return {
      success: true,
      message: 'Membership successfully applied',
      data: result,
    };
  };

  return (
    <div className="relative">
      {/* Error Accordion - overlays other content */}
      <ErrorAccordion
        isVisible={!!submitError}
        message={submitError?.message}
        details={submitError?.details}
        onDismiss={() => setSubmitError(null)}
        overlay={true}
      />

      <CardHeader
        title="You're Whitelisted!"
        subtitle="Your wallet has been verified, and you're eligible to join as a Cardano Ambassador. Complete your profile to get started"
      />
      <div className="w-full space-y-6">
        <Input
          label="Full Name"
          placeholder="Lovelace"
          type="name"
          name="fullName"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          error={!!getFieldError(validationErrors, 'fullName')}
          errorMessage={getFieldError(validationErrors, 'fullName')}
        />

        <Input
          label="Email Address"
          placeholder="john.doe@example.com"
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={!!getFieldError(validationErrors, 'email')}
          errorMessage={getFieldError(validationErrors, 'email')}
        />

        <div className="space-y-1">
          <ForumUsernameInput
            value={formData.forum_username}
            onChange={(forum_username) => {
              setFormData((prev) => ({ ...prev, forum_username }));
            }}
          />
          {getFieldError(validationErrors, 'forum_username') && (
            <p className="text-primary-base mt-1 text-sm">
              {getFieldError(validationErrors, 'forum_username')}
            </p>
          )}
        </div>

        <div className="space-y-1">
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
          {(getFieldError(validationErrors, 'country') ||
            getFieldError(validationErrors, 'city')) && (
            <p className="text-primary-base mt-1 text-sm">
              {getFieldError(validationErrors, 'country') ||
                getFieldError(validationErrors, 'city')}
            </p>
          )}
        </div>

        <TextArea
          label="Bio"
          rows={4}
          name="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          error={!!getFieldError(validationErrors, 'bio')}
          errorMessage={getFieldError(validationErrors, 'bio')}
        />

        <div className="space-y-2">
          <div className="flex items-start justify-between space-x-3">
            <div>
              <h1 className="text-[16px] leading-[24px] tracking-normal">
                Accept Terms & Conditions
              </h1>
              <Paragraph size="base" className="text-muted-foreground">
                By creating an account, you agree to our Terms of Use and
                Privacy Policy
              </Paragraph>
            </div>

            <Checkbox
              id="terms-checkbox"
              checked={formData.t_c}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, t_c: checked })
              }
            />
          </div>
          {getFieldError(validationErrors, 't_c') && (
            <p className="text-primary-base text-sm">
              {getFieldError(validationErrors, 't_c')}
            </p>
          )}
        </div>

        <div className="mt-6 flex w-full justify-between gap-2">
          <Button variant="outline" onClick={goBack} className="rounded-lg!">
            Back
          </Button>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 flex-1 animate-spin" />
                Submitting...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitIntent;
