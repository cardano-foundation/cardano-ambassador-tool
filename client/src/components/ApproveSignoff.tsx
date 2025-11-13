import { useApp } from '@/context';
import { findAdminsFromOracle } from '@/lib/auth/roles';
import {
  dbUtxoToMeshUtxo,
  extractRequiredSigners,
  extractWitnesses,
  findOracleUtxo,
  getCatConstants,
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

interface ApproveSignoffProps {
  proposalUtxo?: Utxo;
  onDecisionUpdate?: (data: AdminDecisionData | null) => void;
}

const ApproveSignoff: React.FC<ApproveSignoffProps> = ({
  proposalUtxo,
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
  const { wallet: walletState } = useApp();

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

  function handleApproveSignoff(): void {
    if (adminDecision) {
      setIsProcessing(true);
      secondDecision();
    } else {
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
        proposalUtxo!.txHash,
        updatedData,
        'signoff-submissions',
      );

      setAdminDecision(updatedData);
      await extractAndSendDecisionData(updatedData);
    } catch (error) {
      console.error('Error seconding decision:', error);
      setSubmitError({
        message: 'Failed to second the signoff approval',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  async function initSignOff(selectedAdmins: string[]) {
    setSubmitError(null);

    try {
      const oracleUtxo = await findOracleUtxo();

      if (!oracleUtxo) {
        throw new Error('Failed to fetch Oracle UTxO');
      }

      const blockfrost = getProvider();
      const wallet = await walletState!.wallet;
      const address = await wallet!.getChangeAddress();
      const adminsPkh = selectedAdmins.map(
        (add: string) => deserializeAddress(add).pubKeyHash,
      );

      const adminAction = new AdminActionTx(
        address,
        wallet!,
        blockfrost,
        getCatConstants(),
      );

      const unsignedTx = await adminAction.approveSignOff(
        oracleUtxo,
        dbUtxoToMeshUtxo(proposalUtxo!),
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
        context: 'SignoffApproval',
        decision: 'approve',
        signedTx: firstSigTX,
        ...signedTx,
      };

      await storageApiClient.save(
        proposalUtxo!.txHash,
        data,
        'signoff-submissions',
      );
      setAdminDecision(data);
      await extractAndSendDecisionData(data);
    } catch (error) {
      console.error('Error creating signoff approval:', error);
      setSubmitError({
        message: 'Failed to create signoff approval',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    async function loadAdminDecision() {
      try {
        setCurrentWalletHasSigned(false);

        const decision = await storageApiClient.get<AdminDecision>(
          proposalUtxo!.txHash,
          'signoff-submissions',
        );
        setAdminDecision(decision);

        if (decision) {
          await extractAndSendDecisionData(decision);
        }
      } catch (error) {
        console.error('Failed to load signoff decision:', error);
        setAdminDecision(null);
        setCurrentWalletHasSigned(false);
        onDecisionUpdate?.(null);
      } finally {
        setIsLoadingDecision(false);
      }
    }

    if (proposalUtxo?.txHash) {
      loadAdminDecision();
    } else {
      setIsLoadingDecision(false);
      setCurrentWalletHasSigned(false);
    }
  }, [proposalUtxo?.txHash]);

  const handleAdminSelectionConfirm = async (selectedAdmins: string[]) => {
    setShowAdminSelector(false);
    setIsProcessing(true);

    try {
      await initSignOff(selectedAdmins);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdminSelectionCancel = () => {
    setShowAdminSelector(false);
  };

  if (isLoadingDecision) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="flex justify-center">
            <div className="h-12 w-60 animate-pulse rounded-lg bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (adminDecision) {
    return (
      <div className="space-y-6">
        <ErrorAccordion
          isVisible={!!submitError}
          message={submitError?.message}
          details={submitError?.details}
          onDismiss={() => setSubmitError(null)}
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-500">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Signoff Approval
            </div>
          </div>
        </div>

        {!currentWalletHasSigned && (
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={() => handleApproveSignoff()}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Second Signoff Approval'}
            </Button>
          </div>
        )}

        {currentWalletHasSigned && (
          <div className="">
            <span className="text-sm">
              ✓ You have already signed this signoff approval
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <ErrorAccordion
          isVisible={!!submitError}
          message={submitError?.message}
          details={submitError?.details}
          onDismiss={() => setSubmitError(null)}
        />

        <div className="text-base font-medium">
          Approve signoff for this proposal to enable treasury withdrawal:
        </div>
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={handleApproveSignoff}
            disabled={isProcessing || !proposalUtxo!.txHash}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Approve Signoff'}
          </Button>
        </div>
      </div>

      <AdminSelectorModal
        isVisible={showAdminSelector}
        onConfirm={handleAdminSelectionConfirm}
        onCancel={handleAdminSelectionCancel}
        decision="approve"
      />
    </>
  );
};

export default ApproveSignoff;
