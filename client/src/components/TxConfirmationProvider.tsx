"use client";

import TransactionConfirmationOverlay from "./TransactionConfirmationOverlay";
import { useTxConfirmation } from "../hooks";

/**
 * Provider component that renders the TransactionConfirmationOverlay.
 * Uses Redux state via useTxConfirmation hook.
 */
export function TxConfirmationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { txConfirmation, hideTxConfirmation } = useTxConfirmation();

  // Get callbacks from window registry
  const callbacks =
    typeof window !== "undefined"
      ? (window as any).__txConfirmationCallbacks
      : {};

  return (
    <>
      {children}
      <TransactionConfirmationOverlay
        isVisible={txConfirmation.isVisible}
        txHash={txConfirmation.txHash}
        title={txConfirmation.title}
        description={txConfirmation.description}
        onClose={hideTxConfirmation}
        onConfirmed={(result) => {
          callbacks?.onConfirmed?.(result);
          hideTxConfirmation();
        }}
        onTimeout={callbacks?.onTimeout}
        showNavigationOptions={txConfirmation.showNavigationOptions}
        navigationOptions={txConfirmation.navigationOptions}
      />
    </>
  );
}
