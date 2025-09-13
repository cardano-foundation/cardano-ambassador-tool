'use client';
import AmbassadorProfile from '@/app/(home)/_components/AmbassadorProfilePage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AmbassadorPage({ params }: PageProps) {
  const { id } = await params;
  return <AmbassadorProfile ambassadorId={id} />;
}