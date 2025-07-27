'use client';

import Button from '@/components/atoms/Button';
import { useWallet } from '@meshsdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import SelectToken, { AssetsDetail } from './components/SelectToken';
import SubmitIntent from './components/SubmitIntent';

function SignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const { connected } = useWallet();
  const [asset, setAsset] = useState<AssetsDetail | null>(null);

  const steps = [
    {
      component: <ConnectWallet />,
      showNavigation: true,
      canProceed: connected,
    },
    {
      component: <SelectToken setAsset={(asset) => setAsset(asset)} />,
      showNavigation: true,
      canProceed: !!asset,
    },
    {
      component: <SubmitIntent />,
      showNavigation: false,
      canProceed: false,
    },
  ];
  const goNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };


  const currentStepData = steps[currentStep];

  return (
    <div className="h-full w-full gap-8 p-6 lg:p-24">
      {/* Slide transition area */}
      <div className="relative h-full w-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="absolute flex h-full w-full flex-col items-center justify-center"
          >
            {currentStepData.component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {currentStepData.showNavigation && (
        <div className="flex w-full justify-between gap-4">
          {currentStep > 0 && (
            <Button variant="secondary" onClick={goBack}>
              Back
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button
              disabled={!currentStepData.canProceed}
              variant="primary"
              className="ml-auto"
              onClick={goNext}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default SignUp;
