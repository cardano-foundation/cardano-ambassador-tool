'use client';

import Button from '@/components/atoms/Button';
import KeyValue from '@/components/atoms/KeyValue';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { shortenString } from '@/utils';
import { hexToString } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import { MemberTokenDetail } from '@types';
import { Copy, ExternalLink } from 'lucide-react';

const SelectToken = ({
  setAsset,
  goNext,
  goBack,
  walletAssets,
  setSelectedAssetName,
  selectedAssetName,
}: {
  setAsset: (asset: MemberTokenDetail | undefined) => void;
  goBack?: () => void;
  goNext?: () => void;
  walletAssets: MemberTokenDetail[];
  setSelectedAssetName: (name: string | null) => void;
  selectedAssetName: string | null;
}) => {
  const { address } = useWallet();

  return (
    <>
      <div className="mb-8 flex flex-col items-center">
        <Title level="5">Wallet Connected ✅</Title>
        <div className="flex gap-2">
          <span className="base font-semibold">Address: </span>
          <span className="base">{shortenString(address)}</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Paragraph size="base" className="text-center">
          Select the ambassador token below:
        </Paragraph>

        <div className="flex w-full flex-col gap-4">
          {walletAssets.map((asset) => (
            <div key={asset.assetName} className="w-full">
              <input
                type="checkbox"
                id={asset.assetName}
                className="peer hidden"
                checked={selectedAssetName === asset.assetName}
                onChange={() => {
                  selectedAssetName === asset.assetName
                    ? (setSelectedAssetName(null), setAsset(undefined))
                    : (setSelectedAssetName(asset.assetName), setAsset(asset));
                }}
              />
              <label
                htmlFor={asset.assetName}
                key={asset.assetName}
                className="group border-white-400 hover:border-primary-base/30 peer-checked:border-primary-base/30 flex w-full cursor-pointer items-start gap-4 rounded-lg border px-5 py-4 text-sm transition-all"
              >
                <div className="group-peer-checked:border-primary mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors">
                  <div className="group-peer-checked:bg-primary hidden size-2 rounded-full bg-white transition-colors group-peer-checked:block" />
                </div>

                {/* Token Info */}
                <div className="flex flex-col gap-1 pr-8">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>Policy ID: {shortenString(asset.policyId)}</span>
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
            </div>
          ))}
        </div>

        <div className="mt-6 flex w-full justify-between gap-2">
          <Button
            variant="outline"
            onClick={goBack}
            className="flex-1 rounded-lg!"
          >
            Back
          </Button>

          <Button
            disabled={!selectedAssetName}
            variant="primary"
            onClick={goNext}
            className="flex-1"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default SelectToken;
