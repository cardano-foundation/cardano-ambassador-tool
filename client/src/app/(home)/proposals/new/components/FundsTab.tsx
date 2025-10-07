import Input from '@/components/atoms/Input';
import { ProposalFormData } from '@/types/ProposalFormData';

interface Props {
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
  userAddress?: string;
}

export default function FundsTab({ formData, handleInputChange, userAddress }: Props) {
  return (
    <div className="space-y-6">
      <Input
        label="Funds requested"
        value={formData.fundsRequested}
        onChange={(e) => handleInputChange('fundsRequested', e.target.value)}
        placeholder="₳5,000"
      />
      <Input
        label="Addresses"
        value={formData.receiverWalletAddress ||''}
        onChange={(e) => handleInputChange('receiverWalletAddress', e.target.value)}
        placeholder="addr1q...xyz"
      />
    </div>
  );
}