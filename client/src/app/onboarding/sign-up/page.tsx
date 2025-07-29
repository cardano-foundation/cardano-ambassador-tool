'use client';

import { useWallet } from '@meshsdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import SelectToken from './components/SelectToken';
import SubmitIntent from './components/SubmitIntent';
import { MemberTokenDetail } from '@types';


function SignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const { connected } = useWallet();
  const [asset, setAsset] = useState<MemberTokenDetail | undefined>(undefined);

  const steps = [
    {
      name: 'Connect Wallet',
      component: <ConnectWallet goNext={() => goNext()} />,
    },
    {
      name: 'Pick Token',
      component: (
        <SelectToken
          goNext={() => goNext()}
          goBack={() => goBack()}
          setAsset={setAsset}
        />
      ),
    },
    {
      name: 'Intent Form',
      component: <SubmitIntent asset={asset} />,
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
            className={`size-2 cursor-pointer rounded-full transition-all duration-300 ${
              index < currentStep
                ? 'bg-primary-300 opacity-60 hover:opacity-100'
                : index === currentStep
                  ? 'bg-primary-base w-8'
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
