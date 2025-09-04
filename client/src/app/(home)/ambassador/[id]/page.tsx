'use client';
import AmbassadorProfilePage from '@/app/(home)/_components/AmbassadorProfilePage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AmbassadorPage({ params }: PageProps) {
  const { id } = await params;
  return <AmbassadorProfilePage ambassadorId={id} />;
}