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

interface PageProps {
  intentUtxo?: Utxo;
  readonly?: boolean;
  onSave?: () => void;
}

const MembershipIntentTimeline = ({
  intentUtxo,
  readonly = false,
  onSave,
}: PageProps) => {
  const [membershipData, setMembershipData] =
    useState<ExtendedMemberData | null>(null);

  // Parse membership data when intentUtxo changes
  useEffect(() => {
    if (intentUtxo?.plutusData) {
      const parsed = parseMembershipIntentDatum(intentUtxo.plutusData);
      if (parsed && parsed.metadata) {
        setMembershipData({
          ...intentUtxo,
          name: parsed.metadata.name,
          forum_username: parsed.metadata.forum_username,
          email: parsed.metadata.email,
          address: parsed.metadata.address,
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
      title: 'Intent form submitted',
      content: (
        <MemberDataComponent
          readonly={readonly}
          membershipData={membershipData}
          onSave={onSave}
        />
      ),
      status: 'completed',
    },
    {
      id: 'admin-review',
      title: 'Admin Review In Progress',
      content: (
        <div className="text-muted-foreground text-base font-medium">
          2 hours ago
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
    {
      id: 'membership-activated',
      title: 'Membership activated',
      content: (
        <div className="text-muted-foreground text-base font-medium">
          Welcome to Cardano!
        </div>
      ),
      status: 'pending',
    },
  ];

  return (
    <>
      {readonly && (
        <Title level="2" className="text-xl capitalize sm:text-2xl">
          {membershipData?.name ?? membershipData?.forum_username}
        </Title>
      )}
      <Timeline steps={applicationProgress} />
    </>
  );
};

export default MembershipIntentTimeline;
