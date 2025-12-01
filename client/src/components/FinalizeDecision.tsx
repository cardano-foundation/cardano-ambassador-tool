import { useApp } from '@/context';
import { emitGlobalRefreshWithDelay, saveCounterUtxo } from '@/utils';
import { storageApiClient } from '@/utils/storageApiClient';
import { AdminDecisionData, TransactionConfirmationResult } from '@types';
import { Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import ErrorAccordion from './ErrorAccordion';

interface FinalizeDecisionProps {
  txhash?: string;
  adminDecisionData?: AdminDecisionData | null;
  context: 'MembershipIntent' | 'ProposalIntent';
  onFinalizationComplete?: () => void;
}

const FinalizeDecision: React.FC<FinalizeDecisionProps> = ({
  txhash,
  adminDecisionData,
  context,
  onFinalizationComplete,
}) => {
  const { wallet: walletState, showTxConfirmation } = useApp();
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

  const [isFinalized, setIsFinalized] = useState(false);

  const signatureRequirementsMet = useMemo(() => {
    if (!adminDecisionData) return false;
    const signedCount = getSignedCount();
    return signedCount >= adminDecisionData.selectedAdmins.length;
  }, [adminDecisionData, getSignedCount]);

  const hasAdminDecision = useMemo(() => {
    return adminDecisionData && adminDecisionData.decision;
  }, [adminDecisionData]);

  const getContextLabels = () => {
    if (context === 'MembershipIntent') {
      return {
        approveButton: 'Activate Membership',
        rejectButton: 'Execute Rejection',
        pendingMessage:
          'An admin needs to approve or reject this application first.',
        rejectedMessage:
          'This membership application has been rejected by an admin.',
        waitingMessage: 'Waiting for',
        readyMessage: '✓ All requirements met! Ready to activate membership.',
        completedMessage: '✓ Membership Activated!',
        overlayTitle: 'Activating Membership',
        overlayDescription: {
          pending:
            'Please wait while membership activation is being confirmed on the blockchain.',
          success: 'Membership has been successfully activated! 🎉',
        },
      };
    } else {
      return {
        approveButton: 'Execute Proposal Approval',
        rejectButton: 'Execute Proposal Rejection',
        pendingMessage:
          'An admin needs to approve or reject this proposal first.',
        rejectedMessage: 'This proposal has been rejected by an admin.',
        waitingMessage: 'Waiting for',
        readyMessage: `✓ All requirements met! Ready to ${adminDecisionData?.decision === 'approve' ? 'approve' : 'reject'} proposal.`,
        completedMessage: `✓ Proposal ${adminDecisionData?.decision === 'approve' ? 'Approved' : 'Rejected'}!`,
        overlayTitle: `${adminDecisionData?.decision === 'approve' ? 'Approving' : 'Rejecting'} Proposal`,
        overlayDescription: {
          pending: `Please wait while your proposal ${adminDecisionData?.decision === 'approve' ? 'approval' : 'rejection'} is being confirmed on the blockchain.`,
          success: `Your proposal has been successfully ${adminDecisionData?.decision === 'approve' ? 'approved' : 'rejected'}! 🎉`,
        },
      };
    }
  };

  const labels = getContextLabels();

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

      if (context === 'MembershipIntent') {
        try {
          await saveCounterUtxo(
            txHash,
            adminDecisionData.counterUtxoTxIndex || 0,
          );
        } catch (error) {
          console.error('Failed to update counter UTxO:', error);
        }
      }

      showTxConfirmation({
        txHash,
        title: labels.overlayTitle,
        description: labels.overlayDescription.pending,
        onConfirmed: handleTransactionConfirmed,
        onTimeout: handleTransactionTimeout,
        showNavigationOptions:
          context === 'ProposalIntent' &&
          adminDecisionData?.decision === 'approve',
        navigationOptions: [
          {
            label: 'Go to Treasury Signoff',
            url: '/manage/treasury-signoffs',
            variant: 'primary',
          },
          {
            label: 'Back to Proposals',
            url: '/manage/proposal-applications',
            variant: 'outline',
          },
        ],
      });
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      setSubmitError({
        message: 'Failed to submit transaction',
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
          await storageApiClient.delete(txhash, 'submissions');
        } catch (error) {
          console.error('Failed to clean up admin decision data:', error);
        }
      }

      emitGlobalRefreshWithDelay(2000);
    },
    [onFinalizationComplete, txhash],
  );

  const handleTransactionTimeout = (
    result: TransactionConfirmationResult,
  ) => {};

  return (
    <div className="space-y-4">
      <ErrorAccordion
        isVisible={!!submitError}
        message={submitError?.message}
        details={submitError?.details}
        onDismiss={() => setSubmitError(null)}
      />

      <Button
        variant={
          adminDecisionData?.decision === 'approve' ? 'primary' : 'outline'
        }
        onClick={handleFinalization}
        disabled={!signatureRequirementsMet}
        className={`w-full ${adminDecisionData?.decision === 'reject' ? 'text-primary-base!' : ''}`}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {adminDecisionData?.decision === 'approve'
          ? labels.approveButton
          : adminDecisionData?.decision === 'reject'
            ? labels.rejectButton
            : 'Process Decision'}
      </Button>

      {!hasAdminDecision && (
        <Paragraph size="sm" className="text-center text-gray-500">
          {labels.pendingMessage}
        </Paragraph>
      )}

      {adminDecisionData?.decision === 'reject' && (
        <Paragraph size="sm" className="text-primary-base text-center">
          {labels.rejectedMessage}
        </Paragraph>
      )}

      {hasAdminDecision &&
        adminDecisionData?.decision === 'approve' &&
        !signatureRequirementsMet && (
          <div className="space-y-1 text-center">
            <Paragraph size="sm" className="text-gray-500">
              {labels.waitingMessage}{' '}
              {adminDecisionData.selectedAdmins.length - getSignedCount()} more
              signature(s) before finalization.
            </Paragraph>
      
          </div>
        )}

      {signatureRequirementsMet &&
        adminDecisionData?.decision === 'approve' &&
        !isFinalized && (
          <div className="space-y-1 text-center">
            <Paragraph size="xs" className="text-green-500">
              ({getSignedCount()} of {adminDecisionData.selectedAdmins.length}{' '}
              required signatures complete)
            </Paragraph>
          </div>
        )}

      {isFinalized && (
        <Paragraph size="sm" className="text-center text-green-600">
          {labels.completedMessage}
        </Paragraph>
      )}
    </div>
  );
};

export default FinalizeDecision;
