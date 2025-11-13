import Paragraph from '@/components/atoms/Paragraph';
import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import Copyable from '@/components/Copyable';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { useApp } from '@/context';
import { formatAdaAmount, parseAdaInput } from '@/utils/utils';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';

type ProposalFormData = ProposalData & {
  description: string;
};

interface Props {
  mode: 'create' | 'edit';
  formData: ProposalFormData;
  userAddress?: string;
  proposalId?: string;
}

export default function FormReview({ formData }: Props) {
  const { userAddress } = useApp();

  const formatFundsRequested = () => {
    if (!formData.fundsRequested) return 'Not specified';
    const cleanAmount = parseAdaInput(formData.fundsRequested);
    return cleanAmount ? formatAdaAmount(cleanAmount) : 'Invalid amount';
  };

  return (
    <div className="sm:px-6">
      <div className="space-y-6">
        <div className="border-border space-y-5 rounded-[10px] border border-dashed px-7 py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2.5">
              <Title level="6" className="text-foreground">
                Funds Requested
              </Title>
              <Paragraph className="text-foreground text-lg font-semibold">
                {formatFundsRequested()}
              </Paragraph>
            </div>

            <div className="space-y-2.5">
              <Title level="6" className="text-foreground">
                Receiver Wallet Address
              </Title>
              {formData.receiverWalletAddress ? (
                <Copyable
                  withKey={false}
                  link={`${getCurrentNetworkConfig().explorerUrl}/address/${formData.receiverWalletAddress}`}
                  value={formData.receiverWalletAddress}
                  keyLabel={''}
                />
              ) : (
                <Paragraph className="text-muted-foreground">
                  Not specified
                </Paragraph>
              )}
            </div>
          </div>
        </div>

        <div className="border-border space-y-5 rounded-[10px] border border-dashed px-7 py-6">
          <div className="space-y-2.5">
            <Title level="6" className="text-foreground">
              Title
            </Title>
            <Paragraph className="text-foreground">
              {formData.title || 'No title provided'}
            </Paragraph>
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
