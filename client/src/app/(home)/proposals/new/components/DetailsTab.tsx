import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import Dropdown from '@/components/atoms/Dropdown';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextEditor from '@/components/atoms/RichTextEditor';
import { ProposalFormData } from '@/types/ProposalFormData';
import { RefObject } from 'react';

interface Props {
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
  descriptionEditorRef: RefObject<any>;
  impactEditorRef: RefObject<any>;
  objectivesEditorRef: RefObject<any>;
  milestonesEditorRef: RefObject<any>;
  impactOnEcosystemEditorRef: RefObject<any>;
  budgetBreakdownEditorRef: RefObject<any>;
}

const PROPOSAL_CATEGORIES = [
  'Education & Awareness',
  'Community Building',
  'Technical Development',
  'Marketing & Outreach',
  'Research & Analysis',
  'Infrastructure',
  'Other'
];

export default function DetailsTab({ 
  formData, 
  handleInputChange,
  descriptionEditorRef,
  impactEditorRef,
  objectivesEditorRef,
  milestonesEditorRef,
  impactOnEcosystemEditorRef,
  budgetBreakdownEditorRef
}: Props) {
  return (
    <div className="space-y-6">
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        placeholder="Cardano Podcast Series"
      />

      <div className="space-y-2">
        <Paragraph as="label" size="sm" className="text-muted-foreground">
          Proposal category
        </Paragraph>
        <Dropdown
          value={formData.category}
          onValueChange={(value) => handleInputChange('category', value)}
          options={PROPOSAL_CATEGORIES.map(cat => ({ label: cat, value: cat }))}
          placeholder="Category"
        />
      </div>
      <div className="space-y-2">
        <Paragraph as="label" size="sm" className="text-muted-foreground">
          Description
        </Paragraph>
        <RichTextEditor
          ref={descriptionEditorRef}
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="A proposal to launch a series of educational podcasts to increase Cardano awareness and adoption..."
        />
      </div>
      <div className="space-y-2">
        <Paragraph as="label" size="sm" className="text-muted-foreground">
          Objectives
        </Paragraph>
        <RichTextEditor
          ref={objectivesEditorRef} 
          value={formData.objectives}
          onChange={(value) => handleInputChange('objectives', value)}
          placeholder="• Increase awareness and understanding of the Cardano ecosystem among both new and existing users."
        />
      </div>

      <div className="space-y-2">
        <Paragraph as="label" size="sm" className="text-muted-foreground">
          Impact to eco-system
        </Paragraph>
        <RichTextEditor
          ref={impactOnEcosystemEditorRef}
          value={formData.impactToEcosystem}
          onChange={(value) => handleInputChange('impactToEcosystem', value)}
          placeholder="Describe the impact this proposal will have on the Cardano ecosystem..."
        />
      </div>

      <div className="space-y-2">
        <Paragraph as="label" size="sm" className="text-muted-foreground">
          Milestones
        </Paragraph>
        <RichTextEditor
          ref={milestonesEditorRef}
          value={formData.milestones}
          onChange={(value) => handleInputChange('milestones', value)}
          placeholder="• Increase awareness and understanding of the Cardano ecosystem among both new and existing users."
        />
      </div>

      <div className="space-y-2">
        <Paragraph as="label" size="sm" className="text-muted-foreground">
          Impact
        </Paragraph>
        <RichTextEditor
          ref={impactEditorRef}
          value={formData.impact}
          onChange={(value) => handleInputChange('impact', value)}
          placeholder="• Increase awareness and understanding of the Cardano ecosystem among both new and existing users."
        />
      </div>
      <div className="space-y-2">
        <Paragraph as="label" size="sm" className="text-muted-foreground">
          Budget Breakdown
        </Paragraph>
        <RichTextEditor
          ref={budgetBreakdownEditorRef}
          value={formData.budgetBreakdown}
          onChange={(value) => handleInputChange('budgetBreakdown', value)}
          placeholder="• Increase awareness and understanding of the Cardano ecosystem among both new and existing users."
        />
      </div>
    </div>
  );
}