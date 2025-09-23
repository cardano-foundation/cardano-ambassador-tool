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
  /**
   * Whether the component should overlay other content
   */
  overlay?: boolean;
}

const ErrorAccordion = ({
  message = 'Submission failed',
  details,
  isVisible = false,
  onDismiss,
  className,
  variant = 'error',
  overlay = true,
}: ErrorAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const hasDetails = details && details.trim().length > 0;
  const shouldShowToggle = hasDetails && details !== message;

  const baseClasses = cn(
    'border rounded-lg p-4 shadow-md transition-all duration-300',
    variant === 'error'
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-yellow-50 border-yellow-200 text-yellow-800',
    overlay && 'relative z-50',
    className,
  );

  const overlayClasses = overlay ? 'absolute w-full  mx-auto' : '';

  return (
    <div className={cn(overlayClasses)}>
      <div className={baseClasses}>
        <div className="flex items-start gap-3">
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
          <div className="min-w-0 flex-1">
            {/* Main Message */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm leading-5 font-medium">{message}</p>

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
                    'max-h-40 overflow-auto rounded-md p-3 font-mono text-xs',
                    variant === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700',
                  )}
                >
                  <pre className="break-words whitespace-pre-wrap">
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
