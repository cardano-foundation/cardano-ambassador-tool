'use client';

import Paragraph from '@/components/atoms/Paragraph';
import Copyable from '@/components/Copyable';
import { findAdminsFromOracle } from '@/lib/auth/roles';
import { AdminDecisionData } from '@types';
import { CheckCircleIcon, Hourglass, XCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProgressTrackerLoading from './ProgressTrackerLoading';

interface SignerStatus {
  address: string;
  signed: boolean;
}
interface ProgressTrackerClientProps {
  txhash?: string;
  adminDecisionData?: AdminDecisionData | null;
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

        if (
          adminDecisionData &&
          adminDecisionData.selectedAdmins &&
          adminDecisionData.selectedAdmins.length > 0
        ) {
          const signersWithStatus: SignerStatus[] =
            adminDecisionData.selectedAdmins.map((pubKey: string) => {
              return {
                address: pubKey,
                signed: adminDecisionData.signers.includes(pubKey),
              };
            });
          setSigners(signersWithStatus);
        } else if (
          adminDecisionData &&
          adminDecisionData.signers &&
          adminDecisionData.signers.length > 0
        ) {
          const uniqueSigners = [...new Set([...adminDecisionData.signers])];
          const signersWithStatus: SignerStatus[] = uniqueSigners.map(
            (pubKey) => {
              return {
                address: pubKey,
                signed: true,
              };
            },
          );
          setSigners(signersWithStatus);
        } else {
          setSigners([]);
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
    totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;
  const isComplete = signedCount >= totalSigners;

  return (
    <div className="space-y-6">
      {/* Signers List */}
      <div className="space-y-1">
        {signers.length > 0 ? (
          signers.map((signer) => (
            <div
              key={signer.address}
              className="flex w-full justify-between py-2"
            >
              <Copyable withKey={false} value={signer.address} keyLabel={''} />
              <div className="flex items-center gap-2">
                {!signer.signed ? (
                  <Hourglass
                    color="oklch(83.7% 0.128 66.29)"
                    className="h-4 w-4 text-orange-300"
                  />
                ) : adminDecisionData?.decision === 'approve' ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="text-primary-base h-4 w-4" />
                )}
                <span className="text-sm">
                  {signer.signed
                    ? `${adminDecisionData?.decision === 'approve' ? 'Approval' : 'Rejection'} Signed`
                    : 'Pending Signature'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center">
            <Paragraph size="sm" className="">
              {adminDecisionData
                ? 'Loading signature information...'
                : 'No admin decision available yet.'}
            </Paragraph>
          </div>
        )}
      </div>

      {/* Progress Tracker */}
      {totalSigners > 0 && (
        <div className="max-w-lg space-y-4">
          <div className="flex items-center gap-2">
            <Paragraph size="base" className="">
              Signature Progress
            </Paragraph>
            {isComplete && (
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-600">
                  Complete
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="relative h-2 w-full rounded-full bg-gray-200">
              <div
                className={`relative h-2 rounded-full transition-all duration-500 ease-out ${
                  isComplete
                    ? 'bg-linear-to-r from-green-400 to-green-500'
                    : 'from-primary-400 to-primary-base bg-linear-to-r'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              >
                {/* Status dot */}
                <div
                  className={`absolute top-1/2 right-0 -mr-1.5 h-3 w-3 -translate-y-1/2 transform rounded-full border-2 border-white ${
                    isComplete ? 'bg-green-500' : 'bg-primary-base'
                  }`}
                ></div>
              </div>
            </div>

            {/* Progress Text */}
            <div className="flex justify-between text-sm">
              <Paragraph size="sm" className="">
                {signedCount} of {totalSigners} required signatures
              </Paragraph>
              <span
                className={`font-medium ${isComplete ? 'text-green-600' : ''}`}
              >
                {Math.min(Math.round(progressPercentage), 100)}%
              </span>
            </div>

            {/* Additional Info */}
            <div className="space-y-1">
              {totalSigners > totalSigners && (
                <Paragraph size="xs" className="">
                  ({totalSigners} total admin signers available)
                </Paragraph>
              )}
              {!isComplete && (
                <Paragraph size="xs" className="text-primary-base">
                  Waiting for {totalSigners - signedCount} more signature
                  {totalSigners - signedCount !== 1 ? 's' : ''}
                </Paragraph>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
