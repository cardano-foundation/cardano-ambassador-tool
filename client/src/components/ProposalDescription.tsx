'use client';

import RichTextDisplay from '@/components/atoms/RichTextDisplay';

interface ProposalDescriptionProps {
  content: string;
  className?: string;
}

export default function ProposalDescription({
  content,
  className = '',
}: ProposalDescriptionProps) {

  return <RichTextDisplay content={content} className={className} />;
}
