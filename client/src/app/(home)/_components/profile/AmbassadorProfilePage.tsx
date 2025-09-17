'use client';

import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import TopNav from '@/components/Navigation/TabNav';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import { useDateFormatting } from '@/hooks/UseDateFormatting';
import React, { useState } from 'react';
import { ActivitySection } from './ActivitySection';
import { BadgesSection } from './Badges';
import { EmptyState } from './EmptyState';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSidebar } from './ProfileSidebar';
import { RepliesSection } from './RepliesSection';
import { TopicsSection } from './TopicsSection';

interface AmbassadorProfilePageProps {
  ambassadorId: string;
}

const AmbassadorProfilePage: React.FC<AmbassadorProfilePageProps> = ({
  ambassadorId,
}) => {
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
    { id: 'proposals', label: 'Proposals' },
  ];

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">
          Loading ambassador profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Title level="3" className="text-foreground mb-2">
            Profile Not Found
          </Title>
          <Paragraph className="text-muted-foreground">
            {error || 'Ambassador profile could not be loaded.'}
          </Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen max-w-full">
      <ProfileHeader profile={profile} />

      <div className="block p-4 lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-6 lg:p-6">
        <div className="w-full lg:sticky lg:top-20 lg:w-auto">
          <ProfileSidebar
            profile={profile}
            formatDate={formatDate}
            cleanHtml={cleanHtml}
          />
        </div>
        <div className="mt-6 flex w-full min-w-0 flex-col lg:mt-0 lg:w-auto">
          <div className="border-border bg-card mb-4 w-full border-b lg:sticky lg:top-6 lg:z-10">
            <div className="w-full min-w-0 px-0">
              <TopNav
                tabs={tabs}
                activeTabId={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
          <div className="w-full max-w-full flex-1">
            {activeTab === 'summary' && (
              <div className="w-full space-y-6 lg:space-y-8">
                <ActivitySection
                  activities={profile.activities}
                  showAllActivities={showAllActivities}
                  onToggleShowAll={() =>
                    setShowAllActivities(!showAllActivities)
                  }
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
