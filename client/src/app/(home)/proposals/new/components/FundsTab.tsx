import Input from '@/components/atoms/Input';
import SearchableDropdown from '@/components/atoms/SearchableDropdown';
import { ProposalFormData } from '@/types/ProposalFormData';

interface Props {
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
  userAddress?: string;
}
const ADDRESS_OPTIONS = [
  { value: 'addr1qxy2r3s4t5u6v7w8x9y0z', label: 'addr1qxy2r3s4t5u6v7w8x9y0z' },
  { value: 'addr1abc2d3e4f5g6h7i8j9k0l', label: 'addr1abc2d3e4f5g6h7i8j9k0l' },
  { value: 'addr1def2g3h4i5j6k7l8m9n0o', label: 'addr1def2g3h4i5j6k7l8m9n0o' }
];

export default function FundsTab({ formData, handleInputChange, userAddress }: Props) {
  return (
    <div className="space-y-6">
      <Input
        label="Funds requested"
        value={formData.fundsRequested}
        onChange={(e) => handleInputChange('fundsRequested', e.target.value)}
        placeholder="₳5,000"
      />

      <SearchableDropdown
        options={ADDRESS_OPTIONS}
        value={formData.receiverWalletAddress}
        onValueChange={(value) => handleInputChange('receiverWalletAddress', value)}
        placeholder="address"
        searchPlaceholder="Search addresses..."
      />
    </div>
  );
}