import Input from '@/components/atoms/Input';
import Dropdown from '@/components/atoms/Dropdown';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextEditor from '@/components/atoms/RichTextEditor';
import { ProposalFormData } from '@/types/ProposalFormData';
import { RefObject } from 'react';

interface Props {
  mode: 'create' | 'edit';
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
  descriptionEditorRef: RefObject<any>;
 
}

export default function FormDetails({
  mode,
  formData,
  handleInputChange,
  descriptionEditorRef,
}: Props) {
  return (
    <div className="space-y-6">
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        placeholder={
          mode === 'create'
            ? 'Enter your proposal title'
            : 'Update your proposal title'
        }
      />

      {/* <div className="space-y-2">
        <Paragraph as="label" size="sm" className="text-muted-foreground">
          Proposal category
        </Paragraph>
        <Dropdown
          value={formData.category}
          onValueChange={(value) => handleInputChange('category', value)}
          options={PROPOSAL_CATEGORIES.map((cat) => ({
            label: cat,
            value: cat,
          }))}
          placeholder="Select category"
        />
      </div> */}

      <div className="space-y-2">
        <Paragraph as="label" size="sm" className="text-muted-foreground">
          Description
        </Paragraph>
        <RichTextEditor
          ref={descriptionEditorRef}
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe your proposal..."
        />
      </div>
      {/* <div className="space-y-2">
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
      </div> */}
    </div>
  );
}
