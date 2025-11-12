'use client';

import { getCurrentNetworkConfig } from '@/config/cardano';
import { waitForTransactionConfirmation } from '@/utils';
import { TransactionConfirmationResult } from '@types';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Button from './atoms/Button';
import Modal from './atoms/Modal';
import Paragraph from './atoms/Paragraph';
import CardanoLoaderSVG from './ui/CardanoLoaderSVG';

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
  /** Show navigation options */
  showNavigationOptions?: boolean;
  /** Navigation options */
  navigationOptions?: {
    label: string;
    url: string;
    variant?: 'primary' | 'outline';
  }[];
}

const TransactionConfirmationOverlay: React.FC<
  TransactionConfirmationOverlayProps
> = ({
  isVisible,
  txHash,
  title = 'Processing Transaction',
  description = 'Please wait while your transaction is being confirmed on the blockchain.',
  onClose,
  onConfirmed,
  onTimeout,
  showNavigationOptions,
  navigationOptions,
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

  const confirmationRunning = useRef(false);
  const currentTxHash = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isVisible) {
      confirmationRunning.current = false;
      currentTxHash.current = undefined;
      setConfirmationState({
        status: 'waiting',
        attempts: 0,
        timeTaken: 0,
      });
      return;
    }

    if (!txHash) {
      return;
    }

    // Prevent overlay from closing on global refresh events
    const handleGlobalRefresh = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    if (
      isVisible &&
      (confirmationState.status === 'confirmed' ||
        confirmationState.status === 'timeout')
    ) {
      window.addEventListener('app:refresh', handleGlobalRefresh, true);
    }

    if (confirmationRunning.current && currentTxHash.current === txHash) {
      return;
    }

    currentTxHash.current = txHash;
    confirmationRunning.current = true;

    const startConfirmation = async () => {
      setConfirmationState((prev) => ({
        ...prev,
        status: 'polling',
      }));

      try {
        const result = await waitForTransactionConfirmation(txHash, {
          timeout: 300000, // 5 minutes
          pollInterval: 10000, // 10 seconds
          onPoll: (attempt) => {
            setConfirmationState((prev) => ({
              ...prev,
              attempts: attempt,
              timeTaken: Date.now() - (Date.now() - attempt * 10000),
            }));
          },
        });

        confirmationRunning.current = false;

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
        confirmationRunning.current = false;
        setConfirmationState((prev) => ({
          ...prev,
          status: 'timeout',
          error: error instanceof Error ? error.message : 'Confirmation failed',
        }));
      }
    };

    startConfirmation();

    // Cleanup function
    return () => {
      window.removeEventListener('app:refresh', handleGlobalRefresh, true);
    };
  }, [isVisible, txHash]);

  if (!isVisible) {
    return null;
  }

  const getStatusContent = () => {
    switch (confirmationState.status) {
      case 'waiting':
        return (
          <div className="text-center">
            <CardanoLoaderSVG size={64} />
            <Paragraph size="sm">Preparing transaction...</Paragraph>
          </div>
        );

      case 'polling':
        return (
          <div className="text-center">
            <CardanoLoaderSVG size={64} />
            <h3 className="text-foreground mt-4 text-lg font-semibold">
              Waiting for Confirmation
            </h3>

            <div className="mt-4 space-y-2">
              <Paragraph size="sm">
                Attempt: {confirmationState.attempts}
              </Paragraph>
              <Paragraph size="sm">
                Time elapsed: {Math.floor(confirmationState.timeTaken / 1000)}s
              </Paragraph>
              {txHash && (
                <div className="mt-4">
                  <a
                    href={`${getCurrentNetworkConfig().explorerUrl}/transaction/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-2 text-sm hover:underline"
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
            <h3 className="text-foreground mt-4 text-lg font-semibold">
              Transaction Confirmed!
            </h3>
            <p className="text-muted-foreground mt-2">
              Your membership intent has been successfully updated on the
              blockchain.
            </p>
            <div className="mt-4 space-y-2">
              <Paragraph className="text-muted-foreground text-sm">
                Confirmed in {confirmationState.attempts} attempts
              </Paragraph>
              <Paragraph size="sm">
                Time taken: {Math.floor(confirmationState.timeTaken / 1000)}s
              </Paragraph>
              {txHash && (
                <div className="mt-4">
                  <a
                    href={`${getCurrentNetworkConfig().explorerUrl}/transaction/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-2 text-sm hover:underline"
                  >
                    View on Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            <div className="mt-6">
              {showNavigationOptions && navigationOptions ? (
                <div className="space-y-3">
                  {navigationOptions.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => (window.location.href = option.url)}
                      className="w-full"
                      variant={option.variant || 'outline'}
                    >
                      {option.label}
                    </Button>
                  ))}
                  <Button
                    onClick={onClose}
                    className="w-full"
                    variant="outline"
                  >
                    Stay Here
                  </Button>
                </div>
              ) : (
                <Button onClick={onClose} className="w-full" variant="primary">
                  Continue
                </Button>
              )}
            </div>
          </div>
        );

      case 'timeout':
        return (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <ExternalLink className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-foreground mt-4 text-lg font-semibold">
              Confirmation Timeout
            </h3>
            <Paragraph size="sm" className="text-muted-foreground mt-2">
              Transaction was submitted but confirmation timed out. It may still
              be processing.
            </Paragraph>
            {confirmationState.error && (
              <p className="mt-2 text-sm text-red-600">
                {confirmationState.error}
              </p>
            )}
            <div className="mt-4 space-y-2">
              <Paragraph size="sm">
                Attempts made: {confirmationState.attempts}
              </Paragraph>
              {txHash && (
                <div className="mt-4">
                  <a
                    href={`${getCurrentNetworkConfig().explorerUrl}/transaction/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-2 text-sm hover:underline"
                  >
                    Check Status on Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            <div className="mt-6 flex w-full flex-col gap-3">
              <Button variant="primary" onClick={onClose} className="w-full">
                Continue Anyway
              </Button>
              {txHash && (
                <Button
                  variant="outline"
                  className="w-full"
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
    <Modal
      isOpen={isVisible}
      onClose={() => {
        // Only allow closing when not polling
        if (confirmationState.status !== 'polling' && onClose) {
          onClose();
        }
      }}
      title={title}
      description={description}
      size="lg"
      showCloseButton={confirmationState.status !== 'polling'}
      closable={confirmationState.status !== 'polling'}
      className="text-center"
    >
      <div className="py-4">{getStatusContent()}</div>
    </Modal>
  );
};

export default TransactionConfirmationOverlay;
