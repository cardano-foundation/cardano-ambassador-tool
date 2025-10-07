import { AdminDecisionData, TransactionConfirmationResult } from '@types';
import { useMemo, useState, useCallback } from 'react';
import { useApp } from '@/context';
import { emitGlobalRefreshWithDelay } from '@/utils';
import { Loader2 } from 'lucide-react';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import TransactionConfirmationOverlay from './TransactionConfirmationOverlay';
import ErrorAccordion from './ErrorAccordion';

interface ActivateMembershipProps {
  txhash?: string;
  adminDecisionData?: AdminDecisionData | null;
}

const ActivateMembership: React.FC<ActivateMembershipProps> = ({
  txhash,
  adminDecisionData,
}) => {
  const { wallet: walletState } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message: string;
    details?: string;
  } | null>(null);
  
  // Transaction confirmation overlay state
  const [showConfirmationOverlay, setShowConfirmationOverlay] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  // Calculate if minimum signature requirements are met
  const signatureRequirementsMet = useMemo(() => {
    if (!adminDecisionData) return false;
    return adminDecisionData.totalSigners >= adminDecisionData.minRequiredSigners;
  }, [adminDecisionData]);

  // Calculate if there's an admin decision at all
  const hasAdminDecision = useMemo(() => {
    return adminDecisionData && adminDecisionData.decision;
  }, [adminDecisionData]);

  // Check wallet connection status
  const isWalletConnected = useMemo(() => {
    return walletState && walletState.wallet;
  }, [walletState]);


  const handleActivation = async () => {
    if (!isWalletConnected || !adminDecisionData || !signatureRequirementsMet) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null); // Clear any previous errors

    try {
      const wallet = await walletState!.wallet;
      
      if (!adminDecisionData.signedTx) {
        throw new Error('No signed transaction found in admin decision data');
      }
      
      // Submit the pre-signed transaction to the network
      const txHash = await wallet!.submitTx(adminDecisionData.signedTx);
            
      // Show transaction confirmation overlay
      setConfirmedTxHash(txHash);
      setShowConfirmationOverlay(true);
      
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      setSubmitError({
        message: 'Failed to submit transaction',
        details: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful transaction confirmation
  const handleTransactionConfirmed = useCallback((result: TransactionConfirmationResult) => {
    setIsActivated(true);
    
    // Trigger global refresh after successful membership activation
    // Use delay to allow UI updates to complete first
    emitGlobalRefreshWithDelay(2000);
  }, []);

  // Handle transaction confirmation timeout
  const handleTransactionTimeout = (result: TransactionConfirmationResult) => {
    // Keep overlay open so user can check status manually
  };

  // Handle closing the confirmation overlay
  const handleCloseConfirmationOverlay = useCallback(() => {
    setShowConfirmationOverlay(false);
    setConfirmedTxHash(null);
  }, []);


  return (
    <div className="space-y-4 ">
      {/* Error Accordion */}
      <ErrorAccordion
        isVisible={!!submitError}
        message={submitError?.message}
        details={submitError?.details}
        onDismiss={() => setSubmitError(null)}
      />

      {/* Activation Button */}
      <Button
        variant={'primary'}
        onClick={handleActivation}
        disabled={!signatureRequirementsMet}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Activate Member
      </Button>


      {!hasAdminDecision && isWalletConnected && (
        <Paragraph size="sm" className="text-center text-gray-500">
          An admin needs to approve or reject this application first.
        </Paragraph>
      )}

      {adminDecisionData?.decision === 'reject' && (
        <Paragraph size="sm" className="text-center text-red-600">
          This membership application has been rejected by an admin.
        </Paragraph>
      )}

      {hasAdminDecision &&
        adminDecisionData?.decision === 'approve' &&
        !signatureRequirementsMet && (
          <Paragraph size="sm" className="text-center text-gray-500">
            Waiting for{' '}
            {adminDecisionData.minRequiredSigners -
              adminDecisionData.totalSigners}{' '}
            more signature(s) before activation.
          </Paragraph>
        )}

      {signatureRequirementsMet &&
        adminDecisionData?.decision === 'approve' &&
        !isActivated && (
          <Paragraph size="sm" className="text-center text-green-600">
            ✓ All requirements met! Ready to activate membership.
          </Paragraph>
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
            ? 'Your membership has been successfully activated! 🎉'
            : 'Please wait while your membership activation is being confirmed on the blockchain.'
        }
        onClose={handleCloseConfirmationOverlay}
        onConfirmed={handleTransactionConfirmed}
        onTimeout={handleTransactionTimeout}
      />
    </div>
  );
};

export default ActivateMembership;
