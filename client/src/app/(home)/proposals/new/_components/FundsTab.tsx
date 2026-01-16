import { useWalletManager } from '@/hooks';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import FormFunds from '../../_components/FormFunds';

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
  const { address: userAddress } = useWalletManager();
  return (
    <FormFunds
      mode="create"
      formData={formData}
      handleInputChange={handleInputChange}
      userAddress={userAddress ?? undefined}
    />
  );
}
