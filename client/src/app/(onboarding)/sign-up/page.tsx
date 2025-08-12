'use client';

import { useWallet } from '@meshsdk/react';
import { MemberTokenDetail } from '@types';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import SelectToken from './components/SelectToken';
import SubmissionSuccess from './components/SubmissionSuccess';
import SubmitIntent from './components/SubmitIntent';
import TokenNotFound from './components/TokenNotFound';

function SignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [asset, setAsset] = useState<MemberTokenDetail | undefined>(undefined);
  const { address, wallet } = useWallet();
  const policyId = process.env.NEXT_PUBLIC_AMBASSADOR_POLICY_ID ?? '';
  const [walletAssets, setWalletAssets] = useState<MemberTokenDetail[]>([]);
  const [selectedAssetName, setSelectedAssetName] = useState<string | null>(
    null,
  );

  const steps = [
    {
      name: 'Connect Wallet',
      component: <ConnectWallet goNext={() => goNext()} />,
      showProgress: true,
    },
    {
      name: 'Pick Token',
      component: walletAssets.length ? (
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
      ),
      showProgress: !walletAssets.length,
    },
    {
      name: 'Intent Form',
      component: selectedAssetName ? (
        <SubmitIntent asset={asset} goNext={() => goNext()} />
      ) : (
        <TokenNotFound />
      ),
      showProgress: !selectedAssetName,
    },
    {
      name: 'Succes',
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

  const goNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const fetchAssets = async () => {
      if (wallet && currentStep == 1) {
        const assets = await getAssetsDetails();

        setWalletAssets(assets);
      }
    };

    fetchAssets();
  }, [ address,steps]);

  async function getAssetsDetails() {
    const utxos = await wallet.getUtxos();
    const assets = await wallet.getPolicyIdAssets(policyId);

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
      {/* Breadcrumbs */}
      <div className="mb-6 flex justify-center gap-4">
        {steps.map((_, index) => (
          <div
            key={index}
            onClick={() => {
              if (index < currentStep) {
                setDirection(index < currentStep ? -1 : 1);
                setCurrentStep(index);
              }
            }}
            className={`size-2 cursor-pointer rounded-full transition-all duration-400 ${
              index < currentStep
                ? 'bg-primary-300 opacity-60 hover:opacity-100'
                : index === currentStep
                  ? 'bg-primary-base w-6'
                  : 'bg-border dark:bg-neutral-700'
            }`}
          />
        ))}
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
