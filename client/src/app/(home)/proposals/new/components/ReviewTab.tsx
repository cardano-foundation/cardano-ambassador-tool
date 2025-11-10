import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import FormReview from '../../components/FormReview';

type ProposalFormData = ProposalData & {
  description: string;
};

interface Props {
  formData: ProposalFormData;
  userAddress?: string;
}

export default function ReviewTab({ formData, userAddress }: Props) {
  return (
    <FormReview
      mode="create"
      formData={formData}
      userAddress={userAddress}
    />
  );
}