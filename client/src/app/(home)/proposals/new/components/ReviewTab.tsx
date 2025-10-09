import Title from '@/components/atoms/Title';
import Paragraph from '@/components/atoms/Paragraph';
import Copyable from '@/components/Copyable';
import { ProposalFormData } from '@/types/ProposalFormData';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import { getCurrentNetworkConfig } from '@/config/cardano';

interface Props {
  formData: ProposalFormData;
  userAddress?: string;
}

export default function ReviewTab({ formData, userAddress }: Props) {
  const proposalId = "#A1B2C3D4";

  return (
    <div className="sm:px-6">
    <div className="space-y-6">
    <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex-1 space-y-7">
            <div className="space-y-1.5">
              <Paragraph size="xs" className="text-muted-foreground font-light">
                Proposal ID
              </Paragraph>
              <Paragraph size="sm" className="text-foreground">
                {proposalId}
              </Paragraph>
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

          {/* Right column */}
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
                            value={userAddress}
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
                {formData.fundsRequested}
              </Paragraph>
            </div>
          </div>
        </div>
      <div className="px-7 py-6 rounded-[10px] border border-dashed border-border space-y-5">
        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Description
          </Title>
          <RichTextDisplay 
            content={formData.description} 
            className="text-foreground"
          />
        </div>
        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Objectives
          </Title>
          <RichTextDisplay 
            content={formData.objectives} 
            className="text-foreground"
          />
        </div>
        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Impact to eco-system
          </Title>
          <RichTextDisplay 
            content={formData.impactToEcosystem} 
            className="text-foreground"
          />
        </div>
        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Milestones
          </Title>
          <RichTextDisplay 
            content={formData.milestones} 
            className="text-foreground"
          />
        </div>
        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Impact
          </Title>
          <RichTextDisplay 
            content={formData.impact} 
            className="text-foreground"
          />
        </div>
     
        <div className="space-y-2.5">
          <Title level="6" className="text-foreground">
            Budget breakdown
          </Title>
          <RichTextDisplay 
            content={formData.budgetBreakdown} 
            className="text-foreground"
          />
        </div>
      </div>
    </div>
  </div>
  );
}