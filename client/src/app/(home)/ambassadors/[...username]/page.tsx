import * as React from 'react';
import AmbassadorProfile from '@/app/(home)/_components/profile/AmbassadorProfilePage';

interface PageProps {
  params: { username: string };
}

export default function AmbassadorPage({ params }: PageProps) {
  const { username } = params;
  return <AmbassadorProfile ambassadorUsername={username} />;
}
