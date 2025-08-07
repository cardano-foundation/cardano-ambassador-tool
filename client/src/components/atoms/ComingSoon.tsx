'use client';

import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';

interface ComingSoonProps {
  title?: string;
}

export default function ComingSoon({ title = 'Feature' }: ComingSoonProps) {
  return (
    <div className="flex min-h-full items-center justify-center p-8">
      <div className="rounded-lg p-12 text-center">
        <Title className="text-nowrap" level="2">
          Coming Soon
        </Title>
        <Paragraph size="base">This feature is under development.</Paragraph>
      </div>
    </div>
  );
}
