'use client'


import TopNav from '@/components/Navigation/TabNav';
import { useState } from 'react';

export default function SubmissionsPage() {
  const tabs = [
    { id: 'membership', label: 'Membership Intent' },
    { id: 'proposals', label: 'Proposal' },
  ];
  const [activeTab, setActiveTab] = useState('membership');

  return (
    <div className="px-6">
      <TopNav
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />
    </div>
  );
}
