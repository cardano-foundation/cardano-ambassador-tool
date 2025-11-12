'use client';

import Button from '@/components/atoms/Button';
import KeyValue from '@/components/atoms/KeyValue';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import { useApp } from '@/context/AppContext';
import { shortenString } from '@/utils';
import { hexToString } from '@meshsdk/core';
import { MemberTokenDetail } from '@types';

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
  const { wallet } = useApp();
  const { address } = wallet;

  return (
    <>
      <div className="mb-8 flex h-full w-full flex-col items-center">
        <Title level="5">Wallet Connected ✅</Title>
        <div className="flex gap-2">
          <span className="base font-semibold">Address: </span>
          <span className="base">{shortenString(address!)}</span>
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
                  if (selectedAssetName === asset.assetName) {
                    setSelectedAssetName(null);
                    setAsset(undefined);
                  } else {
                    setSelectedAssetName(asset.assetName);
                    setAsset(asset);
                  }
                }}
              />
              <label
                htmlFor={asset.assetName}
                key={asset.assetName}
                className="group border-white-400 hover:border-primary-base/30 peer-checked:border-primary-base/30 flex w-full cursor-pointer items-start gap-4 rounded-lg border px-2 lg:px-5 py-2 lg:py-4 text-sm transition-all"
              >
                <div className="group-peer-checked:border-primary mt-1.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors">
                  <div className="group-peer-checked:bg-primary hidden size-2 rounded-full bg-white transition-colors group-peer-checked:block" />
                </div>

                {/* Token Info */}
                <div className="flex flex-col gap-1 pr-8">
                  <Copyable keyLabel="Policy ID" value={asset.policyId} />
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
            className="text-primary-base! rounded-lg!"
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
