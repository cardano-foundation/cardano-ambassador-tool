import { useApp } from '@/context';
import {
  dbUtxoToMeshUtxo,
  emitGlobalRefreshWithDelay,
  findOracleUtxo,
  getCatConstants,
  getProvider,
  parseProposalDatum,
} from '@/utils';
import { AdminActionTx } from '@sidan-lab/cardano-ambassador-tool';
import { TransactionConfirmationResult, Utxo } from '@types';
import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import ErrorAccordion from './ErrorAccordion';
import TransactionConfirmationOverlay from './TransactionConfirmationOverlay';

interface ExecuteSignoffProps {
  signoffApprovalUtxo?: Utxo;
  memberUtxo?: Utxo;
}

const ExecuteSignoff: React.FC<ExecuteSignoffProps> = ({
  signoffApprovalUtxo,
  memberUtxo,
}) => {
  const { wallet: walletState, treasuryBalance, isTreasuryLoading } = useApp();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message: string;
    details?: string;
  } | null>(null);
  const [showConfirmationOverlay, setShowConfirmationOverlay] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);

  // Get proposal amount from signoff approval UTxO
  const proposalAmount = signoffApprovalUtxo?.plutusData ? (() => {
    try {
      const { metadata } = parseProposalDatum(signoffApprovalUtxo.plutusData)!;
      const adaAmount = parseFloat(metadata?.fundsRequested || '0');
      return BigInt(Math.round(adaAmount * 1_000_000));
    } catch {
      return BigInt(0);
    }
  })() : BigInt(0);

  const hasInsufficientBalance = !isTreasuryLoading && treasuryBalance < proposalAmount;

  const handleExecuteSignoff = async () => {
    if (!signoffApprovalUtxo || !memberUtxo) {
      setSubmitError({
        message: 'Missing required data',
        details: 'SignoffApproval UTxO or Member UTxO not found',
      });
      return;
    }

    if (hasInsufficientBalance) {
      const treasuryAda = Number(treasuryBalance) / 1_000_000;
      const proposalAda = Number(proposalAmount) / 1_000_000;
      setSubmitError({
        message: 'Insufficient treasury balance',
        details: `Treasury balance (₳${Math.floor(treasuryAda).toLocaleString()}) is insufficient for this withdrawal (₳${Math.floor(proposalAda).toLocaleString()})`,
      });
      return;
    }

    setIsExecuting(true);
    setSubmitError(null);

    try {
      const oracleUtxo = await findOracleUtxo();
      
      if (!oracleUtxo) {
        throw new Error('Failed to fetch Oracle UTxO');
      }

      const blockfrost = getProvider();
      const wallet = await walletState!.wallet;
      const address = await wallet!.getChangeAddress();

      const adminAction = new AdminActionTx(
        address,
        wallet!,
        blockfrost,
        getCatConstants(),
      );

      const signoffApprovalMesh = dbUtxoToMeshUtxo(signoffApprovalUtxo);
      const memberMesh = dbUtxoToMeshUtxo(memberUtxo);
      console.log({
        signoffApprovalMesh,
        memberMesh,
        oracleUtxo,
      });

      const unsignedTx = await adminAction.SignOff(
        oracleUtxo,
        signoffApprovalMesh,
        memberMesh,
      );

      if (!unsignedTx) {
        throw new Error('Failed to create SignOff transaction');
      }

      const signedTx = await wallet!.signTx(unsignedTx.txHex);

      if (!signedTx) {
        throw new Error('Failed to sign transaction');
      }

      const txHash = await wallet!.submitTx(signedTx);
      setConfirmedTxHash(txHash);
      setShowConfirmationOverlay(true);
    } catch (error) {
      console.error('Failed to execute signoff:', error);
      setSubmitError({
        message: 'Failed to execute signoff',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTransactionConfirmed = useCallback(
    async (result: TransactionConfirmationResult) => {
      setIsExecuted(true);

      setTimeout(() => {
        const event = new CustomEvent('app:refresh', {
          detail: { refreshTreasury: true }
        });
        window.dispatchEvent(event);
      }, 2000);
      emitGlobalRefreshWithDelay(2000);
    },
    [],
  );

  const handleTransactionTimeout = (result: TransactionConfirmationResult) => {};

  const handleCloseConfirmationOverlay = useCallback(() => {
    setShowConfirmationOverlay(false);
    setConfirmedTxHash(null);
  }, []);

  if (!signoffApprovalUtxo) {
    return (
      <div className="space-y-4">
        <Paragraph size="sm" className="text-center text-gray-500">
          Waiting for signoff approval to be executed first.
        </Paragraph>
      </div>
    );
  }

  if (!memberUtxo) {
    return (
      <div className="space-y-4">
        <ErrorAccordion
          isVisible={true}
          message="Member UTxO not found"
          details="Unable to find the required member UTxO for signoff execution"
          onDismiss={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ErrorAccordion
        isVisible={!!submitError}
        message={submitError?.message}
        details={submitError?.details}
        onDismiss={() => setSubmitError(null)}
      />

      <div className="text-base font-medium">
        Execute final signoff to transfer funds from treasury:
      </div>

      <Button
        variant="primary"
        onClick={handleExecuteSignoff}
        disabled={isExecuting || isExecuted || hasInsufficientBalance || isTreasuryLoading}
        className="w-full"
      >
        {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isTreasuryLoading ? 'Loading treasury data...' :
         hasInsufficientBalance ? 'Insufficient Treasury Balance' :
         isExecuted ? '✓ Signoff Executed' : 'Execute Final Signoff'}
      </Button>

      {hasInsufficientBalance && (
        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
          Treasury balance (₳{Math.floor(Number(treasuryBalance) / 1_000_000).toLocaleString()}) is insufficient for this withdrawal (₳{Math.floor(Number(proposalAmount) / 1_000_000).toLocaleString()})
        </div>
      )}

      {isExecuted && (
        <Paragraph size="sm" className="text-center text-green-600">
          ✓ Treasury withdrawal completed successfully!
        </Paragraph>
      )}

      <TransactionConfirmationOverlay
        isVisible={showConfirmationOverlay}
        txHash={confirmedTxHash || undefined}
        title="Executing Final Signoff"
        description={
          isExecuted
            ? 'Final signoff has been successfully executed and funds have been transferred! 🎉'
            : 'Please wait while your final signoff is being confirmed on the blockchain.'
        }
        onClose={handleCloseConfirmationOverlay}
        onConfirmed={handleTransactionConfirmed}
        onTimeout={handleTransactionTimeout}
        showNavigationOptions={isExecuted}
        navigationOptions={[
          { label: 'View Treasury', url: '/manage/treasury-signoffs', variant: 'primary' },
          { label: 'View All Proposals', url: '/proposals', variant: 'outline' }
        ]}
      />
    </div>
  );
};

export default ExecuteSignoff;