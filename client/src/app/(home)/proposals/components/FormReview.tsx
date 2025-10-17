import RichTextDisplay from '@/components/atoms/RichTextDisplay';
import Title from '@/components/atoms/Title';
import { useApp } from '@/context';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';

interface Props {
  mode: 'create' | 'edit';
  formData: ProposalData;
  userAddress?: string;
  proposalId?: string;
}

export default function FormReview({ formData }: Props) {
  const { userAddress } = useApp();

  return (
    <div className="sm:px-6">
      <div className="space-y-6">
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
