export interface ProposalFormData {
  id: string;
  title: string;
  description: string;
  fundsRequested: string;
  receiverWalletAddress: string;
  submittedBy?: string;
  submittedByAddress?: string;
  status?: 'active' | 'pending' | 'completed' | 'rejected';
  policyId?: string;
}