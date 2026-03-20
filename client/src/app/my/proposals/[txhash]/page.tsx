"use client";
import {
  parseProposalDatum,
  extractWitnesses,
  extractRequiredSigners,
} from "../../../../utils";
import { storageApiClient } from "../../../../utils/storageApiClient";
import { ProposalData } from "@sidan-lab/cardano-ambassador-tool";
import type {
  AdminDecisionData,
  AdminDecision as AdminDecisionType,
} from "@types";
import { use, useEffect, useRef, useState } from "react";
import { useDatabase, useWalletManager } from "../../../../hooks";
import { useTxConfirmation } from "../../../../hooks/useTxConfirmation";
import Chip from "../../../../components/atoms/Chip";
import Title from "../../../../components/atoms/Title";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { findAdminsFromOracle } from "../../../../lib/auth/roles";

import { EditProposalForm } from "./_components/EditProposalForm";
import { useEditProposal } from "./_components/useEditProposal";
import { ProposalDetails } from "./_components/ProposalDetails";
import { StateFeedback } from "./_components/StateFeedback";
import { AdminDecision } from "./_components/AdminDecision";
import { ProposalView } from "./_components/ProposalView";

interface PageProps {
  params: Promise<{ txHash: string }>;
}

type ProposalFormData = ProposalData & { description: string };

