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
