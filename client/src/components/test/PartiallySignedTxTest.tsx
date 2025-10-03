'use client';

import { useWalletManager } from '@/hooks/useWalletManager';
import { findAdminsFromOracle } from '@/lib/auth/roles';
import { getProvider } from '@/utils/utils';
import { MeshTxBuilder } from '@meshsdk/core';
import { deserializeTx } from '@meshsdk/core-csl';
import { useState } from 'react';

export default function PartiallySignedTxTest() {
  const wallet = useWalletManager();
  const [unsignedTx, setUnsignedTx] = useState<string>('');
  const [partiallySignedTx, setPartiallySignedTx] = useState<string>('');
  const [witnesses, setWitnesses] = useState<string[]>([]);
  const [adminHashes, setAdminHashes] = useState<string[]>([]);

  // Step 1: Create an unsigned transaction
  const createUnsignedTx = async () => {
    if (!wallet.wallet || !wallet.address) {
      alert('Please connect your wallet first');
      return;
    }

    // try {
    const utxos = await wallet.wallet.getUtxos();
    if (utxos.length === 0) {
      alert('No UTxOs available');
      return;
    }

    // Use your Blockfrost API endpoint as provider
    const provider = getProvider('preprod'); // or 'mainnet' based on your config

    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      evaluator: provider,
    });

        
    // Use the UTXO's output address as the recipient (send back to same address)
    const recipientAddress =
      'addr_test1qpxqcrqd4pkjarqcpwm7pzp7w0py9lcnl5kv8zlwfnrwx7t4yqekvjk7w4996sqn5h4ua06m6rzqnx7u9ge3aupv863symwtvz';
    
    const unsignedTxHex = await txBuilder
      .selectUtxosFrom(utxos)
      .changeAddress(wallet.address)
      .txOut(recipientAddress, [{ unit: 'lovelace', quantity: '1000000' }])
      .complete();

    setUnsignedTx(unsignedTxHex);
        // } catch (error) {
    //   console.error('❌ Error creating unsigned transaction:', error);
    // }
  };

  // Step 2: Sign the transaction (partially)
  const signTransaction = async () => {
    if (!wallet.wallet || !unsignedTx) {
      alert('Need wallet and unsigned transaction first');
      return;
    }

    try {
      const signedTxHex = await wallet.wallet.signTx(unsignedTx, true);
      setPartiallySignedTx(signedTxHex);
      
      // Now extract witnesses
      extractWitnesses(signedTxHex);
    } catch (error) {
      console.error('❌ Error signing transaction:', error);
    }
  };

  // Step 3: Extract witnesses from signed transaction
  const extractWitnesses = async (txHex: string) => {
    try {
      
      const tx = deserializeTx(txHex);
      const witnessSet = tx.witness_set();
      const vkeyWitnesses = witnessSet.vkeys();

      if (vkeyWitnesses) {
        const witnessKeys: string[] = [];

        for (let i = 0; i < vkeyWitnesses.len(); i++) {
          const witness = vkeyWitnesses.get(i);
          const vkey = witness.vkey();
          const pubKeyHash = vkey.public_key().hash().to_hex();
          witnessKeys.push(pubKeyHash);
                  }

        setWitnesses(witnessKeys);

        // Also get oracle admins for comparison
        const oracleAdmins = await findAdminsFromOracle();
        if (oracleAdmins) {
          setAdminHashes(oracleAdmins);
          
          // Show comparison
          oracleAdmins.forEach((adminHash) => {
            const hasSigned = witnessKeys.includes(adminHash);
                      });
        }
      }
    } catch (error) {
      console.error('❌ Error extracting witnesses:', error);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <h3 className="text-lg font-semibold">
        Partially Signed Transaction Test
      </h3>

      {/* Wallet Status */}
      <div className="rounded bg-gray-50 p-4">
        <p>
          <strong>Wallet:</strong>{' '}
          {wallet.isConnected ? `✅ ${wallet.walletName}` : '❌ Not connected'}
        </p>
        <p>
          <strong>Address:</strong> {wallet.address || 'None'}
        </p>
      </div>

      {/* Step 1: Create Unsigned Transaction */}
      <div className="space-y-2">
        <button
          onClick={createUnsignedTx}
          disabled={!wallet.isConnected}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          1. Create Unsigned Transaction
        </button>
        {unsignedTx && (
          <div className="rounded bg-yellow-50 p-2 text-xs">
            <p>
              <strong>Unsigned TX:</strong>
            </p>
            <p className="break-all">{unsignedTx.substring(0, 100)}...</p>
          </div>
        )}
      </div>

      {/* Step 2: Sign Transaction */}
      <div className="space-y-2">
        <button
          onClick={signTransaction}
          disabled={!unsignedTx}
          className="rounded bg-green-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          2. Sign Transaction (Partial)
        </button>
        {partiallySignedTx && (
          <div className="rounded bg-green-50 p-2 text-xs">
            <p>
              <strong>Partially Signed TX:</strong>
            </p>
            <p className="break-all">
              {partiallySignedTx.substring(0, 100)}...
            </p>
          </div>
        )}
      </div>

      {/* Step 3: Show Results */}
      {witnesses.length > 0 && (
        <div className="space-y-2 rounded bg-gray-50 p-4">
          <h4 className="font-semibold">🎉 Extracted Witnesses:</h4>
          {witnesses.map((witness, i) => (
            <p key={i} className="font-mono text-xs">
              👤 Witness {i + 1}: {witness}
            </p>
          ))}

          {adminHashes.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">🔍 Signature Status:</h4>
              {adminHashes.map((adminHash, i) => {
                const hasSigned = witnesses.includes(adminHash);
                return (
                  <p
                    key={i}
                    className={`text-xs ${hasSigned ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {hasSigned ? '✅' : '❌'} Admin {i + 1}:{' '}
                    {adminHash.substring(0, 16)}... -{' '}
                    {hasSigned ? 'SIGNED' : 'PENDING'}
                  </p>
                );
              })}
              <p className="mt-2 font-semibold">
                📊 Progress:{' '}
                {witnesses.filter((w) => adminHashes.includes(w)).length} of{' '}
                {adminHashes.length} signatures
              </p>
            </div>
          )}
        </div>
      )}

      {/* Copy TX Hex for Testing */}
      {partiallySignedTx && (
        <div className="space-y-2">
          <button
            onClick={() => navigator.clipboard.writeText(partiallySignedTx)}
            className="rounded bg-purple-500 px-4 py-2 text-sm text-white"
          >
            📋 Copy TX Hex for Progress Tracker
          </button>
          <p className="text-xs text-gray-600">
            Use this hex in your MultisigProgressTracker component to test
            signature extraction!
          </p>
        </div>
      )}
    </div>
  );
}
