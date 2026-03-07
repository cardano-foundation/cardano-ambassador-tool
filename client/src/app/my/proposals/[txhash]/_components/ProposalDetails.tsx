import Card, { CardContent } from "@/components/atoms/Card";
import Paragraph from "@/components/atoms/Paragraph";
import Copyable from "@/components/Copyable";
import { getCurrentNetworkConfig } from "@/config/cardano";
import { ProposalData } from "@sidan-lab/cardano-ambassador-tool";
import type { Utxo } from "@types";

type ProposalFormData = ProposalData & { description: string };

interface ProposalDetailsProps {
  proposal: Utxo;
  proposalData: ProposalFormData;
}

export const ProposalDetails = ({
  proposal,
  proposalData,
}: ProposalDetailsProps) => (
  <Card>
    <CardContent className="flex flex-col gap-10 sm:flex-row sm:justify-between">
      <div className="flex-1 space-y-7">
        <div className="space-y-1.5">
          <Paragraph size="xs" className="">
            TxHash
          </Paragraph>
          <Copyable
            withKey={false}
            link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposal.txHash}`}
            value={proposal.txHash}
            keyLabel={""}
          />
        </div>
        <div className="space-y-1.5">
          <Paragraph size="xs" className="">
            Receiver wallet
          </Paragraph>
          {proposalData.receiverWalletAddress ? (
            <Copyable
              withKey={false}
              link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposalData.receiverWalletAddress}`}
              value={proposalData.receiverWalletAddress}
              keyLabel={""}
            />
          ) : (
            <Paragraph size="sm" className="text-foreground">
              Not specified
            </Paragraph>
          )}
        </div>
        <div className="space-y-1.5">
          <Paragraph size="xs" className="">
            Submitted By
          </Paragraph>
          {proposalData.submittedByAddress ? (
            <Copyable
              withKey={false}
              link={`${getCurrentNetworkConfig().explorerUrl}/address/${proposalData.submittedByAddress}`}
              value={proposalData.submittedByAddress}
              keyLabel={""}
            />
          ) : (
            <Paragraph size="sm" className="text-foreground">
              Not specified
            </Paragraph>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-7">
        <div className="space-y-1.5">
          <Paragraph size="xs" className="">
            Funds Requested
          </Paragraph>
          <Paragraph size="sm" className="text-foreground">
            {proposalData.fundsRequested}
          </Paragraph>
        </div>
      </div>
    </CardContent>
  </Card>
);
