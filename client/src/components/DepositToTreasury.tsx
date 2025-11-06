import { useApp } from '@/context';
import { getCatConstants, getProvider } from '@/utils';
import { Transaction } from '@meshsdk/core';
import { useState } from 'react';
import Button from './atoms/Button';
import Paragraph from './atoms/Paragraph';
import ErrorAccordion from './ErrorAccordion';

const DepositToTreasury: React.FC = () => {
  const { wallet: walletState } = useApp();
  const [amount, setAmount] = useState('1000000'); // Default 1 ADA in lovelace
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState<{ message: string; details?: string } | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDeposit = async () => {
    if (!walletState?.wallet) {
      setDepositError({ message: 'Wallet not connected' });
      return;
    }

    setIsDepositing(true);
    setDepositError(null);
    setSuccess(false);

    try {
      const wallet = await walletState.wallet;
      const address = await wallet.getChangeAddress();
      const treasuryAddress = getCatConstants().scripts.treasury.spend.address;
      
      // Create a simple datum (empty constr 0 is fine since treasury spend ignores datum content)
      const datum = { alternative: 0, fields: [] };

      const tx = new Transaction({ initiator: wallet });
      
      tx.sendLovelace(
        {
          address: treasuryAddress,
          datum: {
            value: datum,
            inline: true, // This is the key - must be inline!
          },
        },
        amount
      );

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      console.log('✅ Treasury deposit successful! TxHash:', txHash);
      setSuccess(true);
    } catch (error) {
      console.error('Failed to deposit to treasury:', error);
      setDepositError({
        message: 'Failed to deposit to treasury',
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Paragraph size="lg" className="font-semibold">
        Deposit to Treasury (With Inline Datum)
      </Paragraph>
      
      <ErrorAccordion
        isVisible={!!depositError}
        message={depositError?.message}
        details={depositError?.details}
        onDismiss={() => setDepositError(null)}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Amount (lovelace)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter amount in lovelace"
        />
        <Paragraph size="xs" className="text-gray-500">
          1 ADA = 1,000,000 lovelace
        </Paragraph>
      </div>

      <Button
        variant="primary"
        onClick={handleDeposit}
        disabled={isDepositing || !amount || parseInt(amount) <= 0}
        className="w-full"
      >
        {isDepositing ? 'Depositing...' : 'Deposit to Treasury'}
      </Button>

      {success && (
        <Paragraph size="sm" className="text-center text-green-600">
          ✓ Successfully deposited to treasury with inline datum!
        </Paragraph>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <Paragraph size="xs" className="text-yellow-800">
          <strong>Important:</strong> Treasury UTxOs must have inline datums. Regular wallet transfers without datums cannot be spent by the treasury script.
        </Paragraph>
      </div>
    </div>
  );
};

export default DepositToTreasury;
