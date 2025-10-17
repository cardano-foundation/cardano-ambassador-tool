'use client';

import TopNav from '@/components/Navigation/TabNav';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import { useApp } from '@/context';
import { useState } from 'react';
import ProposalSubmissionsTab from '../_component/proposals/ProposalSubmissionsTab';
import MembershipSubmissionsTab from '../_component/membership/MembershipSubmissionsTab';
export default function IntentSubmissionsPage() {
  const tabs = [
    { id: 'membership-intent', label: 'Membership Intent' },
    { id: 'proposal-intent', label: 'Proposal Intent' },
  ];

  const [activeTab, setActiveTab] = useState('membership-intent');
  const { dbLoading, isAuthenticated } = useApp();

  if (dbLoading || !isAuthenticated) {
    return <SimpleCardanoLoader />;
  }

  return (
    <div className="space-y-4 px-4 py-2 pb-8 sm:space-y-6 sm:px-6">
      <div className="border-border bg-card border-b">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <TopNav
              tabs={tabs}
              activeTabId={activeTab}
              onTabChange={setActiveTab}
              className="w-1/2"
            />
          </div>
        </div>
      </div>

      {activeTab === 'membership-intent' && <MembershipSubmissionsTab />}
      {activeTab === 'proposal-intent' && <ProposalSubmissionsTab />}
    </div>
  );
}
