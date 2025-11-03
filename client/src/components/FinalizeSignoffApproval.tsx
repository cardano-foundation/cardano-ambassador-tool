import { useApp } from '@/context';
import { emitGlobalRefreshWithDelay } from '@/utils';
import { storageApiClient } from '@/utils/storageApiClient';
import { AdminDecisionData, TransactionConfirmationResult } from '@types';
import { Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import ErrorAccordion from './ErrorAccordion';
import TransactionConfirmationOverlay from './TransactionConfirmationOverlay';

interface FinalizeSignoffApprovalProps {
  txhash?: string;
  adminDecisionData?: AdminDecisionData | null;
  onFinalizationComplete?: () => void;
}

const FinalizeSignoffApproval: React.FC<FinalizeSignoffApprovalProps> = ({
  txhash,
  adminDecisionData,
  onFinalizationComplete,
}) => {
  const { wallet: walletState } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message: string;
    details?: string;
  } | null>(null);

  const getSignedCount = useCallback(() => {
    if (!adminDecisionData?.selectedAdmins || !adminDecisionData?.signers)
      return 0;

    return adminDecisionData.selectedAdmins.filter((admin) =>
      adminDecisionData.signers.includes(admin),
    ).length;
  }, [adminDecisionData]);

  const [showConfirmationOverlay, setShowConfirmationOverlay] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);

  const signatureRequirementsMet = useMemo(() => {
    if (!adminDecisionData) return false;
    const signedCount = getSignedCount();
    return signedCount >= adminDecisionData.selectedAdmins.length;
  }, [adminDecisionData, getSignedCount]);

  const hasAdminDecision = useMemo(() => {
    return adminDecisionData && adminDecisionData.decision;
  }, [adminDecisionData]);

  const handleFinalization = async () => {
    if (!adminDecisionData || !signatureRequirementsMet) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const wallet = await walletState!.wallet;

      if (!adminDecisionData.signedTx) {
        throw new Error('No signed transaction found in admin decision data');
      }

      const txHash = await wallet!.submitTx(adminDecisionData.signedTx);
      setConfirmedTxHash(txHash);
      setShowConfirmationOverlay(true);
    } catch (error) {
      console.error('Failed to submit signoff approval transaction:', error);
      setSubmitError({
        message: 'Failed to submit signoff approval',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransactionConfirmed = useCallback(
    async (result: TransactionConfirmationResult) => {
      setIsFinalized(true);
      onFinalizationComplete?.();

      if (txhash) {
        try {
          await storageApiClient.delete(txhash, 'signoff-submissions');
          console.log('Signoff approval data cleaned up successfully');
        } catch (error) {
          console.error('Failed to clean up signoff approval data:', error);
        }
      }

      emitGlobalRefreshWithDelay(2000);
    },
    [onFinalizationComplete, txhash],
  );

  const handleTransactionTimeout = (result: TransactionConfirmationResult) => {};

  const handleCloseConfirmationOverlay = useCallback(() => {
    setShowConfirmationOverlay(false);
    setConfirmedTxHash(null);
  }, []);

  return (
    <div className="space-y-4">
      <ErrorAccordion
        isVisible={!!submitError}
        message={submitError?.message}
        details={submitError?.details}
        onDismiss={() => setSubmitError(null)}
      />

      <Button
        variant="primary"
        onClick={handleFinalization}
        disabled={!signatureRequirementsMet}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Execute Signoff Approval
      </Button>

      {!hasAdminDecision && (
        <Paragraph size="sm" className="text-center text-gray-500">
          An admin needs to approve signoff for this proposal first.
        </Paragraph>
      )}

      {hasAdminDecision && !signatureRequirementsMet && adminDecisionData && (
        <div className="space-y-1 text-center">
          <Paragraph size="sm" className="text-gray-500">
            Waiting for {adminDecisionData.selectedAdmins.length - getSignedCount()} more
            signature(s) before execution.
          </Paragraph>
          <Paragraph size="xs" className="text-gray-400">
            ({getSignedCount()} of {adminDecisionData.selectedAdmins.length}{' '}
            required signatures)
          </Paragraph>
        </div>
      )}

      {signatureRequirementsMet && !isFinalized && adminDecisionData && (
        <div className="space-y-1 text-center">
          <Paragraph size="xs" className="text-green-500">
            ({getSignedCount()} of {adminDecisionData.selectedAdmins.length}{' '}
            required signatures complete)
          </Paragraph>
        </div>
      )}

      {isFinalized && (
        <Paragraph size="sm" className="text-center text-green-600">
          ✓ Signoff Approval Executed!
        </Paragraph>
      )}

      <TransactionConfirmationOverlay
        isVisible={showConfirmationOverlay}
        txHash={confirmedTxHash || undefined}
        title="Executing Signoff Approval"
        description={
          isFinalized
            ? 'Signoff approval has been successfully executed! 🎉'
            : 'Please wait while your signoff approval is being confirmed on the blockchain.'
        }
        onClose={handleCloseConfirmationOverlay}
        onConfirmed={handleTransactionConfirmed}
        onTimeout={handleTransactionTimeout}
      />
    </div>
  );
};

export default FinalizeSignoffApproval;