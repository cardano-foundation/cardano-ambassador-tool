'use client';

import { useEffect, useState } from 'react';
import { CardanoLoaderSVG } from './ui/CardanoLoaderSVG';
import { getNetworkDisplayName } from '@/config/cardano';
import { useNetwork } from '@/context/AppContext';

interface AppLoadingScreenProps {
  isVisible: boolean;
  loadingMessage?: string;
}

export function AppLoadingScreen({ isVisible, loadingMessage = 'Loading application...' }: AppLoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const { currentNetwork } = useNetwork();

  useEffect(() => {
    if (!isVisible && !fadeOut) {
      // Start fade out animation
      setFadeOut(true);
    }
  }, [isVisible, fadeOut]);

  if (!isVisible && fadeOut) {
    // After fade out is complete, don't render the component
    return null;
  }

  return (
    <div
      data-testid="app-loading-screen"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background gradient for visual appeal */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-primary-50/10 to-primary-100/5 dark:from-primary-400/5 dark:to-primary-300/10" /> */}
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-6">
        
        {/* Cardano SVG Animation */}
        <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
          <CardanoLoaderSVG 
            size={128}
            className="md:scale-125"
          />
        </div>
        
        {/* Loading text */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Cardano Ambassador Tools
          </h1>
          <div className="space-y-2">
            <p className="text-base md:text-lg text-muted-foreground">
              {loadingMessage}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary-base" />
              <span>
                Connected to <span className="text-primary-base font-medium">
                  {getNetworkDisplayName(currentNetwork)}
                </span>
              </span>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-muted-foreground">
          Initializing application...
        </p>
      </div>
    </div>
  );
}
