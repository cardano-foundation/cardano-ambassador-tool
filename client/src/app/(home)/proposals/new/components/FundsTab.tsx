import { useApp } from '@/context';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import FormFunds from '../../components/FormFunds';

type ProposalFormData = ProposalData & {
  description: string;
};

export default function FundsTab({
  formData,
  handleInputChange,
}: {
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
}) {
  const { userAddress } = useApp();
  return (
    <FormFunds
      mode="create"
      formData={formData}
      handleInputChange={handleInputChange}
      userAddress={userAddress}
    />
  );
}
