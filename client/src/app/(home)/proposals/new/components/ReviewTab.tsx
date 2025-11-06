import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import FormReview from '../../components/FormReview';
interface Props {
  formData: ProposalData;
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