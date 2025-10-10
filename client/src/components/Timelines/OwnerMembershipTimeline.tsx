'use client';

import MemberDataComponent from '@/app/manage/memberships/_components/MemberDataComponent';
import Timeline from '@/components/atoms/Timeline';
import { findAdminsFromOracle } from '@/lib/auth/roles';
import {
  extractRequiredSigners,
  extractWitnesses,
  parseMembershipIntentDatum,
  storageApiClient,
} from '@/utils';
import { MemberData } from '@sidan-lab/cardano-ambassador-tool';
import { AdminDecision, AdminDecisionData, TimelineStep, Utxo } from '@types';
import { useEffect, useState } from 'react';
import Paragraph from '../atoms/Paragraph';
import Title from '../atoms/Title';
import MultisigProgressTracker from '../SignatureProgress/MultisigProgressTracker';

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
  const [loading, setLoading] = useState(true);

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

      setMembershipData((prev) => (prev ? { ...prev, ...updatedData } : null));
    } catch (error) {
      console.error('Error saving member data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function loadAdminDecision() {
      setLoading(true);
      try {
        const decision = await storageApiClient.get<AdminDecision>(
          intentUtxo!.txHash,
          'submissions',
        );

        if (!decision) {
          throw new Error('Could not fetch admin decision.');
        }

        const signers = extractWitnesses(decision.signedTx);
        const selectedAdmins = extractRequiredSigners(decision.signedTx);

        const adminData = await findAdminsFromOracle();

        if (!adminData) {
          console.error('Could not fetch admin data from oracle');
          return;
        }

        const adminDecision: AdminDecisionData = {
          ...decision,
          signers: signers || [],
          selectedAdmins: selectedAdmins || [],
          minRequiredSigners: Number(adminData.minsigners),
          totalSigners: (signers || []).length,
        };

        setAdminDecisionData(adminDecision);
      } catch (error) {
        console.error('Failed to load admin decision:', error);
        setAdminDecisionData(null);
      } finally {
        setLoading(false);
      }
    }

    if (intentUtxo?.txHash) {
      loadAdminDecision();
    } else {
      setLoading(false);
    }
  }, []);

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

  const getEditApplicationStatus = () => {
    return membershipData ? 'completed' : 'pending';
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
      title: 'Edit Your Application',
      content: (
        <div className="space-y-3">
          <MemberDataComponent
            readonly={false}
            membershipData={membershipData}
            onSave={handleMemberDataSave}
          />
        </div>
      ),
      status: getEditApplicationStatus(),
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
      content: <div></div>,
      status: getMembershipActivatedStatus(),
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
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
