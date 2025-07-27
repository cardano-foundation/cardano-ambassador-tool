'use client';

import KeyValue from '@/components/atoms/KeyValue';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { hexToString, Quantity, Unit } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { Copy, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

export type AssetsDetail = {
  txHash: string | null;
  outputIndex: number | null;
  unit: Unit;
  policyId: string;
  assetName: string;
  fingerprint: string;
  quantity: Quantity;
};

const SelectToken = ({
  setAsset,
}: {
  setAsset: (asset: AssetsDetail | null) => void;
}) => {
  const { address, wallet } = useWallet();
  const policyId = process.env.NEXT_PUBLIC_AMBASSADOR_POLICY_ID ?? '';

  const [walletAssets, setWalletAssets] = useState<AssetsDetail[]>([]);
  const [selectedAssetName, setSelectedAssetName] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchAssets = async () => {
      if (wallet) {
        const assets = await getAssetsDetails();
        setWalletAssets(assets);
      }
    };

    fetchAssets();
  }, [wallet]);

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
  };

  async function getAssetsDetails() {
    const utxos = await wallet.getUtxos();
    const assets = await wallet.getPolicyIdAssets(policyId);

    // Flatten UTXOs and filter for assets that match policyId
    const utxoAssets = utxos.flatMap((utxo) =>
      utxo.output.amount
        .filter((amt) => amt.unit.startsWith(policyId))
        .map((amt) => ({
          unit: amt.unit,
          quantity: amt.quantity,
          txHash: utxo.input.txHash,
          outputIndex: utxo.input.outputIndex,
        })),
    );

    // Enrich the wallet assets with matching UTXO info
    const enrichedAssets = assets.map((asset) => {
      const matchingUtxo = utxoAssets.find(
        (utxoAsset) => utxoAsset.unit === asset.unit,
      );
      return {
        ...asset,
        txHash: matchingUtxo?.txHash || null,
        outputIndex: matchingUtxo?.outputIndex ?? null,
      };
    });

    return enrichedAssets;
  }

  return (
    <>
      <div className="mb-8 flex flex-col items-center">
        <Title level="5">Wallet Connected ✅</Title>
        <div className="flex gap-2">
          <span className="text-sm font-semibold">Address: </span>
          <span className="text-sm">{formatAddress(address)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Paragraph size="sm" className="text-center">
          Select the ambassador token below:
        </Paragraph>

        <div className="flex flex-col gap-4">
          {walletAssets.map((asset) => (
            <>
              <input
                type="checkbox"
                id={asset.assetName}
                className="peer hidden" // The actual checkbox is the 'peer'
                checked={selectedAssetName === asset.assetName}
                onChange={() => {
                  selectedAssetName === asset.assetName
                    ? (setSelectedAssetName(null), setAsset(null))
                    : (setSelectedAssetName(asset.assetName), setAsset(asset));
                }}
              />
              <label
                htmlFor={asset.assetName}
                key={asset.assetName}
                // The label is the 'group' and also directly reacts to the 'peer' input
                className="group border-muted-foreground hover:border-primary/40 peer-checked:border-primary bg-muted hover:bg-muted/50 flex cursor-pointer items-start gap-4 rounded-lg border px-5 py-4 text-sm shadow-lg transition-all"
              >
                {/* Custom radio-like mimic for checkbox */}
                {/* These divs are children of the 'group' label and react to the 'peer' input's state */}
                <div className="group-peer-checked:border-primary mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors">
                  <div className="group-peer-checked:bg-primary size-2 rounded-full bg-white transition-colors" />
                </div>

                {/* Token Info */}
                <div className="flex flex-col gap-1 pr-8">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>Policy ID: {formatAddress(asset.policyId)}</span>
                    <Copy className="text-muted-foreground size-4" />
                    <ExternalLink className="text-muted-foreground size-4" />
                  </div>
                  <KeyValue
                    keyLabel={'Token Name'}
                    value={hexToString(asset.assetName)}
                  />
                  <KeyValue keyLabel={'Hex Name'} value={asset.assetName} />
                </div>
              </label>
            </>
          ))}
        </div>
      </div>
    </>
  );
};

export default SelectToken;
