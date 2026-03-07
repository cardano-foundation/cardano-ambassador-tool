"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  showTxConfirmation as showTxConfirmationAction,
  hideTxConfirmation as hideTxConfirmationAction,
  selectTxConfirmation,
} from "@/lib/redux/features/ui";
import { TransactionConfirmationResult } from "@types";

export interface TxConfirmationOptions {
  txHash: string;
  title?: string;
  description?: string;
  onConfirmed?: (result: TransactionConfirmationResult) => void;
  onTimeout?: (result: TransactionConfirmationResult) => void;
  showNavigationOptions?: boolean;
  navigationOptions?: {
    label: string;
    url: string;
    variant?: "primary" | "outline";
  }[];
}

/**
 * Hook for transaction confirmation overlay.
 * Uses Redux for state management.
 */
export function useTxConfirmation() {
  const dispatch = useAppDispatch();
  const txConfirmation = useAppSelector(selectTxConfirmation);

  const showTxConfirmation = useCallback(
    (options: TxConfirmationOptions) => {
      // Store callbacks in a global registry since they can't go in Redux
      if (typeof window !== "undefined") {
        (window as any).__txConfirmationCallbacks = {
          onConfirmed: options.onConfirmed,
          onTimeout: options.onTimeout,
        };
      }

      dispatch(
        showTxConfirmationAction({
          txHash: options.txHash,
          title: options.title,
          description: options.description,
          showNavigationOptions: options.showNavigationOptions,
          navigationOptions: options.navigationOptions,
        }),
      );
    },
    [dispatch],
  );

  const hideTxConfirmation = useCallback(() => {
    dispatch(hideTxConfirmationAction());
  }, [dispatch]);

  return {
    txConfirmation,
    showTxConfirmation,
    hideTxConfirmation,
  };
}
