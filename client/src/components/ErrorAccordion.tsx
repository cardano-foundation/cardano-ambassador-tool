'use client';

import { cn } from '@/utils';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorAccordionProps {
  /**
   * The main error message to display (user-friendly)
   */
  message?: string;
  /**
   * Detailed error message (technical details)
   */
  details?: string;
  /**
   * Whether to show the error component
   */
  isVisible?: boolean;
  /**
   * Callback when error is dismissed
   */
  onDismiss?: () => void;
  /**
   * Custom styling classes
   */
  className?: string;
  /**
   * Variant for different error types
   */
  variant?: 'error' | 'warning';
}

const ErrorAccordion = ({
  message = 'Submission failed',
  details,
  isVisible = false,
  onDismiss,
  className,
  variant = 'error',
}: ErrorAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) {
    return (
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: 0, opacity: 0 }}
      />
    );
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const hasDetails = details && details.trim().length > 0;
  const shouldShowToggle = hasDetails && details !== message;

  const baseClasses = cn(
    'w-full max-w-full border rounded-lg p-4 shadow-md transition-all duration-300 ease-out',
    'transform translate-y-0 opacity-100 overflow-hidden',
    variant === 'error'
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-yellow-50 border-yellow-200 text-yellow-800',
    className,
  );

  return (
    <div
      className="w-full max-w-full overflow-hidden transition-all duration-300 ease-out"
      style={{ maxHeight: '500px' }}
    >
      <div className={baseClasses}>
        <div className="flex min-w-0 items-start gap-3">
          {/* Error Icon */}
          <div className="mt-0.5 flex-shrink-0">
            <AlertTriangle
              className={cn(
                'h-5 w-5',
                variant === 'error' ? 'text-primary-base' : 'text-yellow-500',
              )}
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 overflow-hidden">
            {/* Main Message */}
            <div className="flex min-w-0 items-start justify-between gap-2">
              <p className="overflow-wrap-anywhere min-w-0 flex-1 text-sm leading-5 font-medium break-words">
                {message}
              </p>

              {/* Dismiss Button */}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={cn(
                    'flex-shrink-0 rounded-md p-0.5 transition-colors hover:cursor-pointer',
                    variant === 'error'
                      ? 'text-primary-400 hover:text-primary-500 hover:bg-primary-100'
                      : 'text-yellow-400 hover:bg-yellow-100 hover:text-yellow-500',
                  )}
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Toggle Button */}
            {shouldShowToggle && (
              <button
                onClick={toggleExpanded}
                className={cn(
                  'mt-2 inline-flex items-center gap-1 text-xs font-medium transition-colors',
                  variant === 'error'
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-yellow-600 hover:text-yellow-700',
                )}
              >
                {isExpanded ? 'See less' : 'See more'}
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}

            {/* Expanded Details */}
            {isExpanded && hasDetails && (
              <div
                className={cn(
                  'mt-3 border-t pt-3 transition-all duration-300',
                  variant === 'error' ? 'border-red-200' : 'border-yellow-200',
                )}
              >
                <div
                  className={cn(
                    'max-h-40 w-full overflow-auto rounded-md p-3 font-mono text-xs',
                    variant === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700',
                  )}
                >
                  <pre className="overflow-wrap-anywhere word-break w-full max-w-full break-words break-all whitespace-pre-wrap">
                    {details}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorAccordion;
