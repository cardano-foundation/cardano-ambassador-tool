import TextArea from '@/components/atoms/TextArea';
import { ProposalFormData } from '@/types/ProposalFormData';

interface Props {
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
}

export default function FundsTab({ formData, handleInputChange }: Props) {
  return (
    <div className="space-y-6">
      <TextArea
        label="Milestones"
        value={formData.milestones}
        onChange={(e) => handleInputChange('milestones', e.target.value)}
        placeholder="• Q1: Conduct 5 regional workshops
• Q2: Publish online education toolkit
• Q3: Reach 10,000 citizens"
        rows={6}
      />

      <TextArea
        label="Impact"
        value={formData.impact}
        onChange={(e) => handleInputChange('impact', e.target.value)}
        placeholder="Expected to boost voter turnout by 20% in underserved areas and significantly increase understanding of decentralized decision-making."
        rows={4}
      />

      <TextArea
        label="Budget Breakdown"
        value={formData.budgetBreakdown}
        onChange={(e) => handleInputChange('budgetBreakdown', e.target.value)}
        placeholder="• Equipment & Setup: 1,000 ADA
• Branding & Design: 500 ADA
• Episode Production: 2,000 ADA
• Marketing & Distribution: 1,000 ADA
• Miscellaneous/Admin: 500 ADA"
        rows={6}
      />
    </div>
  );
}