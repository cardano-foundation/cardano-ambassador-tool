'use client';

import Paragraph from '@/components/atoms/Paragraph';
import Copyable from '@/components/Copyable';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { findAdminsFromOracle } from '@/lib/auth/roles';
import { Hourglass } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProgressTrackerLoading from './ProgressTrackerLoading';

interface SignerStatus {
  address: string;
  signed: boolean;
}

interface ProgressTrackerClientProps {
  txhash?: string;
}

export default function MultisigProgressTracker({
  txhash,
}: ProgressTrackerClientProps) {
  const [signers, setSigners] = useState<SignerStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSigners = async () => {
      try {
        const adminData = await findAdminsFromOracle();

        const signersWithStatus: SignerStatus[] = adminData!.adminPubKeyHashes!.map(
          (pubKey) => {
            return {
              address: pubKey,
              signed: false,
            };
          },
        );

        console.log({ adminData });
        

        setSigners(signersWithStatus);
      } catch (error) {
        console.error('Failed to load signers:', error);
        setSigners([]);
      } finally {
        setLoading(false);
      }
    };

    loadSigners();
  }, [txhash]);

  if (loading) {
    return <ProgressTrackerLoading />;
  }
  const signedCount = signers.filter((signer) => signer.signed).length;
  const totalSigners = signers.length;
  const progressPercentage =
    totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Signers List */}
      <div className="space-y-1">
        {signers.map((signer) => (
          <div
            key={signer.address}
            className="flex w-full justify-between py-2"
          >
            <Copyable
              withKey={false}
              link={`${getCurrentNetworkConfig().explorerUrl}/address/${signer.address}`}
              value={signer.address}
              keyLabel={''}
            />
            <div className="flex items-center gap-2">
              <Hourglass
                color="oklch(83.7% 0.128 66.29)"
                className={`h-4 w-4 ${signer.signed ? 'text-green-500' : 'text-orange-300'}`}
              />
              <span className="text-sm">
                {signer.signed ? 'Signed' : 'Pending Signature'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Tracker */}
      <div className="max-w-lg space-y-4">
        <Paragraph size="base" className="">
          Progress Tracker
        </Paragraph>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="relative h-2 w-full rounded-full bg-gray-200">
            <div
              className="relative h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Red dot at the start */}
              <div className="absolute top-1/2 left-0 -ml-1.5 h-3 w-3 -translate-y-1/2 transform rounded-full bg-red-500"></div>
            </div>
          </div>

          {/* Progress Text */}
          <Paragraph size="sm" className="">
            {signedCount} of {totalSigners} signatures signed
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
