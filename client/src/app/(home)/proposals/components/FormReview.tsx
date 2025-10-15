import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';

interface Props {
  mode: 'create' | 'edit';
  formData: ProposalData;
  userAddress?: string;
  proposalId?: string;
}

export default function FormReview({
  formData,
}: Props) {
  const { userAddress } = useApp();
  return (
    <div className="sm:px-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex-1 space-y-7">
            <div className="space-y-1.5">
              <Paragraph size="xs" className="text-muted-foreground font-light">
                Proposal ID
              </Paragraph>
              {/* <Paragraph size="sm" className="text-foreground">
                {proposalId}
              </Paragraph> */}
            </div>

            <div className="space-y-1.5">
              <Paragraph size="xs" className="text-muted-foreground font-light">
                Receiver wallet
              </Paragraph>
              {formData.receiverWalletAddress ? (
                <Copyable
                  withKey={false}
                  link={`${getCurrentNetworkConfig().explorerUrl}/address/${formData.receiverWalletAddress}`}
                  value={formData.receiverWalletAddress}
                  keyLabel={''}
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
              <Paragraph size="xs" className="text-muted-foreground font-light">
                Submitted by
              </Paragraph>
              <div className="flex items-start gap-1.5">
                <div className="flex items-center gap-2.5">
                  {userAddress ? (
                    <Copyable
                      withKey={false}
                      link={`${getCurrentNetworkConfig().explorerUrl}/address/${userAddress}`}
                      value={formData.submittedByAddress}
                      keyLabel={''}
                    />
                  ) : (
                    <Paragraph size="sm" className="text-foreground">
                      Not connected
                    </Paragraph>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Paragraph size="xs" className="text-muted-foreground font-light">
                Funds Requested
              </Paragraph>
              <Paragraph size="sm" className="text-foreground">
                {formData.fundsRequested || 'Not specified'}
              </Paragraph>
            </div>
          </div>
        </div>

        <div className="border-border space-y-5 rounded-[10px] border border-dashed px-7 py-6">
          <div className="space-y-2.5">
            <Title level="6" className="text-foreground">
              Description
            </Title>
            <RichTextDisplay
              content={formData.description}
              className="text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
