import { useWalletManager } from "../hooks";
import { findAdminsFromOracle } from "../lib/auth/roles";
import {
  dbUtxoToMeshUtxo,
  extractRequiredSigners,
  extractWitnesses,
  findOracleUtxo,
  getCatConstants,
  getProvider,
} from "../utils";
import { storageApiClient } from "../utils/storageApiClient";
import { deserializeAddress } from "@meshsdk/core";
import { AdminActionTx } from "@sidan-lab/cardano-ambassador-tool";
import { AdminDecision, AdminDecisionData, Utxo } from "@types";
import React, { useEffect, useState } from "react";
import AdminSelectorModal from "./AdminSelectorModal";
import Button from "./atoms/Button";
import ErrorAccordion from "./ErrorAccordion";

interface RemoveMemberActionProps {
  memberUtxo?: Utxo;
  onDecisionUpdate?: (data: AdminDecisionData | null) => void;
}

const RemoveMemberAction: React.FC<RemoveMemberActionProps> = ({
  memberUtxo,
  onDecisionUpdate,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingDecision, setIsLoadingDecision] = useState(true);
  const [submitError, setSubmitError] = useState<{
    message: string;
    details?: string;
  } | null>(null);
  const [adminDecision, setAdminDecision] = useState<AdminDecision | null>(
    null,
  );
  const [currentWalletHasSigned, setCurrentWalletHasSigned] = useState(false);
  const [showAdminSelector, setShowAdminSelector] = useState(false);
  const { wallet } = useWalletManager();

  const checkCurrentWalletSigned = async (decision: AdminDecision) => {
    try {
      if (!wallet || !decision.signedTx) {
        setCurrentWalletHasSigned(false);
        return;
      }
      const currentAddress = await wallet.getChangeAddress();
      const currentPubKeyHash = deserializeAddress(currentAddress).pubKeyHash;
      const signers = extractWitnesses(decision.signedTx);
      setCurrentWalletHasSigned(signers?.includes(currentPubKeyHash) || false);
    } catch (error) {
      console.error("Error checking wallet signature status:", error);
      setCurrentWalletHasSigned(false);
    }
  };

  const extractAndSendDecisionData = async (decision: AdminDecision) => {
    try {
      const signers = extractWitnesses(decision.signedTx);
      const selectedAdmins = extractRequiredSigners(decision.signedTx);
      const adminData = await findAdminsFromOracle();

      if (!adminData) {
        console.error("Could not fetch admin data from oracle");
        return;
      }

      const decisionData: AdminDecisionData = {
        ...decision,
        signers: signers || [],
        selectedAdmins: selectedAdmins || [],
        minRequiredSigners: Number(adminData.minsigners),
        totalSigners: (signers || []).length,
      };

      onDecisionUpdate?.(decisionData);
      await checkCurrentWalletSigned(decision);
    } catch (error) {
      console.error("Error extracting decision data:", error);
      onDecisionUpdate?.(null);
    }
  };

  function handleRemoveClick(): void {
    if (adminDecision) {
      setIsProcessing(true);
      secondDecision();
    } else {
      setShowAdminSelector(true);
    }
  }

  async function secondDecision() {
    setSubmitError(null);
    try {
      if (!wallet || !adminDecision) {
        throw new Error("Wallet or admin decision not available");
      }

      const supportSign = await wallet.signTx(adminDecision.signedTx, true);
      if (!supportSign) {
        throw new Error("Failed to sign transaction - wallet returned undefined");
      }

      const updatedData: AdminDecision = {
        ...adminDecision,
        signedTx: supportSign as string,
      };

      await storageApiClient.save(
        memberUtxo!.txHash,
        updatedData,
        "submissions",
      );

      setAdminDecision(updatedData);
      await extractAndSendDecisionData(updatedData);
    } catch (error) {
      console.error("Error seconding decision:", error);
      setSubmitError({
        message: "Failed to second the decision",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDeleteDecision() {
    setSubmitError(null);
    setIsProcessing(true);
    try {
      if (!adminDecision || !memberUtxo?.txHash) {
        throw new Error("Missing decision data");
      }
      const deleted = await storageApiClient.delete(memberUtxo.txHash, "submissions");
      if (!deleted) throw new Error("Failed to delete decision file");
      setAdminDecision(null);
      onDecisionUpdate?.(null);
      setCurrentWalletHasSigned(false);
    } catch (error) {
      console.error("Error deleting decision:", error);
      setSubmitError({
        message: "Failed to delete decision",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  async function initRemoveMember(selectedAdmins: string[]) {
    setSubmitError(null);
    try {
      const oracleUtxo = await findOracleUtxo();
      if (!oracleUtxo) {
        throw new Error("Failed to fetch Oracle UTxO");
      }

      const blockfrost = getProvider();
      if (!wallet) {
        throw new Error("Wallet not connected");
      }

      const address = await wallet.getChangeAddress();
      const adminsPkh = selectedAdmins.map(
        (add: string) => deserializeAddress(add).pubKeyHash,
      );

      const adminAction = new AdminActionTx(
        address,
        wallet,
        blockfrost,
        getCatConstants(),
      );

      const unsignedTx = await adminAction.removeMember(
        oracleUtxo,
        dbUtxoToMeshUtxo(memberUtxo!),
        adminsPkh,
      );
      if (!unsignedTx) throw new Error("Failed to create transaction");

      const firstSigTX = await wallet.signTx(unsignedTx.txHex, true);
      if (!firstSigTX) {
        throw new Error("Failed to sign transaction - wallet returned undefined");
      }

      const { txHex, ...signedTx } = unsignedTx;

      const data: AdminDecision = {
        context: "Member",
        decision: "remove",
        signedTx: firstSigTX,
        ...signedTx,
      };

      await storageApiClient.save(memberUtxo!.txHash, data, "submissions");
      setAdminDecision(data);
      await extractAndSendDecisionData(data);
    } catch (error) {
      console.error("Error creating remove member decision:", error);
      setSubmitError({
        message: "Failed to create remove member decision",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    async function loadAdminDecision() {
      try {
        setCurrentWalletHasSigned(false);
        const decision = await storageApiClient.get<AdminDecision>(
          memberUtxo!.txHash,
          "submissions",
        );
        setAdminDecision(decision);
        if (decision) {
          await extractAndSendDecisionData(decision);
        }
      } catch (error) {
        console.error("Failed to load admin decision:", error);
        setAdminDecision(null);
        setCurrentWalletHasSigned(false);
        onDecisionUpdate?.(null);
      } finally {
        setIsLoadingDecision(false);
      }
    }

    if (memberUtxo?.txHash) {
      loadAdminDecision();
    } else {
      setIsLoadingDecision(false);
      setCurrentWalletHasSigned(false);
    }
  }, [memberUtxo?.txHash]);

  const handleAdminSelectionConfirm = async (selectedAdmins: string[]) => {
    setShowAdminSelector(false);
    setIsProcessing(true);
    await initRemoveMember(selectedAdmins);
  };

  const handleAdminSelectionCancel = () => {
    setShowAdminSelector(false);
  };

  if (isLoadingDecision) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="flex justify-between">
            <div className="h-12 w-30 animate-pulse rounded-lg bg-gray-200 lg:w-60"></div>
          </div>
        </div>
      </div>
    );
  }

  if (adminDecision) {
    return (
      <div className="space-y-6">
        <ErrorAccordion
          isVisible={!!submitError}
          message={submitError?.message}
          details={submitError?.details}
          onDismiss={() => setSubmitError(null)}
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="border-primary-base text-primary-base inline-flex items-center gap-2 rounded-full border bg-red-50 px-3 py-1.5 text-sm font-medium">
              <span className="bg-primary-base h-2 w-2 rounded-full"></span>
              Removal Pending
            </div>
          </div>
        </div>

        {!currentWalletHasSigned && (
          <div className="flex w-1/2 justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => handleRemoveClick()}
              disabled={isProcessing}
              className="text-primary-600!"
            >
              {isProcessing ? "Processing..." : "Second Removal"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteDecision()}
              disabled={isProcessing}
              className="text-primary-base!"
            >
              Delete Decision
            </Button>
          </div>
        )}

        {currentWalletHasSigned && (
          <div>
            <span className="text-sm">
              ✓ You have already signed this removal
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <ErrorAccordion
          isVisible={!!submitError}
          message={submitError?.message}
          details={submitError?.details}
          onDismiss={() => setSubmitError(null)}
        />

        <div className="text-base font-medium">
          Remove this member from the ambassador program:
        </div>
        <div className="flex w-full gap-4">
          <Button
            variant="outline"
            onClick={() => handleRemoveClick()}
            disabled={isProcessing || !memberUtxo?.txHash}
            className="text-primary-base! flex-1"
          >
            {isProcessing ? "Processing..." : "Remove Member"}
          </Button>
        </div>
      </div>

      <AdminSelectorModal
        isVisible={showAdminSelector}
        onConfirm={handleAdminSelectionConfirm}
        onCancel={handleAdminSelectionCancel}
        decision={"remove"}
      />
    </>
  );
};

export default RemoveMemberAction;
