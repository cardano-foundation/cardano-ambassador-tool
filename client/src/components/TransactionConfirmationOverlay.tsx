'use client';

import { TransactionConfirmationResult } from '@types';
import { waitForTransactionConfirmation } from '@/utils';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Button from './atoms/Button';
import { getCurrentNetworkConfig } from '@/config/cardano';
import Modal from './atoms/Modal';
import Paragraph from './atoms/Paragraph';

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
  
  // Ref to track if confirmation is already running
  const confirmationRunning = useRef(false);
  // Ref to store the current txHash to compare changes
  const currentTxHash = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isVisible || !txHash) {
      // Reset state when not visible or no txHash
      confirmationRunning.current = false;
      currentTxHash.current = undefined;
      setConfirmationState({
        status: 'waiting',
        attempts: 0,
        timeTaken: 0,
      });
      return;
    }

    // If confirmation is already running for the same transaction, don't start again
    if (confirmationRunning.current && currentTxHash.current === txHash) {
      return;
    }

    // Update current transaction hash
    currentTxHash.current = txHash;
    confirmationRunning.current = true;

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

        // Mark confirmation as completed
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
        setConfirmationState(prev => ({
          ...prev,
          status: 'timeout',
          error: error instanceof Error ? error.message : 'Confirmation failed',
        }));
      }
    };

    startConfirmation();
  }, [isVisible, txHash]);

  if (!isVisible) {
    return null;
  }

  const getStatusContent = () => {
    switch (confirmationState.status) {
      case 'waiting':
        return (
          <div className="text-center">
            <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
            <Paragraph size="sm">Preparing transaction...</Paragraph>
          </div>
        );

      case 'polling':
        return (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Waiting for Confirmation
            </h3>

            <div className="mt-4 space-y-2">
              <Paragraph size='sm'>
                Attempt: {confirmationState.attempts}
              </Paragraph>
              <Paragraph size='sm'>
                Time elapsed: {Math.floor(confirmationState.timeTaken / 1000)}s
              </Paragraph>
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
              <Paragraph className="text-sm text-muted-foreground">
                Confirmed in {confirmationState.attempts} attempts
              </Paragraph>
              <Paragraph size='sm'>
                Time taken: {Math.floor(confirmationState.timeTaken / 1000)}s
              </Paragraph>
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
              <Button onClick={onClose} className="w-full" variant="primary">
                Continue
              </Button>
            </div>
          </div>
        );

      case 'timeout':
        return (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <ExternalLink className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Confirmation Timeout
            </h3>
            <Paragraph size='sm' className="mt-2 text-muted-foreground">
              Transaction was submitted but confirmation timed out. It may still be processing.
            </Paragraph>
            {confirmationState.error && (
              <p className="mt-2 text-sm text-red-600">
                {confirmationState.error}
              </p>
            )}
            <div className="mt-4 space-y-2">
              <Paragraph size='sm'>
                Attempts made: {confirmationState.attempts}
              </Paragraph>
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
            <div className="mt-6 flex flex-col gap-3 w-full">
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
      <div className="py-4">
        {getStatusContent()}
      </div>
    </Modal>
  );
};

export default TransactionConfirmationOverlay;
