'use client';

import { TransactionConfirmationResult } from '@types';
import { waitForTransactionConfirmation } from '@/utils/utils';
import { CheckCircle, ExternalLink, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from './atoms/Button';
import { getCurrentNetworkConfig } from '@/config/cardano';

interface TransactionConfirmationOverlayProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Transaction hash to wait for confirmation */
  txHash?: string;
  /** Title to show in the overlay */
  title?: string;
  /** Description to show in the overlay */
  description?: string;
  /** Called when the overlay should be closed */
  onClose?: () => void;
  /** Called when transaction is confirmed */
  onConfirmed?: (result: TransactionConfirmationResult) => void;
  /** Called when transaction confirmation times out */
  onTimeout?: (result: TransactionConfirmationResult) => void;
}

const TransactionConfirmationOverlay: React.FC<TransactionConfirmationOverlayProps> = ({
  isVisible,
  txHash,
  title = 'Processing Transaction',
  description = 'Please wait while your transaction is being confirmed on the blockchain.',
  onClose,
  onConfirmed,
  onTimeout,
}) => {
  const [confirmationState, setConfirmationState] = useState<{
    status: 'waiting' | 'polling' | 'confirmed' | 'timeout';
    attempts: number;
    timeTaken: number;
    error?: string;
  }>({
    status: 'waiting',
    attempts: 0,
    timeTaken: 0,
  });

  useEffect(() => {
    if (!isVisible || !txHash) {
      setConfirmationState({
        status: 'waiting',
        attempts: 0,
        timeTaken: 0,
      });
      return;
    }

    const startConfirmation = async () => {
      setConfirmationState(prev => ({
        ...prev,
        status: 'polling',
      }));

      try {
        const result = await waitForTransactionConfirmation(txHash, {
          timeout: 300000, // 5 minutes
          pollInterval: 10000, // 10 seconds
          onPoll: (attempt) => {
            setConfirmationState(prev => ({
              ...prev,
              attempts: attempt,
              timeTaken: Date.now() - (Date.now() - (attempt * 10000)), // rough estimate
            }));
          },
        });

        if (result.confirmed) {
          setConfirmationState({
            status: 'confirmed',
            attempts: result.attempts,
            timeTaken: result.timeTaken,
          });
          onConfirmed?.(result);
        } else {
          setConfirmationState({
            status: 'timeout',
            attempts: result.attempts,
            timeTaken: result.timeTaken,
            error: result.error,
          });
          onTimeout?.(result);
        }
      } catch (error) {
        setConfirmationState(prev => ({
          ...prev,
          status: 'timeout',
          error: error instanceof Error ? error.message : 'Confirmation failed',
        }));
      }
    };

    startConfirmation();
  }, [isVisible, txHash, onConfirmed, onTimeout]);

  if (!isVisible) {
    return null;
  }

  const getStatusContent = () => {
    switch (confirmationState.status) {
      case 'waiting':
        return (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>
        );

      case 'polling':
        return (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Waiting for Confirmation
            </h3>
            <p className="mt-2 text-muted-foreground">
              Checking blockchain for transaction confirmation...
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Attempt: {confirmationState.attempts}
              </p>
              <p className="text-sm text-muted-foreground">
                Time elapsed: {Math.floor(confirmationState.timeTaken / 1000)}s
              </p>
              {txHash && (
                <div className="mt-4">
                  <a
                    href={`${getCurrentNetworkConfig().explorerUrl}/transaction/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    View on Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        );

      case 'confirmed':
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Transaction Confirmed!
            </h3>
            <p className="mt-2 text-muted-foreground">
              Your membership intent has been successfully updated on the blockchain.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Confirmed in {confirmationState.attempts} attempts
              </p>
              <p className="text-sm text-muted-foreground">
                Time taken: {Math.floor(confirmationState.timeTaken / 1000)}s
              </p>
              {txHash && (
                <div className="mt-4">
                  <a
                    href={`${getCurrentNetworkConfig().explorerUrl}/transaction/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    View on Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button onClick={onClose} className="px-8">
                Continue
              </Button>
            </div>
          </div>
        );

      case 'timeout':
        return (
          <div className="text-center">
            <X className="mx-auto h-12 w-12 text-orange-500" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Confirmation Timeout
            </h3>
            <p className="mt-2 text-muted-foreground">
              Transaction was submitted but confirmation timed out. It may still be processing.
            </p>
            {confirmationState.error && (
              <p className="mt-2 text-sm text-red-600">
                {confirmationState.error}
              </p>
            )}
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Attempts made: {confirmationState.attempts}
              </p>
              {txHash && (
                <div className="mt-4">
                  <a
                    href={`${getCurrentNetworkConfig().explorerUrl}/transaction/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Check Status on Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Continue Anyway
              </Button>
              {txHash && (
                <Button
                  onClick={() => {
                    setConfirmationState({
                      status: 'waiting',
                      attempts: 0,
                      timeTaken: 0,
                    });
                  }}
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div className="relative mx-4 max-w-lg rounded-lg border bg-card p-6 shadow-lg">
        {/* Close button - only show if onClose is provided and not in polling state */}
        {onClose && confirmationState.status !== 'polling' && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        {getStatusContent()}
      </div>
    </div>
  );
};

export default TransactionConfirmationOverlay;
