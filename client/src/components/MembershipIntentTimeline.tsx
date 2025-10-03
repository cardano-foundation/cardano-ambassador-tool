'use client';

import MemberDataComponent from '@/app/manage/memberships/_components/MemberDataComponent';
import Timeline from '@/components/atoms/Timeline';
import { useApp } from '@/context';
import { parseMembershipIntentDatum } from '@/utils';
import { MemberData } from '@sidan-lab/cardano-ambassador-tool';
import { TimelineStep, Utxo } from '@types';
import { useEffect, useState } from 'react';
import Button from './atoms/Button';
import Title from './atoms/Title';
import MultisigProgressTracker from './SignatureProgress/MultisigProgressTracker';

// Extend MemberData to include txHash
type ExtendedMemberData = MemberData & {
  txHash?: string;
};

interface PageProps {
  intentUtxo?: Utxo;
  readonly?: boolean;
  onSave?: (userMetadata: MemberData) => Promise<void>;
}

interface SignerStatus {
  address: string;
  signed: boolean;
}

const MembershipIntentTimeline = ({
  intentUtxo,
  readonly = true,
  onSave,
}: PageProps) => {
  const [membershipData, setMembershipData] =
    useState<ExtendedMemberData | null>(null);
  const [signers, setSigners] = useState<SignerStatus[]>([]);
  const [loadingSigners, setLoadingSigners] = useState(true);

  const { isAdmin } = useApp();

  const handleMemberDataSave = async (
    updatedData: Partial<ExtendedMemberData>,
  ) => {
    if (onSave && membershipData) {
      const memberData: MemberData = {
        walletAddress: membershipData.walletAddress,
        fullName: updatedData.fullName ?? membershipData.fullName,
        displayName: updatedData.displayName ?? membershipData.displayName,
        emailAddress: updatedData.emailAddress ?? membershipData.emailAddress,
        bio: updatedData.bio ?? membershipData.bio,
        country: updatedData.country ?? membershipData.country ?? '',
        city: updatedData.city ?? membershipData.city ?? '',
      };
      await onSave(memberData);
    }
  };

  // Parse membership data when intentUtxo changes
  useEffect(() => {
    if (intentUtxo?.plutusData) {
      const parsed = parseMembershipIntentDatum(intentUtxo.plutusData);
      if (parsed && parsed.metadata) {
        setMembershipData({
          walletAddress: parsed.metadata.walletAddress,
          fullName: parsed.metadata.fullName,
          displayName: parsed.metadata.displayName,
          emailAddress: parsed.metadata.emailAddress,
          bio: parsed.metadata.bio,
          country: parsed.metadata.country,
          city: parsed.metadata.city,
          txHash: intentUtxo.txHash,
        });
      }
    } else {
      setMembershipData(null);
    }
  }, [intentUtxo]);

  const applicationProgress: TimelineStep[] = [
    {
      id: 'intent-submitted',
      title: 'Intent Form Submitted',
      content: (
        <MemberDataComponent
          readonly={readonly}
          membershipData={membershipData}
          onSave={handleMemberDataSave}
        />
      ),
      status: 'completed',
    },
    {
      id: 'admin-review',
      title: 'Admin Review In Progress',
      content: (
        <div className="text-muted-foreground text-base font-medium">
          {isAdmin ? (
            <div className="w-full">
              <div className="mt-6 flex w-full justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => {}}
                  className="text-primary-base! flex-1 rounded-lg!"
                  size="sm"
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {}}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </div>
          ) : (
            'Admin Review In Progress'
          )}
        </div>
      ),
      status: 'current',
    },
    {
      id: 'multisig-approval',
      title: 'Multisig Approval',
      content: <MultisigProgressTracker txhash={intentUtxo?.txHash!} />,
      status: 'pending',
    },
    {
      id: 'membership-activated',
      title: 'Membership activated',
      content: (
        <div className="text-muted-foreground text-base font-medium">
          {isAdmin ? (
            <div className="mt-6 flex w-full">
              <Button
                variant="primary"
                onClick={() => {}}
                className="text-primary-base! flex-1 rounded-lg!"
                size="sm"
              >
                Reject
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {}}
                className="flex-1"
              >
                Approve
              </Button>
            </div>
          ) : (
            'Admin Review In Progress'
          )}
        </div>
      ),
      status: 'pending',
    },
  ];

  return (
    <>
      {readonly && (
        <Title level="2" className="text-xl capitalize sm:text-2xl">
          {membershipData?.fullName ?? membershipData?.displayName}
        </Title>
      )}
      <Timeline steps={applicationProgress} />
    </>
  );
};

export default MembershipIntentTimeline;
