import { useWalletManager } from "../hooks";
import { emitGlobalRefreshWithDelay, saveCounterUtxo } from "../utils";
import { storageApiClient } from "../utils/storageApiClient";
import { AdminDecisionData, TransactionConfirmationResult } from "@types";
import { Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Button from "./atoms/Button";
import Paragraph from "./atoms/Paragraph";
import ErrorAccordion from "./ErrorAccordion";
import TransactionConfirmationOverlay from "./TransactionConfirmationOverlay";

interface ActivateMembershipProps {
  txHash?: string;
  adminDecisionData?: AdminDecisionData | null;
  onActivationComplete?: () => void;
}

const ActivateMembership: React.FC<ActivateMembershipProps> = ({
  txHash,
  adminDecisionData,
  onActivationComplete,
}) => {
  const { wallet } = useWalletManager();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message: string;
    details?: string;
  } | null>(null);

  // Helper function to calculate signed count from selected signers
  const getSignedCount = useCallback(() => {
    if (!adminDecisionData?.selectedAdmins || !adminDecisionData?.signers)
      return 0;

    return adminDecisionData.selectedAdmins.filter((admin) =>
      adminDecisionData.signers.includes(admin),
    ).length;
  }, [adminDecisionData]);

  // Transaction confirmation overlay state
  const [showConfirmationOverlay, setShowConfirmationOverlay] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  // Calculate if minimum signature requirements are met
  const signatureRequirementsMet = useMemo(() => {
    if (!adminDecisionData) return false;
    const signedCount = getSignedCount();
    return signedCount >= adminDecisionData.selectedAdmins.length;
  }, [adminDecisionData, getSignedCount]);

  // Calculate if there's an admin decision at all
  const hasAdminDecision = useMemo(() => {
    return adminDecisionData && adminDecisionData.decision;
  }, [adminDecisionData]);

  const handleActivation = async () => {
    if (!adminDecisionData || !signatureRequirementsMet) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!wallet) {
        throw new Error("Wallet not connected");
      }

      if (!adminDecisionData.signedTx) {
        throw new Error("No signed transaction found in admin decision data");
      }

      const txHash = await wallet.submitTx(adminDecisionData.signedTx);

      try {
        await saveCounterUtxo(
          txHash,
          adminDecisionData.counterUtxoTxIndex || 0,
        );
      } catch (error) {
        console.error("Failed to update counter UTxO:", error);
      }

      setConfirmedTxHash(txHash);
      setShowConfirmationOverlay(true);
    } catch (error) {
      console.error("Failed to submit transaction:", error);
      setSubmitError({
        message: "Failed to submit transaction",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransactionConfirmed = useCallback(
    async (result: TransactionConfirmationResult) => {
      setIsActivated(true);
      onActivationComplete?.();

      if (txHash) {
        try {
          await storageApiClient.delete(txHash, "submissions");
        } catch (error) {
          console.error("Failed to clean up admin decision data:", error);
        }
      }

      emitGlobalRefreshWithDelay(2000);
    },
    [onActivationComplete, txHash],
  );

  const handleTransactionTimeout = (
    result: TransactionConfirmationResult,
  ) => {};

  const handleCloseConfirmationOverlay = useCallback(() => {
    setShowConfirmationOverlay(false);
    setConfirmedTxHash(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Error Accordion */}
      <ErrorAccordion
        isVisible={!!submitError}
        message={submitError?.message}
        details={submitError?.details}
        onDismiss={() => setSubmitError(null)}
      />

      {/* Action Button */}
      <Button
        variant={
          adminDecisionData?.decision === "approve" ? "primary" : "outline"
        }
        onClick={handleActivation}
        disabled={!signatureRequirementsMet}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {adminDecisionData?.decision === "approve"
          ? "Activate Membership"
          : adminDecisionData?.decision === "reject"
            ? "Execute Rejection"
            : "Process Decision"}
      </Button>

      {!hasAdminDecision && (
        <Paragraph size="sm" className="text-center text-gray-500">
          An admin needs to approve or reject this application first.
        </Paragraph>
      )}

      {adminDecisionData?.decision === "reject" && (
        <Paragraph size="sm" className="text-primary-base text-center">
          This membership application has been rejected by an admin.
        </Paragraph>
      )}

      {hasAdminDecision &&
        adminDecisionData?.decision === "approve" &&
        !signatureRequirementsMet && (
          <div className="space-y-1 text-center">
            <Paragraph size="sm" className="text-gray-500">
              Waiting for{" "}
              {adminDecisionData.selectedAdmins.length - getSignedCount()} more
              signature(s) before activation.
            </Paragraph>
          </div>
        )}

      {signatureRequirementsMet &&
        adminDecisionData?.decision === "approve" &&
        !isActivated && (
          <div className="space-y-1 text-center">
            <Paragraph size="sm" className="text-green-600">
              ✓ All requirements met! Ready to activate membership.
            </Paragraph>
            <Paragraph size="xs" className="text-green-500">
              ({getSignedCount()} of {adminDecisionData.selectedAdmins.length}{" "}
              required signatures complete)
            </Paragraph>
          </div>
        )}

      {isActivated && (
        <Paragraph size="sm" className="text-center text-green-600">
          ✓ Membership Activated!
        </Paragraph>
      )}

      {/* Transaction Confirmation Overlay */}
      <TransactionConfirmationOverlay
        isVisible={showConfirmationOverlay}
        txHash={confirmedTxHash || undefined}
        title="Activating Membership"
        description={
          isActivated
            ? "Membership has been successfully activated! 🎉"
            : "Please wait while membership activation is being confirmed on the blockchain."
        }
        onClose={handleCloseConfirmationOverlay}
        onConfirmed={handleTransactionConfirmed}
        onTimeout={handleTransactionTimeout}
        showNavigationOptions={isActivated}
        navigationOptions={[
          { label: "View Members", url: "/", variant: "primary" },
          {
            label: "Back to Applications",
            url: "/manage/membership-applications",
            variant: "outline",
          },
        ]}
      />
    </div>
  );
};

export default ActivateMembership;
