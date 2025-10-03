'use client';

import MemberDataComponent from '@/app/manage/memberships/_components/MemberDataComponent';
import Timeline from '@/components/atoms/Timeline';
import { parseMembershipIntentDatum } from '@/utils';
import { MemberData } from '@sidan-lab/cardano-ambassador-tool';
import { TimelineStep, Utxo } from '@types';
import { useEffect, useState } from 'react';
import Button from '../atoms/Button';
import Title from '../atoms/Title';
import MultisigProgressTracker from '../SignatureProgress/MultisigProgressTracker';

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
  onApprove,
  onReject,
}: AdminMembershipTimelineProps) => {
  const [membershipData, setMembershipData] =
    useState<ExtendedMemberData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleApprove = async () => {
    if (!membershipData || !onApprove) return;
    
    setIsProcessing(true);
    try {
      await onApprove(membershipData);
    } catch (error) {
      console.error('Error approving membership:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!membershipData || !onReject) return;
    
    setIsProcessing(true);
    try {
      await onReject(membershipData);
    } catch (error) {
      console.error('Error rejecting membership:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applicationProgress: TimelineStep[] = [
    {
      id: 'intent-submitted',
      title: 'Intent Form Submitted',
      content: (
        <MemberDataComponent
          readonly={true} // Admin view is read-only
          membershipData={membershipData}
        />
      ),
      status: 'completed',
    },
    {
      id: 'admin-review',
      title: 'Admin Review',
      content: (
        <div className="space-y-4">
          <div className="text-muted-foreground text-base font-medium">
            Review the membership application and make a decision:
          </div>
          <div className="flex w-full justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing || !membershipData}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              size="sm"
            >
              {isProcessing ? 'Processing...' : 'Reject Application'}
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={isProcessing || !membershipData}
              className="flex-1"
              size="sm"
            >
              {isProcessing ? 'Processing...' : 'Approve Application'}
            </Button>
          </div>
        </div>
      ),
      status: 'current',
    },
    {
      id: 'multisig-approval',
      title: 'Multisig Approval',
      content: (
        <div className="space-y-2">
          <div className="text-muted-foreground text-sm">
            Waiting for required admin signatures to process the application.
          </div>
          <MultisigProgressTracker txhash={intentUtxo?.txHash} />
        </div>
      ),
      status: 'pending',
    },
    {
      id: 'membership-activated',
      title: 'Membership Activated',
      content: (
        <div className="text-muted-foreground text-base font-medium">
          Welcome to Cardano! Membership has been successfully activated.
        </div>
      ),
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      {membershipData && (
        <div className="space-y-2">
          <Title level="2" className="text-xl sm:text-2xl">
            Admin Review: {membershipData.fullName || membershipData.displayName}
          </Title>
          <p className="text-muted-foreground text-sm">
            Reviewing membership application for {membershipData.walletAddress}
          </p>
        </div>
      )}
      <Timeline steps={applicationProgress} />
    </div>
  );
};

export default AdminMembershipTimeline;