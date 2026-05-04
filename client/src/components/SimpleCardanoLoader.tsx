"use client";

import { CardanoLoaderSVG } from "./ui/CardanoLoaderSVG";

interface SimpleCardanoLoaderProps {
  size?: number;
  className?: string;
  message?: string;
  fullscreen?: boolean;
}

export function SimpleCardanoLoader({
  size = 72,
  className = "",
  message = "Loading...",
  fullscreen = true,
}: SimpleCardanoLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`bg-background/60 supports-[backdrop-filter]:bg-background/40 flex w-full flex-col items-center justify-center gap-6 backdrop-blur-sm ${
        fullscreen ? "min-h-screen" : "py-16"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="border-primary-base/20 absolute h-[calc(100%+24px)] w-[calc(100%+24px)] animate-ping rounded-full border" />
        <div className="bg-card relative rounded-full p-4 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
          <CardanoLoaderSVG size={size} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-foreground/90 text-sm font-medium tracking-wide md:text-base">
          {message}
        </p>
        <div
          className="flex items-center gap-1.5"
          aria-hidden="true"
        >
          <span
            className="bg-primary-base h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="bg-primary-base h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="bg-primary-base h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>

      <span className="sr-only">{message}</span>
    </div>
  );
}

export default SimpleCardanoLoader;
