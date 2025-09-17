'use client';

import { CardanoLoaderSVG } from './ui/CardanoLoaderSVG';

interface SimpleCardanoLoaderProps {
  size?: number;
  className?: string;
  message?: string;
}

export function SimpleCardanoLoader({ 
  size = 64, 
  className = '',
  message = 'Loading...' 
}: SimpleCardanoLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen space-y-6 ${className}`}>
      <CardanoLoaderSVG size={size} />
      <div className="text-center space-y-2">
        <p className="text-base text-muted-foreground animate-pulse">
          {message}
        </p>
        <div className="flex space-x-1 justify-center">
          <div className="w-1.5 h-1.5 bg-primary-base rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-primary-base rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-primary-base rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default SimpleCardanoLoader;
