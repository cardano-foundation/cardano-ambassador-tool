"use client";

import MemberDataComponent from "@/app/manage/membership-applications/_components/MemberDataComponent";
import Timeline from "@/components/atoms/Timeline";
import Button from "@/components/atoms/Button";
import Title from "@/components/atoms/Title";
import FinalizeDecision from "@/components/FinalizeDecision";
import RemoveMemberAction from "@/components/RemoveMemberAction";
import MultisigProgressTracker from "@/components/signature-progress/MultisigProgressTracker";
import SimpleCardanoLoader from "@/components/SimpleCardanoLoader";
import { routes } from "@/config/routes";
import { useDatabase } from "@/hooks";
import { parseMemberDatum } from "@/utils";
import { MemberData } from "@sidan-lab/cardano-ambassador-tool";
import { AdminDecisionData, TimelineStep, Utxo } from "@types";
import Link from "next/link";
import { use, useEffect, useState } from "react";

type ExtendedMemberData = MemberData & {
  txHash?: string;
};

interface PageProps {
  params: Promise<{ txhash: string }>;
}

const ManageMemberPage = ({ params }: PageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberUtxo, setMemberUtxo] = useState<Utxo | null>(null);
  const [membershipData, setMembershipData] =
    useState<ExtendedMemberData | null>(null);
  const [adminDecisionData, setAdminDecisionData] =
    useState<AdminDecisionData | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const { members, dbLoading } = useDatabase();
  const { txhash } = use(params);

  useEffect(() => {
    if (!txhash || dbLoading) return;

    if (!members.length) {
      setError("No members found");
      setLoading(false);
      return;
    }

    const found = members.find((m) => m.txHash === txhash);
    if (!found) {
      setError("Member not found");
      setLoading(false);
      return;
    }

    setMemberUtxo(found);

    if (found.plutusData) {
      const parsed = parseMemberDatum(found.plutusData);
      if (parsed) {
        setMembershipData({
          walletAddress: parsed.member.metadata.walletAddress,
          fullName: parsed.member.metadata.fullName,
          displayName: parsed.member.metadata.displayName,
          emailAddress: parsed.member.metadata.emailAddress,
          bio: parsed.member.metadata.bio,
          country: parsed.member.metadata.country,
          city: parsed.member.metadata.city,
          txHash: found.txHash,
        });
      }
    }

    setLoading(false);
  }, [txhash, members, dbLoading]);

  const handleAdminDecisionUpdate = (data: AdminDecisionData | null) => {
    setAdminDecisionData(data);
  };

  const handleRemovalComplete = () => {
    setIsRemoved(true);
  };

  const getSignedCount = () => {
    if (!adminDecisionData?.selectedAdmins || !adminDecisionData?.signers)
      return 0;
    return adminDecisionData.selectedAdmins.filter((admin) =>
      adminDecisionData.signers.includes(admin),
    ).length;
  };

  const signatureRequirementsMet = () => {
    if (!adminDecisionData) return false;
    return getSignedCount() >= adminDecisionData.selectedAdmins.length;
  };

  const getMemberInfoStatus = () => {
    return membershipData ? "completed" : "pending";
  };

  const getAdminReviewStatus = () => {
    if (!membershipData) return "pending";
    if (!adminDecisionData?.decision) return "current";
    return "completed";
  };

  const getMultisigApprovalStatus = () => {
    if (!adminDecisionData?.decision) return "pending";
    if (signatureRequirementsMet()) return "completed";
    return "current";
  };

  const getRemovalStatus = () => {
    if (signatureRequirementsMet()) return "current";
    return "pending";
  };

  if (loading || dbLoading) {
    return <SimpleCardanoLoader />;
  }

  if (error || !txhash || !memberUtxo) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Member Not Found
          </Title>
          <Link href={routes.manage.ambassadors}>
            <Button variant="primary">Back to Ambassadors</Button>
          </Link>
        </div>
      </div>
    );
  }

  const removalProgress: TimelineStep[] = [
    {
      id: "member-info",
      title: "Member Information",
      content: (
        <MemberDataComponent readonly={true} membershipData={membershipData} />
      ),
      status: getMemberInfoStatus(),
    },
    {
      id: "admin-review",
      title: "Admin Review — Remove Member",
      content: (
        <RemoveMemberAction
          memberUtxo={memberUtxo}
          onDecisionUpdate={handleAdminDecisionUpdate}
        />
      ),
      status: getAdminReviewStatus(),
    },
    {
      id: "multisig-approval",
      title: "Multisig Approval",
      content: (
        <MultisigProgressTracker
          txhash={memberUtxo.txHash}
          adminDecisionData={adminDecisionData}
        />
      ),
      status: getMultisigApprovalStatus(),
    },
    {
      id: "member-removed",
      title: "Member Removed",
      content: (
        <FinalizeDecision
          txhash={memberUtxo.txHash}
          adminDecisionData={adminDecisionData}
          context={"Member"}
          onFinalizationComplete={handleRemovalComplete}
        />
      ),
      status: getRemovalStatus(),
    },
  ];

  return (
    <div className="space-y-6 px-4 py-2 pb-8 sm:px-6">
      <div className="max-w-4xl space-y-6">
        {membershipData && (
          <div className="space-y-2">
            <Title level="4" className="text-xl sm:text-2xl">
              Manage: {membershipData.fullName || membershipData.displayName}
            </Title>
          </div>
        )}
        <Timeline steps={removalProgress} />
      </div>
    </div>
  );
};

export default ManageMemberPage;
