import * as React from 'react';
import { use } from 'react';
import AmbassadorProfile from '@/app/(home)/_components/profile/AmbassadorProfilePage';

interface PageProps {
  params: Promise<{ username: string }>;
}


export default function AmbassadorPage({ params }: PageProps) {
  const { username } = use(params);
  return <AmbassadorProfile ambassadorUsername={username} />;
}
