'use client';

import MemberDataComponent from '@/app/manage/memberships/_components/MemberDataComponent';
import Timeline from '@/components/atoms/Timeline';
import { parseMembershipIntentDatum } from '@/utils';
import { MemberData } from '@sidan-lab/cardano-ambassador-tool';
import { TimelineStep, Utxo } from '@types';
import { useEffect, useState } from 'react';
import Title from './atoms/Title';

// Extend MemberData to include txHash
type ExtendedMemberData = MemberData & {
  txHash?: string;
};

// Type for edited data coming from MemberDataComponent
type EditedMemberData = {
  fullName: string;
  displayName: string;
  emailAddress: string;
  bio: string;
};

interface PageProps {
  intentUtxo?: Utxo;
  readonly?: boolean;
  onSave?: (userMetadata: MemberData) => void;
}

const MembershipIntentTimeline = ({
  intentUtxo,
  readonly = true,
  onSave,
}: PageProps) => {
  const [membershipData, setMembershipData] =
    useState<ExtendedMemberData | null>(null);

  const handleMemberDataSave = (updatedData: Partial<ExtendedMemberData>) => {
    if (onSave && membershipData) {
      const memberData: MemberData = {
        walletAddress: membershipData.walletAddress,
        fullName: updatedData.fullName ?? membershipData.fullName,
        displayName: updatedData.displayName ?? membershipData.displayName,
        emailAddress: updatedData.emailAddress ?? membershipData.emailAddress,
        bio: updatedData.bio ?? membershipData.bio,
      };
      onSave(memberData);
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
          Waiting for review
        </div>
      ),
      status: 'current',
    },
    {
      id: 'member-approval',
      title: 'Member Approval',
      content: (
        <div className="text-muted-foreground text-base font-medium">
          Pending approval
        </div>
      ),
      status: 'pending',
    },
    // {
    //   id: 'membership-activated',
    //   title: 'Membership activated',
    //   content: (
    //     <div className="text-muted-foreground text-base font-medium">
    //       Welcome to Cardano!
    //     </div>
    //   ),
    //   status: 'pending',
    // },
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
