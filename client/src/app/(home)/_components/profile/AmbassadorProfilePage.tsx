'use client';

import React, { useState, useEffect } from 'react';
import Title  from '@/components/atoms/Title';
import Paragraph  from '@/components/atoms/Paragraph';
import TopNav from '@/components/Navigation/TabNav';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSidebar } from './ProfileSidebar';
import { ActivitySection } from './ActivitySection';
import { TopicsSection } from './TopicsSection';
import { RepliesSection } from './RepliesSection';
import { BadgesSection } from './Badges';
import { EmptyState } from './EmptyState';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import { useDateFormatting } from '@/hooks/UseDateFormatting';

interface AmbassadorProfilePageProps {
  ambassadorId: string;
}

const AmbassadorProfilePage: React.FC<AmbassadorProfilePageProps> = ({ ambassadorId }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const { profile, loading, error } = useAmbassadorProfile(ambassadorId);
  const { formatDate, getRelativeTime, cleanHtml } = useDateFormatting();

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'badges', label: 'Badges' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'proposals', label: 'Proposals' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading ambassador profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">Profile Not Found</Title>
          <Paragraph className="text-muted-foreground">{error || 'Ambassador profile could not be loaded.'}</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-full">
      <ProfileHeader profile={profile} />
      
      <div className="block lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 p-4 lg:p-6 lg:items-start">
  <div className="lg:sticky lg:top-20 w-full lg:w-auto">
    <ProfileSidebar 
      profile={profile}
      formatDate={formatDate}
      cleanHtml={cleanHtml}
    />
  </div>
  <div className="flex flex-col min-w-0 w-full lg:w-auto mt-6 lg:mt-0">
    <div className="border-b border-border bg-card lg:sticky lg:top-6 lg:z-10 w-full mb-4">
      <div className="px-0 w-full">
        <TopNav
          tabs={tabs}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
    <div className="flex-1 w-full max-w-full">
            {activeTab === 'summary' && (
              <div className="space-y-6 lg:space-y-8 w-full">
                <ActivitySection
                  activities={profile.activities}
                  showAllActivities={showAllActivities}
                  onToggleShowAll={() => setShowAllActivities(!showAllActivities)}
                  notificationsEnabled={notificationsEnabled}
                  onNotificationsToggle={setNotificationsEnabled}
                  getRelativeTime={getRelativeTime}
                /> 
                
               <TopicsSection
                  topics={profile.summary.top_topics}
                  showAllTopics={showAllTopics}
                  onToggleShowAll={() => setShowAllTopics(!showAllTopics)}
                  formatDate={formatDate}
                />
                
                <RepliesSection
                  replies={profile.summary.top_replies}
                  showAllReplies={showAllReplies}
                  onToggleShowAll={() => setShowAllReplies(!showAllReplies)}
                  formatDate={formatDate}
                />
              </div>
            )}

            {activeTab === 'badges' && (
              <BadgesSection badges={profile.badges} cleanHtml={cleanHtml} />
            )}

            {activeTab === 'announcements' && (
              <EmptyState message="No new notifications" />
            )}

            {activeTab === 'proposals' && (
              <EmptyState message="No proposals yet" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorProfilePage;