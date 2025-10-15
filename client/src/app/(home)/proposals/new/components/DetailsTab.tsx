'use client';

import { ProposalData } from '@sidan-lab/cardano-ambassador-tool';
import FormDetails from '../../components/FormDetails';

export default function DetailsTab({
  formData,
  handleInputChange,
  descriptionEditorRef,
}: {
  formData: ProposalData;
  handleInputChange: (field: keyof ProposalData, value: string) => void;
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
