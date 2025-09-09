'use client';

import { useEffect, useState } from 'react';
import { CardanoLoaderSVG } from './ui/CardanoLoaderSVG';
import { getCurrentNetworkConfig } from '@/config/cardano';

interface AppLoadingScreenProps {
  isVisible: boolean;
  loadingMessage?: string;
}

export function AppLoadingScreen({
  isVisible,
  loadingMessage = 'Loading application...',
}: AppLoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const currentNetwork = getCurrentNetworkConfig().name;

  //fade out animation
  useEffect(() => {
    if (!isVisible && !fadeOut) {
      setFadeOut(true);
    }
  }, [isVisible, fadeOut]);

  if (!isVisible && fadeOut) {
    return null;
  }

  return (
    <div
      data-testid="app-loading-screen"
      className={`bg-background fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background gradient for visual appeal */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-primary-50/10 to-primary-100/5 dark:from-primary-400/5 dark:to-primary-300/10" /> */}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-6">
        {/* Cardano SVG Animation */}
        <div className="flex h-32 w-32 items-center justify-center md:h-40 md:w-40">
          <CardanoLoaderSVG size={128} className="md:scale-125" />
        </div>

        {/* Loading text */}
        <div className="space-y-4 text-center">
          <h1 className="text-foreground text-2xl font-bold md:text-3xl">
            Cardano Ambassador Tools
          </h1>
          <div className="space-y-2">
            <p className="text-muted-foreground text-base md:text-lg">
              {loadingMessage}
            </p>
            <div className="text-muted-foreground flex items-center justify-center space-x-2 text-sm">
              <div className="bg-primary-base h-2 w-2 rounded-full" />
              <span>
                Mode{' '}
                <span className="text-primary-base font-medium">
                  {currentNetwork}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
        <p className="text-muted-foreground text-xs">
          Initializing application...
        </p>
      </div>
    </div>
  );
}
