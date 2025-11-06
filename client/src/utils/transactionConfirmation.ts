// ============================================================================
// Transaction Confirmation Utilities
// ============================================================================

import { TransactionConfirmationOptions, TransactionConfirmationResult } from "@types";
import { getProvider } from "./utils";

/**
 * Polls Blockfrost to check if a transaction is confirmed on-chain
 * @param txHash The transaction hash to check
 * @param options Configuration options for polling behavior
 * @returns Promise that resolves when transaction is confirmed or times out
 */
export async function waitForTransactionConfirmation(
  txHash: string,
  options: TransactionConfirmationOptions = {},
): Promise<TransactionConfirmationResult> {
  const {
    timeout = 300000, // 5 minutes default
    pollInterval = 10000, // 10 seconds default
    onPoll,
    onTimeout,
  } = options;

  const startTime = Date.now();
  let attempts = 0;
  const provider = getProvider();

  return new Promise((resolve) => {
    const poll = async () => {
      attempts++;
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      try {
        // Call the onPoll callback if provided
        onPoll?.(attempts, txHash);

        // Check if transaction exists on-chain
        const transaction = await provider.fetchTxInfo(txHash);

        if (transaction) {
          // Transaction found and confirmed
          resolve({
            confirmed: true,
            txHash,
            attempts,
            timeTaken: elapsed,
          });
          return;
        }
      } catch (error) {
        // If error is 404, transaction not found yet - continue polling
        // If other error, still continue polling as it might be temporary
        console.warn(
          `Poll attempt ${attempts} failed for tx ${txHash}:`,
          error,
        );
      }

      // Check if timeout reached
      if (elapsed >= timeout) {
        onTimeout?.(txHash);
        resolve({
          confirmed: false,
          txHash,
          attempts,
          timeTaken: elapsed,
          error:
            'Timeout reached - transaction not confirmed within the specified time',
        });
        return;
      }

      // Schedule next poll
      setTimeout(poll, pollInterval);
    };

    // Start polling
    poll();
  });
}

/**
 * Simplified version that just waits for confirmation with default options
 * @param txHash The transaction hash to check
 * @returns Promise that resolves to true if confirmed, false if timeout
 */
export async function isTransactionConfirmed(txHash: string): Promise<boolean> {
  const result = await waitForTransactionConfirmation(txHash);
  return result.confirmed;
}

/**
 * Waits for transaction confirmation with progress updates
 * @param txHash The transaction hash to check
 * @param onProgress Callback for progress updates
 * @returns Promise that resolves when confirmed or times out
 */
export async function waitForTransactionWithProgress(
  txHash: string,
  onProgress?: (status: string, attempt: number) => void,
): Promise<TransactionConfirmationResult> {
  return waitForTransactionConfirmation(txHash, {
    timeout: 300000, // 5 minutes
    pollInterval: 10000, // 10 seconds
    onPoll: (attempt) => {
      onProgress?.(
        `Checking transaction confirmation (attempt ${attempt})...`,
        attempt,
      );
    },
    onTimeout: () => {
      onProgress?.('Transaction confirmation timeout reached', 0);
    },
  });
}
