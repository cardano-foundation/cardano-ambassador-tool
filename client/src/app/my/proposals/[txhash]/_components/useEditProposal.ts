import {
  adaToLovelace,
  dbUtxoToMeshUtxo,
  getCatConstants,
  getProvider,
  parseAdaInput,
  parseProposalDatum,
} from "@/utils";
import { resolveTxHash } from "@meshsdk/core";
import {
  ProposalData,
  proposalMetadata,
  UserActionTx,
} from "@sidan-lab/cardano-ambassador-tool";
import { useState } from "react";
import { useDatabase, useWalletManager } from "@/hooks";
import { useRouter } from "next/navigation";

type ProposalFormData = ProposalData & { description: string };

interface UseEditProposalProps {
  proposal: any;
  userAddress: string;
  formData: ProposalFormData;
  setFormData: (data: ProposalFormData) => void;
  showTxConfirmation: (props: any) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useEditProposal = ({
  proposal,
  userAddress,
  formData,
  showTxConfirmation,
  setIsEditing,
}: UseEditProposalProps) => {
  const { wallet: userWallet } = useWalletManager();
  const { syncData } = useDatabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSaveChanges = async () => {
    if (!proposal || !userWallet || !userAddress) return;
    setError(null);

    try {
      setIsSubmitting(true);

      // Extract filename from URL if it exists
      const existingFilename = formData.url
        ? formData.url.split("/").pop()
        : undefined;

      // 1. Upload new content to GitHub
      const saveResponse = await fetch("/api/proposal-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          submitterAddress: userAddress,
          filename: existingFilename,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save proposal content to GitHub");
      }

      const saveData = await saveResponse.json();
      const filename = saveData.data.filename;
      const githubUrl = `https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO}/blob/${process.env.NEXT_PUBLIC_GITHUB_BRANCH}/proposals-applications/content/${filename}`;

      // 2. Prepare Transaction
      const blockfrost = getProvider();
      const ORACLE_TX_HASH = process.env.NEXT_PUBLIC_ORACLE_TX_HASH!;
      const ORACLE_OUTPUT_INDEX = parseInt(
        process.env.NEXT_PUBLIC_ORACLE_OUTPOUT_INDEX || "0",
      );

      const oracleUtxos = await blockfrost.fetchUTxOs(
        ORACLE_TX_HASH,
        ORACLE_OUTPUT_INDEX,
      );
      const oracleUtxo = oracleUtxos[0];

      if (!oracleUtxo) {
        throw new Error("Failed to fetch required oracle UTxO");
      }

      const proposalIntentUtxo = dbUtxoToMeshUtxo(proposal);
      const { memberIndex } = parseProposalDatum(proposal.plutusData!)!;

      const cleanAdaAmount = parseAdaInput(formData.fundsRequested);
      const lovelaceAmount = adaToLovelace(cleanAdaAmount);

      const metadataFormData: ProposalData = {
        title: formData.title,
        url: githubUrl,
        fundsRequested: lovelaceAmount.toString(),
        receiverWalletAddress: formData.receiverWalletAddress,
        submittedByAddress: formData.submittedByAddress,
        status: formData.status,
      };
      const metadata = proposalMetadata(metadataFormData);

      const userAction = new UserActionTx(
        userAddress,
        userWallet,
        blockfrost,
        getCatConstants(),
      );

      // 3. Build and Submit Transaction
      const result = await userAction.updateProposalIntentMetadata(
        oracleUtxo,
        proposalIntentUtxo,
        memberIndex,
        lovelaceAmount,
        formData.receiverWalletAddress,
        metadata,
      );

      const newTxHash = resolveTxHash(result.txHex);

      showTxConfirmation({
        txHash: newTxHash,
        title: "Proposal Updated",
        description:
          "Your proposal update has been submitted. Please wait for blockchain confirmation.",
        onConfirmed: () => {
          setIsEditing(false);
          syncData("proposal_intent");
          router.push(`/my/proposals/${newTxHash}?refresh=true`);
        },
      });
    } catch (err: any) {
      console.error("Error updating proposal:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update proposal. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSaveChanges, error, setError };
};
