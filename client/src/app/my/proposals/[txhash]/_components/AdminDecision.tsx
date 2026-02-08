import Card from "@/components/atoms/Card";
import Paragraph from "@/components/atoms/Paragraph";
import MultisigProgressTracker from "@/components/signature-progress/MultisigProgressTracker";
import Title from "@/components/atoms/Title";
import { AdminDecisionData } from "@types";

interface AdminDecisionProps {
  adminDecisionData: AdminDecisionData;
  proposal: any;
}

export const AdminDecision = ({
  adminDecisionData,
  proposal,
}: AdminDecisionProps) => (
  <>
    <div className="space-y-4">
      <Title level="5" className="text-foreground">
        Admin Decision Status
      </Title>
      <Card>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
                  adminDecisionData.decision === "approve"
                    ? "border-green-500 bg-green-50 text-green-500"
                    : "border-primary-base text-primary-base bg-red-50"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    adminDecisionData.decision === "approve"
                      ? "bg-green-500"
                      : "bg-primary-base"
                  }`}
                ></span>
                {adminDecisionData.decision === "approve"
                  ? "Approved"
                  : "Rejected"}
              </div>
            </div>
            <Paragraph size="sm" className="text-muted-foreground">
              Your proposal has been{" "}
              {adminDecisionData.decision === "approve"
                ? "approved"
                : "rejected"}{" "}
              by an admin and is now proceeding through the multisig approval
              process.
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>

    <div className="space-y-4">
      <Title level="5" className="text-foreground">
        Signature Progress
      </Title>
      <Card>
        <div className="p-6">
          <div className="space-y-3">
            <Paragraph size="sm" className="text-muted-foreground">
              Track the progress of required admin signatures for your proposal.
            </Paragraph>
            <MultisigProgressTracker
              txhash={proposal?.txHash}
              adminDecisionData={adminDecisionData}
            />
          </div>
        </div>
      </Card>
    </div>
  </>
);
