'use client';

import MemberDataComponent from '@/app/manage/memberships/_components/MemberDataComponent';
import Timeline from '@/components/atoms/Timeline';
import { parseMembershipIntentDatum } from '@/utils';
import { MemberData } from '@sidan-lab/cardano-ambassador-tool';
import { AdminDecisionData, TimelineStep, Utxo } from '@types';
import { useEffect, useState } from 'react';
import Button from '../atoms/Button';
import Paragraph from '../atoms/Paragraph';
import Title from '../atoms/Title';
import ApproveReject from '../RejectApprove';
import MultisigProgressTracker from '../SignatureProgress/MultisigProgressTracker';

// Extend MemberData to include txHash
type ExtendedMemberData = MemberData & {
  txHash?: string;
};

interface OwnerMembershipTimelineProps {
  intentUtxo?: Utxo;
  onSave?: (memberData: MemberData) => Promise<void>;
}

const OwnerMembershipTimeline = ({
  intentUtxo,
  onSave,
}: OwnerMembershipTimelineProps) => {
  const [membershipData, setMembershipData] =
    useState<ExtendedMemberData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleMemberDataSave = async (
    updatedData: Partial<ExtendedMemberData>,
  ) => {
    if (!onSave || !membershipData) return;

    setIsSaving(true);
    try {
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

      // Update local state with saved data
      setMembershipData((prev) => (prev ? { ...prev, ...updatedData } : null));
    } catch (error) {
      console.error('Error saving member data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const applicationProgress: TimelineStep[] = [
    {
      id: 'intent-submitted',
      title: 'Edit Your Application',
      content: (
        <div className="space-y-3">
          <MemberDataComponent
            readonly={false}
            membershipData={membershipData}
            onSave={handleMemberDataSave}
            // isLoading={isSaving}
          />
        </div>
      ),
      status: 'completed',
    },
    {
      id: 'multisig-approval',
      title: 'Final Approval',
      content: (
        <div className='hidden'>
          <MultisigProgressTracker
            txhash={intentUtxo?.txHash}
            adminDecisionData={adminDecisionData}
          />
        </div>
      ),
      status: 'current',
    },
    // {
    //   id: 'admin-review',
    //   title: 'Admin Review',
    //   content: (
    //     <div className="hidden">
    //       <ApproveReject
    //         intentUtxo={intentUtxo}
    //         context={'MembershipIntent'}
    //         onDecisionUpdate={handleAdminDecisionUpdate}
    //       />
    //     </div>
    //   ),
    //   status: 'current',
    // },
    {
      id: 'membership-activated',
      title: 'Welcome to Cardano!',
      content: (
        <Paragraph size="base" className="">
          🎉 Your membership has been activated! Welcome to the Cardano
          Ambassador community.
        </Paragraph>
      ),
      status: 'pending',
    },
    {
      id: 'what-next',
      title: "What's Next?",
      content: (
        <div className="space-y-3">
          <Paragraph size="base" className="">
            Update your profile so you are discoverable.
          </Paragraph>
          <Button
            variant="primary"
            onClick={() => {}}
            disabled={true}
            className="flex-1"
            size="sm"
          >
            View profile
          </Button>
        </div>
      ),
      status: 'pending',
    },
  ];

  return (
    <div className="max-w-4xl  space-y-6">
      {membershipData && (
        <div className="space-y-2">
          <Title level="2" className="text-xl sm:text-2xl">
            Your Application
          </Title>
          <Paragraph size="base" className="">
            Track your membership application progress and make updates as
            needed.
          </Paragraph>
        </div>
      )}
      <Timeline steps={applicationProgress} />
    </div>
  );
};

export default OwnerMembershipTimeline;
