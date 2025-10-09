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
  const [isActivated, setIsActivated] = useState(false);

  const handleAdminDecisionUpdate = (data: AdminDecisionData | null) => {
    setAdminDecisionData(data);
  };

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


  const getSignedCount = () => {
    if (!adminDecisionData?.selectedAdmins || !adminDecisionData?.signers) return 0;
    return adminDecisionData.selectedAdmins.filter(admin => 
      adminDecisionData.signers.includes(admin)
    ).length;
  };

  const signatureRequirementsMet = () => {
    if (!adminDecisionData) return false;
    const signedCount = getSignedCount();
    return signedCount >= adminDecisionData.selectedAdmins.length;
  };

  const isMembershipActivated = () => {
    return isActivated;
  };

  const handleActivationComplete = () => {
    setIsActivated(true);
  };

  const getIntentSubmittedStatus = () => {
    return membershipData ? 'completed' : 'pending';
  };

  const getAdminReviewStatus = () => {
    if (!membershipData) return 'pending';
    if (!adminDecisionData?.decision) return 'current';
    return 'completed';
  };

  const getMultisigApprovalStatus = () => {
    if (!adminDecisionData?.decision) return 'pending';
    if (signatureRequirementsMet()) return 'completed';
    return 'current';
  };

  const getMembershipActivatedStatus = () => {
    if (signatureRequirementsMet()) return 'current';
    return 'pending';
  };

  const applicationProgress: TimelineStep[] = [
    {
      id: 'intent-submitted',
      title: 'Intent Form Submitted',
      content: (
        <MemberDataComponent readonly={true} membershipData={membershipData} />
      ),
      status: getIntentSubmittedStatus(),
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
      status: getAdminReviewStatus(),
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
      status: getMultisigApprovalStatus(),
    },
    {
      id: 'membership-activated',
      title: 'Membership Activated',
      content: (
        <ActivateMembership
          txhash={intentUtxo?.txHash}
          adminDecisionData={adminDecisionData}
          onActivationComplete={handleActivationComplete}
        />
      ),
      status: getMembershipActivatedStatus(),
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
