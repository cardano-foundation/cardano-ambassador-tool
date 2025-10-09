'use client';

import Button from '@/components/atoms/Button';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import AdminMembershipTimeline from '@/components/Timelines/AdminMembershipTimeline';
import { useApp } from '@/context/AppContext';
import { Utxo } from '@types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{ txHash: string[] }>;
}

const MembershipIntentPage = ({ params }: PageProps) => {
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [membershipUtxo, setMembershipUtxo] = useState<Utxo | null>(null);
  const { membershipIntents, dbLoading } = useApp();

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setTxHash(resolvedParams.txHash[0]);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!txHash || dbLoading) {
      return;
    }

    if (!membershipIntents.length) {
      setError('No membership intents found');
      setLoading(false);
      return;
    }

    const foundIntent = membershipIntents.find(
      (intent) => intent.txHash === txHash,
    );

    if (!foundIntent) {
      setError('Membership intent not found');
      setLoading(false);
      return;
    }

    setMembershipUtxo(foundIntent);

    setLoading(false);
  }, [txHash, membershipIntents, dbLoading]);

  if (loading || dbLoading) {
    return <SimpleCardanoLoader />;
  }

  if (error || !txHash || !membershipUtxo) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Membership Intent Not Found
          </Title>
          <Link href="/manage/memberships">
            <Button variant="primary">Back to Memberships</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-2 pb-8 sm:px-6">
      <AdminMembershipTimeline intentUtxo={membershipUtxo} />
    </div>
  );
};

export default MembershipIntentPage;
