'use client';
import AmbassadorProfile from '@/app/(home)/_components/AmbassadorProfilePage';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function AmbassadorPage({ params }: PageProps) {
  const { username } = await params;
  return <AmbassadorProfile ambassadorUsername={username} />;
}