export default function Page({ params }: PageProps) {
  const { address: userAddress } = useWalletManager();
  const {
    proposalIntents,
    signOfApprovals,
    proposals,
    dbLoading,
    isSyncing,
    syncData,
  } = useDatabase();
  const [isEditing, setIsEditing] = useState(false);
  const { showTxConfirmation } = useTxConfirmation();
  const [adminDecisionData, setAdminDecisionData] =
    useState<AdminDecisionData | null>(null);
  const { txHash } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const descriptionEditorRef = useRef<any>(null);
  const hasTriggeredSync = useRef(false);

  useEffect(() => {
    hasTriggeredSync.current = false;
  }, [txHash]);

  useEffect(() => {
    const loadAdminDecision = async () => {
      if (!txHash) return;
      try {
        const decision = await storageApiClient.get<AdminDecisionType>(
          txHash,
          "submissions",
        );

        if (decision && decision.signedTx) {
          // Extract signers and selectedAdmins from the signed transaction
          const signers = extractWitnesses(decision.signedTx);
          const selectedAdmins = extractRequiredSigners(decision.signedTx);

          // Fetch admin data to get minRequiredSigners
          const adminData = await findAdminsFromOracle();

          // Create enriched AdminDecisionData
          const enrichedData: AdminDecisionData = {
            ...decision,
            signers: signers || [],
            selectedAdmins: selectedAdmins || [],
            minRequiredSigners: adminData ? Number(adminData.minsigners) : 0,
            totalSigners: (signers || []).length,
          };

          setAdminDecisionData(enrichedData);
        } else if (decision) {
          // If no signedTx, set with empty arrays
          setAdminDecisionData({
            ...decision,
            signers: [],
            selectedAdmins: [],
            minRequiredSigners: 0,
            totalSigners: 0,
          } as AdminDecisionData);
        }
      } catch (error) {
        console.error("Failed to load admin decision:", error);
        setAdminDecisionData(null);
      }
    };
    loadAdminDecision();
  }, [txHash]);

  const proposal = proposalIntents.find((utxo) => utxo.txHash === txHash);

  useEffect(() => {
    // Only triggering refresh if explicitly requested by URL param OR if missing
    const isExplicitRefresh = searchParams.get("refresh") === "true";
    const isMissing = !proposal && txHash && !dbLoading && !isSyncing;
    const shouldRefresh =
      isExplicitRefresh || (isMissing && !hasTriggeredSync.current);

    if (shouldRefresh && !isSyncing) {
      hasTriggeredSync.current = true;

      const refreshData = async () => {
        try {
          // 1. Revalidate cashe
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              allUtxos: true,
            }),
          });

          // 2. Sync new UTxOs
          syncData("proposal_intent");

          // 3. Clean up URL if refreshed
          if (isExplicitRefresh) {
            router.replace(pathname);
          }
        } catch (error) {
          console.error("Refresh failed:", error);
          syncData("proposal_intent");
        }
      };

      refreshData();
    }
  }, [proposal, txHash, dbLoading, syncData, searchParams, router, pathname]);

  // Initialize proposal data
  let proposalData: ProposalFormData;
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);

  try {
    if (proposal?.plutusData) {
      const parsedMetadata =
        typeof proposal.parsedMetadata === "string"
          ? JSON.parse(proposal.parsedMetadata)
          : proposal.parsedMetadata;

      const { metadata: datumMetadata } =
        parseProposalDatum(proposal.plutusData) || {};

      const metadata = parsedMetadata || datumMetadata;

      proposalData = {
        title: metadata?.title || "Error Loading Proposal",
        url: metadata?.url || "",
        description:
          fetchedContent !== null
            ? fetchedContent
            : metadata?.description || "",
        fundsRequested: metadata?.fundsRequested || "0",
        receiverWalletAddress: metadata?.receiverWalletAddress || "",
        submittedByAddress: metadata?.submittedByAddress || "",
        status: metadata?.status || "pending",
      };
    } else {
      throw new Error("No proposal data found");
    }
  } catch (error) {
    proposalData = {
      title: "Error Loading Proposal",
      url: "",
      description: "",
      fundsRequested: "0",
      receiverWalletAddress: "",
      submittedByAddress: "",
      status: "pending",
    };
  }

  // Fetch fresh content from GitHub to avoid stale indexer data
  useEffect(() => {
    if (proposal && proposalData.url) {
      const fetchContent = async () => {
        try {
          const filename = proposalData.url.split("/").pop();
          if (filename) {
            const res = await fetch(
              `/api/proposal-content?filename=${filename}`,
            );
            if (res.ok) {
              const data = await res.json();
              if (data.content) {
                setFetchedContent(data.content);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch fresh proposal content", error);
        }
      };

      fetchContent();
    }
  }, [proposal?.txHash, proposalData.url]);

  const [formData, setFormData] = useState<ProposalFormData>(proposalData);

  useEffect(() => {
    if (isEditing) {
      setFormData(proposalData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, proposal, fetchedContent]); // Update form data when edit mode is toggled or proposal/content changes

  const { isSubmitting, handleSaveChanges, error } = useEditProposal({
    proposal,
    userAddress: userAddress || "",
    formData,
    setFormData,
    showTxConfirmation,
    setIsEditing,
  });

  if (dbLoading || (isSyncing && !proposal))
    return <StateFeedback type="loading" />;
  if (!proposal) return <StateFeedback type="not-found" txHash={txHash} />;

  const isOwner =
    userAddress && proposalData.submittedByAddress === userAddress;
  if (!isOwner) return <StateFeedback type="access-denied" />;

  const getChipVariant = () => {
    switch (proposalData.status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const handleInputChange = (field: keyof ProposalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDiscardChanges = () => {
    setFormData(proposalData);
    setIsEditing(false);
  };

  return (
    <div className="container px-4 py-2 pb-8 sm:px-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Title level="5" className="text-foreground">
            {proposalData.title}
          </Title>
          <Chip variant={getChipVariant()} size="md" className="capitalize">
            {proposalData.status.replace("_", " ")}
          </Chip>
        </div>

        <ProposalDetails proposal={proposal} proposalData={proposalData} />

        <div className="flex items-center justify-between">
          <Title level="5" className="text-foreground">
            Overview
          </Title>
        </div>

        {isEditing ? (
          <EditProposalForm
            formData={formData}
            handleInputChange={handleInputChange}
            descriptionEditorRef={descriptionEditorRef}
            handleDiscardChanges={handleDiscardChanges}
            handleSaveChanges={handleSaveChanges}
            isSubmitting={isSubmitting}
            error={error}
          />
        ) : (
          <ProposalView
            proposalData={proposalData}
            setIsEditing={setIsEditing}
            adminDecisionData={adminDecisionData}
          />
        )}

        {adminDecisionData && (
          <AdminDecision
            adminDecisionData={adminDecisionData}
            proposal={proposal}
          />
        )}
      </div>
    </div>
  );
}
