import Input from '@/components/atoms/Input';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';

interface Props {
  mode: 'create' | 'edit';
  formData: ProposalData;
  handleInputChange: (field: keyof ProposalData, value: string) => void;
  userAddress?: string;
}

export default function FormFunds({ mode, formData, handleInputChange, userAddress }: Props) {
  return (
    <div className="space-y-6">
      <Input
        label="Funds requested"
        value={formData.fundsRequested}
        onChange={(e) => handleInputChange('fundsRequested', e.target.value)}
        placeholder={mode === 'create' ? "₳5,000" : "Update funds requested"}
      />
      <Input
        label="Receiver wallet address"
        value={formData.receiverWalletAddress || ''}
        onChange={(e) => handleInputChange('receiverWalletAddress', e.target.value)}
        placeholder={mode === 'create' ? "addr1q...xyz" : "Update wallet address"}
      />
    </div>
  );
}