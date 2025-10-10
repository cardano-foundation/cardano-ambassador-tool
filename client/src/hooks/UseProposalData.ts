export interface ProposalData {
  id: string;
  title: string;
  category: string;
  description: string;
  impact: string;
  impactToEcosystem: string;
  objectives: string;
  milestones: string;
  budgetBreakdown: string;
  fundsRequested: string;
  receiverWalletAddress: string;
  submittedBy?: string;
  submittedByAddress?: string;
  status?: 'active' | 'pending' | 'completed' | 'rejected';
  policyId?: string;
}

export const mockProposal: ProposalData = {
  id: "proposal-001",
  title: "Cardano Education Podcast",
  category: "Education",
  description: `A proposal to launch a series of **educational podcasts** 
to increase Cardano awareness and adoption. 
Each episode will feature _industry experts_ and community members.`,
impactToEcosystem: `A proposal to launch a series of **educational podcasts** 
to increase Cardano awareness and adoption. 
Each episode will feature _industry experts_ and community members.
A proposal to launch a series of **educational podcasts** 
to increase Cardano awareness and adoption. 
Each episode will feature _industry experts_ and community members.`,
  objectives: `- Educate the Cardano community  
- Highlight developer projects  
- Encourage ecosystem collaboration`,
  milestones: `1. Launch first episode  
2. Publish bi-weekly schedule  
3. Measure community engagement`,
  impact: `This proposal will help *onboard new users and strengthen 
community understanding of Cardano’s mission*.`,
  budgetBreakdown: `1. Launch first episode : 3000 ADA  
2. Publish bi-weekly schedule : 3000 ADA  
3. Measure community engagement : 3000 ADA `,
fundsRequested: "107,800 ADA",
  receiverWalletAddress: "addr1qxyz123abc456def789ghi012jkl345mno678pqr901stu234vwx567yza890",
  submittedBy: "Cardano Education Foundation",
  submittedByAddress: "addr1qdef789ghi012jkl345mno678pqr901stu234vwx567yza890bcd123efg456",
  status: "pending",
  policyId: "policy1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
};