'use client';

import { useState, useRef } from 'react';
import FormDetails from '../../components/FormDetails';
import { ProposalFormData } from '@/types/ProposalFormData';

export default function DetailsTab({
  formData,
  handleInputChange,
  descriptionEditorRef,
  impactEditorRef,
  objectivesEditorRef,
  milestonesEditorRef,
  impactOnEcosystemEditorRef,
  budgetBreakdownEditorRef
}: {
  formData: ProposalFormData;
  handleInputChange: (field: keyof ProposalFormData, value: string) => void;
  descriptionEditorRef: any;
  impactEditorRef: any;
  objectivesEditorRef: any;
  milestonesEditorRef: any;
  impactOnEcosystemEditorRef: any;
  budgetBreakdownEditorRef: any;
}) {
  return (
    <FormDetails
      mode="create"
      formData={formData}
      handleInputChange={handleInputChange}
      descriptionEditorRef={descriptionEditorRef}
      impactEditorRef={impactEditorRef}
      objectivesEditorRef={objectivesEditorRef}
      milestonesEditorRef={milestonesEditorRef}
      impactOnEcosystemEditorRef={impactOnEcosystemEditorRef}
      budgetBreakdownEditorRef={budgetBreakdownEditorRef}
    />
  );
}