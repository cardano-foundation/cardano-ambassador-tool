'use client';

import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import FormDetails from '../../components/FormDetails';

type ProposalFormData = ProposalData & {
  description: string;
};

export default function DetailsTab({
  formData,
  handleInputChange,
  descriptionEditorRef,
}: {
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
  descriptionEditorRef: any;
}) {
  return (
    <FormDetails
      mode="create"
      formData={formData}
      handleInputChange={handleInputChange}
      descriptionEditorRef={descriptionEditorRef}

    />
  );
}
