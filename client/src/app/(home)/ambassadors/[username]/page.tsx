import AmbassadorProfile from '@/app/(home)/_components/profile/AmbassadorProfilePage';
import { use } from 'react';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function AmbassadorPage({ params }: PageProps) {
  const { username } = use(params);
  return <AmbassadorProfile ambassadorUsername={username} />;
}
