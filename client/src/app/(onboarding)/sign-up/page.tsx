'use client';

import { SingleRowStepper } from '@/components/atoms/Stepper';
import { useApp } from '@/context/AppContext';
import { useMemberValidation } from '@/hooks/useMemberValidation';
import { findMembershipIntentUtxo, smoothScrollToElement } from '@/utils';
import { UTxO } from '@meshsdk/core';
import { MemberTokenDetail } from '@types';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import ConnectWallet from './_components/ConnectWallet';
import IntentExists from './_components/IntentExists';
import SelectToken from './_components/SelectToken';
import SubmissionSuccess from './_components/SubmissionSuccess';
import SubmitIntent from './_components/SubmitIntent';
import TokenNotFound from './_components/TokenNotFound';

function SignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [asset, setAsset] = useState<MemberTokenDetail | undefined>(undefined);
  const { wallet: walletState } = useApp();
  const { address, wallet } = walletState;
  const policyId = process.env.NEXT_PUBLIC_AMBASSADOR_POLICY_ID ?? '';
  const [walletAssets, setWalletAssets] = useState<MemberTokenDetail[]>([]);
  const [selectedAssetName, setSelectedAssetName] = useState<string | null>(
    null,
  );
  const { memberData } = useMemberValidation();

  const [membershipIntent, setMembershipIntent] = useState<UTxO | null>(null);
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  const resolveStep2 = () => {
    if (membershipIntent || memberData) {
      return <IntentExists goBack={() => goBack()} />;
    } else {
      
      return walletAssets.length ? (
        <SelectToken
          goNext={() => goNext()}
          goBack={() => goBack()}
          setAsset={setAsset}
          walletAssets={walletAssets}
          setSelectedAssetName={setSelectedAssetName}
          selectedAssetName={selectedAssetName}
        />
      ) : (
        <TokenNotFound />
      );
    }
  };

  const steps = [
    {
      name: 'Connect Wallet',
      component: <ConnectWallet goNext={() => goNext()} />,
      showProgress: true,
    },

    {
      name: 'Pick Token',
      component: resolveStep2(),
      showProgress: !walletAssets.length,
    },
    {
      name: 'Intent Form',
      component: selectedAssetName ? (
        <SubmitIntent
          asset={asset}
          goNext={() => goNext()}
          goBack={() => goBack()}
        />
      ) : (
        <TokenNotFound />
      ),
      showProgress: !selectedAssetName,
    },
    {
      name: 'Success',
      component: <SubmissionSuccess />,
      showProgress: !selectedAssetName,
    },
  ];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      position: 'absolute',
    }),
    center: {
      x: 0,
      opacity: 1,
      position: 'relative',
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      position: 'absolute',
    }),
  };

  const goNext = async () => {
    setDirection(1);

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    
    // Smooth scroll to top of stepper
    smoothScrollToElement(scrollTargetRef);
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    
    // Smooth scroll to top of stepper
    smoothScrollToElement(scrollTargetRef);
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setDirection(stepIndex < currentStep ? -1 : 1);
      setCurrentStep(stepIndex);
    }
  };

  useEffect(() => {
    const fetchAssets = async () => {
      if (wallet) {
        const assets = await getAssetsDetails();
        setWalletAssets(assets);
      }
    };

    const fetchMembership = async () => {
      if (!wallet) return;
      const userAddress = await wallet!.getChangeAddress();
      if (!userAddress) return;
      const membershipIntentUtxo = await findMembershipIntentUtxo(userAddress);
      setMembershipIntent(membershipIntentUtxo);
    };

    fetchAssets();
    fetchMembership();
  }, [address, wallet, currentStep]);

  async function getAssetsDetails() {
    const utxos = await wallet!.getUtxos();
    const assets = await wallet!.getPolicyIdAssets(policyId);

    // Flatten UTXOs and filter for assets that match policyId
    const utxoAssets = utxos.flatMap((utxo) =>
      utxo.output.amount
        .filter((amt) => amt.unit.startsWith(policyId))
        .map((amt) => ({
          unit: amt.unit,
          quantity: amt.quantity,
          txHash: utxo.input.txHash,
          outputIndex: utxo.input.outputIndex,
        })),
    );

    // Enrich the wallet assets with matching UTXO info
    const enrichedAssets = assets.map((asset) => {
      const matchingUtxo = utxoAssets.find(
        (utxoAsset) => utxoAsset.unit === asset.unit,
      );
      return {
        ...asset,
        txHash: matchingUtxo?.txHash || null,
        outputIndex: matchingUtxo?.outputIndex ?? null,
      };
    });

    return enrichedAssets;
  }

  return (
    <div className="h-full w-full gap-8 p-6 lg:p-24">
      <div ref={scrollTargetRef} className="mb-6 flex justify-center">
        <SingleRowStepper
          currentStep={currentStep}
          totalSteps={steps.length}
          stepLabels={steps.map((step) => step.name)}
          clickable={true}
          onStepClick={handleStepClick}
          className="max-w-md"
        />
      </div>

      {/* Slide transition wrapper */}
      <div className="relative min-h-[400px] w-full overflow-hidden px-2">
        <AnimatePresence custom={direction} mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center"
          >
            {steps[currentStep].component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SignUp;
