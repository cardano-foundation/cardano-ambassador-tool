import { getCatConstants } from '@/utils';
import {
  BlockfrostProvider,
  deserializeAddress,
  MeshWallet,
} from '@meshsdk/core';
import { AdminActionTx } from '@sidan-lab/cardano-ambassador-tool';
import { NextApiRequest, NextApiResponse } from 'next';

// Environment variables (server-side only)
const ADMIN_MNEMONIC_1 = process.env.ADMIN_MNEMONIC_1 || '';
const ADMIN_MNEMONIC_2 = process.env.ADMIN_MNEMONIC_2 || '';
const ADMIN_MNEMONIC_3 = process.env.ADMIN_MNEMONIC_3 || '';
const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
const ORACLE_OUTPUT_INDEX = parseInt(
  process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || '0',
);

const blockfrost = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY_PREPROD || '',
);

// Helper functions
const getWallet = (mnemonic: string): MeshWallet => {
  return new MeshWallet({
    networkId: 0,
    fetcher: blockfrost,
    submitter: blockfrost,
    key: {
      type: 'mnemonic',
      words: mnemonic.split(','),
    },
  });
};

const getAdminWalletsAndPkh = async () => {
  const admin1 = getWallet(ADMIN_MNEMONIC_1);
  const admin2 = getWallet(ADMIN_MNEMONIC_2);
  const admin3 = getWallet(ADMIN_MNEMONIC_3);
  const addr1 = await admin1.getChangeAddress();
  const pkh1 = deserializeAddress(addr1).pubKeyHash;
  const addr2 = await admin2.getChangeAddress();
  const pkh2 = deserializeAddress(addr2).pubKeyHash;
  const addr3 = await admin3.getChangeAddress();
  const pkh3 = deserializeAddress(addr3).pubKeyHash;
  const adminsPkh = [pkh1, pkh2, pkh3];
  return { admin1, admin2, admin3, adminsPkh };
};

const getOracleUtxo = async () => {
  const oracleUtxos = await blockfrost.fetchUTxOs(
    ORACLE_TX_HASH,
    ORACLE_OUTPUT_INDEX,
  );
  return oracleUtxos[0];
};

const multiSignAndSubmit = async (
  unsignedTx: any, // Could be more specific if you have a type for unsignedTx
  admin1: MeshWallet,
  admin2: MeshWallet,
  admin3: MeshWallet,
) => {
  const admin1SignedTx = await admin1.signTx(unsignedTx.txHex, true);
  const admin12SignedTx = await admin2.signTx(admin1SignedTx, true);
  const allSignedTx = await admin3.signTx(admin12SignedTx, true);
  console.log(allSignedTx);

  // Submit transaction
  return await admin2.submitTx(allSignedTx);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, ...params } = req.body;

    switch (action) {
      case 'approveMember': {
        const { membershipIntentUtxo, counterUtxoHash, counterUtxoIndex } =
          params;
        const { admin1, admin2, admin3, adminsPkh } =
          await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        const counterUtxos = await blockfrost.fetchUTxOs(
          counterUtxoHash,
          parseInt(counterUtxoIndex),
        );
        const counterUtxo = counterUtxos[0];
        if (!oracleUtxo || !counterUtxo) {
          throw new Error('Failed to fetch required UTxOs');
        }
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants(),
        );
        const unsignedTx = await adminAction.approveMember(
          oracleUtxo,
          counterUtxo,
          membershipIntentUtxo,
          adminsPkh,
        );
        if (!unsignedTx) throw new Error('Failed to create transaction');
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3,
        );
        return res.status(200).json({ result });
      }
      case 'approveProposal': {
        const { proposeIntentUtxo } = params;
        const { admin1, admin2, admin3, adminsPkh } =
          await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error('Failed to fetch required UTxOs');
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants(),
        );
        const unsignedTx = await adminAction.approveProposal(
          oracleUtxo,
          proposeIntentUtxo,
          adminsPkh,
        );
        if (!unsignedTx) throw new Error('Failed to create transaction');
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3,
        );
        return res.status(200).json({ result });
      }
      case 'rejectProposal': {
        const { proposeIntentUtxo } = params;
        const { admin1, admin2, admin3, adminsPkh } =
          await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error('Failed to fetch required UTxOs');
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants(),
        );
        const unsignedTx = await adminAction.rejectProposal(
          oracleUtxo,
          proposeIntentUtxo,
          adminsPkh,
        );
        if (!unsignedTx) throw new Error('Failed to create transaction');
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3,
        );
        return res.status(200).json({ result });
      }
      case 'approveSignOff': {
        const { proposalUtxo } = params;
        const { admin1, admin2, admin3, adminsPkh } =
          await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error('Failed to fetch required UTxOs');
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants(),
        );
        const unsignedTx = await adminAction.approveSignOff(
          oracleUtxo,
          proposalUtxo,
          adminsPkh,
        );
        if (!unsignedTx) throw new Error('Failed to create transaction');
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3,
        );
        return res.status(200).json({ result });
      }
      case 'SignOff': {
        const { signOffApprovalUtxo, memberUtxo } = params;
        const { admin1, admin2, admin3 } = await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error('Failed to fetch required UTxOs');
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants(),
        );
        const unsignedTx = await adminAction.SignOff(
          oracleUtxo,
          signOffApprovalUtxo,
          memberUtxo,
        );
        if (!unsignedTx) throw new Error('Failed to create transaction');
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3,
        );
        return res.status(200).json({ result });
      }
      case 'removeMember': {
        const { memberUtxo } = params;
        const { admin1, admin2, admin3 } = await getAdminWalletsAndPkh();
        const oracleUtxo = await getOracleUtxo();
        if (!oracleUtxo) throw new Error('Failed to fetch required UTxOs');
        const address = await admin2.getChangeAddress();
        const adminAction = new AdminActionTx(
          address,
          admin2,
          blockfrost,
          getCatConstants(),
        );
        const unsignedTx = await adminAction.removeMember(
          oracleUtxo,
          memberUtxo,
        );
        if (!unsignedTx) throw new Error('Failed to create transaction');
        const result = await multiSignAndSubmit(
          unsignedTx,
          admin1,
          admin2,
          admin3,
        );
        return res.status(200).json({ result });
      }
      // ... other cases ...
    }
  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
