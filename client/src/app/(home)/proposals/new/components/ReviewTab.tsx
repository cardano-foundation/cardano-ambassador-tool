import FormReview from '../../components/FormReview';
import { ProposalFormData } from '@/types/ProposalFormData';

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