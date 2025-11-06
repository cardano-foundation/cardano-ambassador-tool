import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import FormFunds from '../../components/FormFunds';

interface Props {
  formData: ProposalData;
  handleInputChange: (field: keyof ProposalData, value: string) => void;
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