import FormFunds from '../../components/FormFunds';
import { ProposalFormData } from '@/types/ProposalFormData';

interface Props {
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
  userAddress?: string;
}

export default function FundsTab({ formData, handleInputChange, userAddress }: Props) {
  return (
    <FormFunds
      mode="create"
      formData={formData}
      handleInputChange={handleInputChange}
      userAddress={userAddress}
    />
  );
}