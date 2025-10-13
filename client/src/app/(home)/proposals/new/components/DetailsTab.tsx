'use client';

import { useState, useRef } from 'react';
import FormDetails from '../../components/FormDetails';
import { ProposalFormData } from '@/types/ProposalFormData';

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