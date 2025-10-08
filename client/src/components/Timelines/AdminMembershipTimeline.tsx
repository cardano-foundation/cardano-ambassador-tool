'use client';

import MemberDataComponent from '@/app/manage/memberships/_components/MemberDataComponent';
import Timeline from '@/components/atoms/Timeline';
import { parseMembershipIntentDatum } from '@/utils';
import { MemberData } from '@sidan-lab/cardano-ambassador-tool';
import { AdminDecisionData, TimelineStep, Utxo } from '@types';
import { useEffect, useState } from 'react';
import Title from '../atoms/Title';
import ApproveReject from '../RejectApprove';
import MultisigProgressTracker from '../SignatureProgress/MultisigProgressTracker';
import ActivateMembership from '../ActivateMembership';


// Extend MemberData to include txHash
type ExtendedMemberData = MemberData & {
  txHash?: string;
};

interface AdminMembershipTimelineProps {
  intentUtxo?: Utxo;
  onApprove?: (memberData: MemberData) => Promise<void>;
  onReject?: (memberData: MemberData) => Promise<void>;
}

const AdminMembershipTimeline = ({
  intentUtxo,
}: AdminMembershipTimelineProps) => {
  const [membershipData, setMembershipData] =
    useState<ExtendedMemberData | null>(null);
  const [adminDecisionData, setAdminDecisionData] =
    useState<AdminDecisionData | null>(null);

  // Handle admin decision updates
  const handleAdminDecisionUpdate = (data: AdminDecisionData | null) => {
    setAdminDecisionData(data);
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
        <MemberDataComponent readonly={true} membershipData={membershipData} />
      ),
      status: 'completed',
    },
    {
      id: 'admin-review',
      title: 'Admin Review',
      content: (
        <ApproveReject
          intentUtxo={intentUtxo}
          context={'MembershipIntent'}
          onDecisionUpdate={handleAdminDecisionUpdate}
        />
      ),
      status: 'current',
    },
    {
      id: 'multisig-approval',
      title: 'Multisig Approval',
      content: (
        <MultisigProgressTracker
          txhash={intentUtxo?.txHash}
          adminDecisionData={adminDecisionData}
        />
      ),
      status: 'pending',
    },
    {
      id: 'membership-activated',
      title: 'Membership Activated',
      content: (
        <ActivateMembership
          txhash={intentUtxo?.txHash}
          adminDecisionData={adminDecisionData}
        />
      ),
      status: 'pending',
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {membershipData && (
        <div className="space-y-2">
          <Title level="2" className="text-xl sm:text-2xl">
            Reviewing: {membershipData.fullName || membershipData.displayName}
          </Title>
        </div>
      )}
      <Timeline steps={applicationProgress} />
    </div>
  );
};

export default AdminMembershipTimeline;
