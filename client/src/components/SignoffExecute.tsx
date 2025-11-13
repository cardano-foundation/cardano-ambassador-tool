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

interface SignoffExecuteProps {
  signoffApprovalUtxo?: Utxo;
  memberUtxo?: Utxo;
  onDecisionUpdate?: (data: AdminDecisionData | null) => void;
}

const SignoffExecute: React.FC<SignoffExecuteProps> = ({
  signoffApprovalUtxo,
  memberUtxo,
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

  const storageBucket = 'signoff-execute';

  const checkCurrentWalletSigned = async (decision: AdminDecision) => {
    try {
      if (!walletState || !decision.signedTx) {
        setCurrentWalletHasSigned(false);
        return;
      }
      const wallet = await walletState.wallet;
      const currentAddress = await wallet!.getChangeAddress();
      const currentPubKeyHash = deserializeAddress(currentAddress).pubKeyHash;
      const signers = extractWitnesses(decision.signedTx);
      setCurrentWalletHasSigned(signers?.includes(currentPubKeyHash) || false);
    } catch {
      setCurrentWalletHasSigned(false);
    }
  };

  const extractAndSendDecisionData = async (decision: AdminDecision) => {
    try {
      const signers = extractWitnesses(decision.signedTx);
      const selectedAdmins = extractRequiredSigners(decision.signedTx);
      const adminData = await findAdminsFromOracle();
      if (!adminData) return;
      const data: AdminDecisionData = {
        ...decision,
        signers: signers || [],
        selectedAdmins: selectedAdmins || [],
        minRequiredSigners: Number(adminData.minsigners),
        totalSigners: (signers || []).length,
      };
      onDecisionUpdate?.(data);
      await checkCurrentWalletSigned(decision);
    } catch {
      onDecisionUpdate?.(null);
    }
  };

  function handleStart() {
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
      if (!walletState || !adminDecision)
        throw new Error('Wallet or admin decision not available');
      const wallet = await walletState.wallet;
      if (!wallet) throw new Error('Wallet not connected');
      const supportSign = await wallet.signTx(adminDecision.signedTx, true);
      if (!supportSign)
        throw new Error(
          'Failed to sign transaction - wallet returned undefined',
        );
      const updated: AdminDecision = {
        ...adminDecision,
        signedTx: supportSign as string,
      };
      await storageApiClient.save(
        signoffApprovalUtxo!.txHash,
        updated,
        storageBucket,
      );
      setAdminDecision(updated);
      await extractAndSendDecisionData(updated);
    } catch (error) {
      setSubmitError({
        message: 'Failed to add your signature',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  async function initExecution(selectedAdmins: string[]) {
    setSubmitError(null);
    try {
      if (!signoffApprovalUtxo || !memberUtxo)
        throw new Error('Missing signoff approval or member UTxO');
      const oracleUtxo = await findOracleUtxo();
      if (!oracleUtxo) throw new Error('Failed to fetch Oracle UTxO');
      const blockfrost = getProvider();
      const wallet = await walletState!.wallet;
      const address = await wallet!.getChangeAddress();

      const adminAction = new AdminActionTx(
        address,
        wallet!,
        blockfrost,
        getCatConstants(),
      );
      const unsignedTx = await adminAction.SignOff(
        oracleUtxo,
        dbUtxoToMeshUtxo(signoffApprovalUtxo),
        dbUtxoToMeshUtxo(memberUtxo),
      );

      const firstSig = await wallet!.signTx(unsignedTx.txHex, true);
      if (!unsignedTx) throw new Error('Failed to create transaction');
      if (!firstSig)
        throw new Error(
          'Failed to sign transaction - wallet returned undefined',
        );
      const { txHex, ...rest } = unsignedTx;
      const data: AdminDecision = {
        context: 'SignoffExecute',
        decision: 'approve',
        signedTx: firstSig,
        ...rest,
      };
      await storageApiClient.save(
        signoffApprovalUtxo.txHash,
        data,
        storageBucket,
      );
      setAdminDecision(data);
      await extractAndSendDecisionData(data);
    } catch (error) {
      setSubmitError({
        message: 'Failed to create signoff execution transaction',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        setCurrentWalletHasSigned(false);
        if (!signoffApprovalUtxo?.txHash) return setIsLoadingDecision(false);
        const decision = await storageApiClient.get<AdminDecision>(
          signoffApprovalUtxo.txHash,
          storageBucket,
        );
        setAdminDecision(decision);
        if (decision) await extractAndSendDecisionData(decision);
      } catch (e) {
        setAdminDecision(null);
        setCurrentWalletHasSigned(false);
        onDecisionUpdate?.(null);
      } finally {
        setIsLoadingDecision(false);
      }
    }
    load();
  }, [signoffApprovalUtxo?.txHash]);

  const handleAdminSelectionConfirm = async (selectedAdmins: string[]) => {
    setShowAdminSelector(false);
    setIsProcessing(true);
    try {
      await initExecution(selectedAdmins);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleAdminSelectionCancel = () => setShowAdminSelector(false);

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
        {!currentWalletHasSigned && (
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={() => handleStart()}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Add Your Signature'}
            </Button>
          </div>
        )}
        {currentWalletHasSigned && (
          <div className="">
            <span className="text-sm">
              ✓ You have already signed this execution
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
          Start final signoff (treasury withdrawal) multisig:
        </div>
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={handleStart}
            disabled={isProcessing || !signoffApprovalUtxo?.txHash}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Start Signoff Execution'}
          </Button>
        </div>
      </div>
      <AdminSelectorModal
        isVisible={showAdminSelector}
        onConfirm={handleAdminSelectionConfirm}
        onCancel={handleAdminSelectionCancel}
        decision={'approve'}
      />
    </>
  );
};

export default SignoffExecute;
