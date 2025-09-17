'use client';
import * as React from 'react';
import AmbassadorProfile from '@/app/(home)/_components/profile/AmbassadorProfilePage';

export default function AmbassadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params); 
  return <AmbassadorProfile ambassadorId={id} />;
}
