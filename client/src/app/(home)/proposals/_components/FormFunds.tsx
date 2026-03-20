import Input from "../../../../components/atoms/Input";
import { useWalletManager } from "../../../../hooks";
import { ProposalData } from "@sidan-lab/cardano-ambassador-tool";

type ProposalFormData = ProposalData & {
  description: string;
};

interface Props {
  mode: "create" | "edit";
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
  userAddress?: string;
}

export default function FormFunds({
  mode,
  formData,
  handleInputChange,
  userAddress,
}: Props) {
  const { address: connectedAddress } = useWalletManager();

  const handleAdaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("fundsRequested", e.target.value);
  };

  const handleUseConnectedWallet = () => {
    if (connectedAddress) {
      handleInputChange("receiverWalletAddress", connectedAddress);
    }
  };

  return (
    <div className="space-y-6">
      <Input
        label="Funds requested (ADA)"
        value={formData.fundsRequested || ""}
        onChange={handleAdaInputChange}
        placeholder={mode === "create" ? "₳5000" : "Update funds requested"}
        type="text"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-foreground text-sm font-medium">
            Receiver wallet address
          </label>
          {connectedAddress && (
            <span
              onClick={handleUseConnectedWallet}
              className="text-primary-base text-xs font-medium underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:cursor-pointer"
            >
              Use Connected Wallet
            </span>
          )}
        </div>
        <Input
          value={formData.receiverWalletAddress || ""}
          onChange={(e) =>
            handleInputChange("receiverWalletAddress", e.target.value)
          }
          placeholder={
            mode === "create" ? "addr1q...xyz" : "Update wallet address"
          }
        />
        {connectedAddress && (
          <div className="text-muted-foreground text-xs">
            Connected: {connectedAddress.slice(0, 12)}...
            {connectedAddress.slice(-8)}
          </div>
        )}
      </div>
    </div>
  );
}
