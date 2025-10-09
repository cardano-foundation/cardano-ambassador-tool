import { useApp } from '@/context';
import { findAdminsFromOracle } from '@/lib/auth/roles';
import {
  dbUtxoToMeshUtxo,
  extractRequiredSigners,
  extractWitnesses,
  findOracleUtxo,
  getCatConstants,
  getCounterUtxo,
  getProvider,
} from '@/utils';
import { storageApiClient } from '@/utils/storageApiClient';
import { deserializeAddress } from '@meshsdk/core';
import { AdminActionTx } from '@sidan-lab/cardano-ambassador-tool';
import { AdminDecision, AdminDecisionData, Utxo } from '@types';
import React, { useEffect, useState } from 'react';
import AdminSelectorModal from './AdminSelectorModal';
import Button from './atoms/Button';
import ErrorAccordion from './ErrorAccordion';
interface ApproveRejectProps {
  intentUtxo?: Utxo;
  context: string;
  onDecisionUpdate?: (data: AdminDecisionData | null) => void;
}

const ApproveReject: React.FC<ApproveRejectProps> = ({
  intentUtxo,
  context,
  onDecisionUpdate,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingDecision, setIsLoadingDecision] = useState(true);
  const [submitError, setSubmitError] = useState<{
    message: string;
    details?: string;
  } | null>(null);
  const [adminDecision, setAdminDecision] = useState<AdminDecision | null>(
    null,
  );
  const [currentWalletHasSigned, setCurrentWalletHasSigned] = useState(false);
  const [showAdminSelector, setShowAdminSelector] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<
    'approve' | 'reject' | null
  >(null);
  const { wallet: walletState } = useApp();

  // Function to check if current wallet has already signed
  const checkCurrentWalletSigned = async (adminDecision: AdminDecision) => {
    try {
      if (!walletState || !adminDecision.signedTx) {
        setCurrentWalletHasSigned(false);
        return;
      }

      const wallet = await walletState.wallet;
      const currentAddress = await wallet!.getChangeAddress();
      const currentPubKeyHash = deserializeAddress(currentAddress).pubKeyHash;
      const signers = extractWitnesses(adminDecision.signedTx);
      const hasSigned = signers?.includes(currentPubKeyHash) || false;
      setCurrentWalletHasSigned(hasSigned);
    } catch (error) {
      console.error('Error checking wallet signature status:', error);
      setCurrentWalletHasSigned(false);
    }
  };

  const extractAndSendDecisionData = async (adminDecision: AdminDecision) => {
    try {
      const signers = extractWitnesses(adminDecision.signedTx);
      const selectedAdmins = extractRequiredSigners(adminDecision.signedTx);

      const adminData = await findAdminsFromOracle();

      if (!adminData) {
        console.error('Could not fetch admin data from oracle');
        return;
      }

      const decisionData: AdminDecisionData = {
        ...adminDecision,
        signers: signers || [],
        selectedAdmins: selectedAdmins || [],
        minRequiredSigners: Number(adminData.minsigners),
        totalSigners: (signers || []).length,
      };

      onDecisionUpdate?.(decisionData);

      await checkCurrentWalletSigned(adminDecision);
    } catch (error) {
      console.error('Error extracting decision data:', error);
      onDecisionUpdate?.(null);
    }
  };

  function handleAdminChoice(decision?: string): void {
    if (adminDecision) {
      // Second the existing decision
      setIsProcessing(true);
      secondDecision();
    } else {
      // Show  modal for initial decision
      setPendingDecision(decision as 'approve' | 'reject');
      setShowAdminSelector(true);
    }
  }

  async function secondDecision() {
    setSubmitError(null);

    try {
      if (!walletState || !adminDecision) {
        throw new Error('Wallet or admin decision not available');
      }

      const wallet = await walletState.wallet;
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      // Use partial signing (true) to combine with existing signatures
      const supportSign = await wallet.signTx(adminDecision.signedTx, true);

      if (!supportSign) {
        throw new Error(
          'Failed to sign transaction - wallet returned undefined',
        );
      }

      const updatedData: AdminDecision = {
        ...adminDecision,
        signedTx: supportSign as string,
      };

      await storageApiClient.save(
        intentUtxo!.txHash,
        updatedData,
        'submissions',
      );

      setAdminDecision(updatedData);

      // After adding the new signature, update the parent with new signature data
      await extractAndSendDecisionData(updatedData);
    } catch (error) {
      console.error('Error seconding decision:', error);
      setSubmitError({
        message: 'Failed to second the decision',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  async function initSignOff(decision: string, selectedAdmins: string[]) {
    setSubmitError(null); // Clear any previous errors

    try {
      const oracleUtxo = await findOracleUtxo();
      const counterUtxo = await getCounterUtxo();

      if (!oracleUtxo || !counterUtxo) {
        throw new Error('Failed to fetch required UTxOs');
      }

      const blockfrost = getProvider();

      const wallet = await walletState!.wallet;

      const address = await wallet!.getChangeAddress();

      // Use selected admins instead of all admins
      const adminsPkh = selectedAdmins;

      const adminAction = new AdminActionTx(
        address,
        wallet!,
        blockfrost,
        getCatConstants(),
      );

      const unsignedTx = await adminAction.approveMember(
        oracleUtxo,
        counterUtxo,
        dbUtxoToMeshUtxo(intentUtxo!),
        adminsPkh,
      );

      const firstSigTX = await wallet!.signTx(unsignedTx.txHex, true);

      if (!unsignedTx) throw new Error('Failed to create transaction');
      if (!firstSigTX)
        throw new Error(
          'Failed to sign transaction - wallet returned undefined',
        );

      const { txHex, ...signedTx } = unsignedTx;

      const data: AdminDecision = {
        context,
        decision,
        signedTx: firstSigTX,
        ...signedTx,
      };

      await storageApiClient.save(intentUtxo!.txHash, data, 'submissions');

      setAdminDecision(data);

      // Extract and send decision data to parent (this also checks signature status)
      await extractAndSendDecisionData(data);
    } catch (error) {
      console.error('Error creating decision:', error);
      setSubmitError({
        message: 'Failed to create admin decision',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    async function loadAdminDecision() {
      try {
        // Reset signature status when loading new decision
        setCurrentWalletHasSigned(false);

        const decision = await storageApiClient.get<AdminDecision>(
          intentUtxo!.txHash,
          'submissions',
        );
        setAdminDecision(decision);

        // If we have an existing decision, extract and send data to parent
        if (decision) {
          await extractAndSendDecisionData(decision);
        }
      } catch (error) {
        console.error('Failed to load admin decision:', error);
        setAdminDecision(null);
        setCurrentWalletHasSigned(false);
        onDecisionUpdate?.(null);
      } finally {
        setIsLoadingDecision(false);
      }
    }

    if (intentUtxo?.txHash) {
      loadAdminDecision();
    } else {
      setIsLoadingDecision(false);
      setCurrentWalletHasSigned(false);
    }
  }, [intentUtxo?.txHash]);

  // Handle admin selector modal
  const handleAdminSelectionConfirm = async (selectedAdmins: string[]) => {
    if (!pendingDecision) return;

    setShowAdminSelector(false);
    setIsProcessing(true);

    try {
      await initSignOff(pendingDecision, selectedAdmins);
    } finally {
      setPendingDecision(null);
    }
  };

  const handleAdminSelectionCancel = () => {
    setShowAdminSelector(false);
    setPendingDecision(null);
  };

  // Show loading state while fetching decision
  if (isLoadingDecision) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="flex justify-between">
            <div className="h-12 w-30 animate-pulse rounded-lg bg-gray-200 lg:w-60"></div>
            <div className="h-12 w-30 animate-pulse rounded-lg bg-gray-200 lg:w-60"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show existing admin decision
  if (adminDecision) {
    return (
      <div className="space-y-6">
        {/* Error Accordion */}
        <ErrorAccordion
          isVisible={!!submitError}
          message={submitError?.message}
          details={submitError?.details}
          onDismiss={() => setSubmitError(null)}
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
                adminDecision.decision === 'approve'
                  ? 'border-green-500 bg-green-50 text-green-500'
                  : 'border-primary-base text-primary-base bg-red-50'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  adminDecision.decision === 'approve'
                    ? 'bg-green-500'
                    : 'bg-primary-base'
                }`}
              ></span>
              {adminDecision.decision === 'approve' ? 'Approved' : 'Rejected'}
            </div>
          </div>
        </div>

        {/* Only show Second button if current wallet hasn't signed yet */}
        {!currentWalletHasSigned && (
          <div className="flex justify-center">
            <Button
              variant={
                adminDecision.decision === 'approve' ? 'primary' : 'outline'
              }
              onClick={() => handleAdminChoice()}
              disabled={isProcessing}
              className={` ${
                adminDecision.decision === 'approve' ? '' : 'text-primary-600!'
              }`}
            >
              {isProcessing
                ? 'Processing...'
                : `Second ${adminDecision.decision === 'approve' ? 'Approval' : 'Rejection'}`}
            </Button>
          </div>
        )}

        {/* Show message if current wallet has already signed */}
        {currentWalletHasSigned && (
          <div className="">
            <span className="text-sm">
              ✓ You have already signed this {adminDecision.decision}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Show initial decision buttons
  return (
    <>
      <div className="space-y-6">
        {/* Error Accordion */}
        <ErrorAccordion
          isVisible={!!submitError}
          message={submitError?.message}
          details={submitError?.details}
          onDismiss={() => setSubmitError(null)}
        />

        <div className="text-base font-medium">
          Review the membership application and make a decision:
        </div>
        <div className="flex w-full gap-4">
          <Button
            variant="outline"
            onClick={() => handleAdminChoice('reject')}
            disabled={isProcessing || !intentUtxo!.txHash}
            className="text-primary-base! flex-1"
          >
            {isProcessing ? 'Processing...' : 'Reject Application'}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleAdminChoice('approve')}
            disabled={isProcessing || !intentUtxo!.txHash}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : 'Approve Application'}
          </Button>
        </div>
      </div>

      {/* Admin Selector Modal */}
      <AdminSelectorModal
        isVisible={showAdminSelector}
        onConfirm={handleAdminSelectionConfirm}
        onCancel={handleAdminSelectionCancel}
        decision={pendingDecision || 'approve'}
      />
    </>
  );
};

export default ApproveReject;
