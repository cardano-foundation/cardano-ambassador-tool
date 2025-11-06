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
  message = 'Loading...',
}: SimpleCardanoLoaderProps) {
  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center space-y-6 ${className}`}
    >
      <CardanoLoaderSVG size={size} />
      <div className="space-y-2 text-center">
        <p className="text-muted-foreground animate-pulse text-base">
          {message}
        </p>
        <div className="flex justify-center space-x-1">
          <div
            className="bg-primary-base h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="bg-primary-base h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="bg-primary-base h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}

export default SimpleCardanoLoader;
