'use client';

import Paragraph from '@/components/atoms/Paragraph';
import Copyable from '@/components/Copyable';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { findAdminsFromOracle } from '@/lib/auth/roles';
import { CheckCircleIcon, Hourglass } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProgressTrackerLoading from './ProgressTrackerLoading';

interface SignerStatus {
  address: string;
  signed: boolean;
}
interface ProgressTrackerClientProps {
  txhash?: string;
  adminDecisionData: any;
}
export default function MultisigProgressTracker({
  txhash,
  adminDecisionData,
}: ProgressTrackerClientProps) {
  const [signers, setSigners] = useState<SignerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [minRequiredSigners, setMinRequiredSigners] = useState<number>(0);

  useEffect(() => {
    const loadSigners = async () => {
      try {
        const adminData = await findAdminsFromOracle();
        setMinRequiredSigners(Number(adminData!.minsigners));

        if (adminDecisionData) {
          // Use actual signers from admin decision data
          const signersWithStatus: SignerStatus[] =
            adminData!.adminPubKeyHashes!.map((pubKey) => {
              return {
                address: pubKey,
                signed: adminDecisionData.signers.includes(pubKey),
              };
            });
          setSigners(signersWithStatus);
        } else {
          // Default state - no signatures yet
          const signersWithStatus: SignerStatus[] =
            adminData!.adminPubKeyHashes!.map((pubKey) => {
              return {
                address: pubKey,
                signed: false,
              };
            });
          setSigners(signersWithStatus);
        }
      } catch (error) {
        console.error('Failed to load signers:', error);
        setSigners([]);
      } finally {
        setLoading(false);
      }
    };

    loadSigners();
  }, [txhash, adminDecisionData]);

  if (loading) {
    return <ProgressTrackerLoading />;
  }

  const signedCount = signers.filter((signer) => signer.signed).length;
  const totalSigners = signers.length;
  const progressPercentage =
    minRequiredSigners > 0 ? (signedCount / minRequiredSigners) * 100 : 0;
  const isComplete = signedCount >= minRequiredSigners;

  return (
    <div className="space-y-6">
      {/* Decision Status */}

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
              {!signer.signed ? (
                <Hourglass
                  color="oklch(83.7% 0.128 66.29)"
                  className="h-4 w-4 text-orange-300"
                />
              ) : (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              )}
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
              className={`relative h-2 rounded-full transition-all duration-500 ease-out ${
                isComplete
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : 'bg-gradient-to-r from-orange-400 to-orange-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            >
              {/* Status dot */}
              <div
                className={`absolute top-1/2 left-0 -ml-1.5 h-3 w-3 -translate-y-1/2 transform rounded-full ${
                  isComplete ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
            </div>
          </div>

          {/* Progress Text */}
          <div className="flex justify-between text-sm">
            <Paragraph size="sm" className="">
              {signedCount} of {minRequiredSigners} required signatures
            </Paragraph>
            <span
              className={`font-medium ${
                isComplete ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              {Math.min(Math.round(progressPercentage), 100)}%
            </span>
          </div>

          {totalSigners > minRequiredSigners && (
            <Paragraph size="xs" className="text-gray-500">
              ({totalSigners} total admin signers available)
            </Paragraph>
          )}
        </div>
      </div>
    </div>
  );
}
