import Input from '@/components/atoms/Input';
import Paragraph from '@/components/atoms/Paragraph';
import RichTextEditor from '@/components/atoms/RichTextEditor';
import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import { RefObject } from 'react';

type ProposalFormData = ProposalData & {
  description: string;
};

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
    </div>
  );
}
