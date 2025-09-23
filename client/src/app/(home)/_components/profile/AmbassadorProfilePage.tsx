'use client';

import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
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
  ambassadorUsername: string;
}

const AmbassadorProfilePage: React.FC<AmbassadorProfilePageProps> = ({
  ambassadorUsername,
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const { profile, loading, error } = useAmbassadorProfile(ambassadorUsername);
  const { formatDate, getRelativeTime, cleanHtml } = useDateFormatting();

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'badges', label: 'Badges' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'proposals', label: 'Proposals' },
  ];

  if (loading) {
      return <SimpleCardanoLoader />;
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
      
      <div className="block lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 p-4 lg:p-6 lg:items-start">
          <div className="lg:sticky lg:z-20 lg:top-0 w-full lg:w-auto">
            <ProfileSidebar 
              profile={profile}
              formatDate={formatDate}
              cleanHtml={cleanHtml}
            />
        </div>
        <div className="flex flex-col min-w-0 w-full lg:w-auto mt-6 lg:mt-0">
                <div className="border-b border-border lg:sticky lg:top-0 lg:z-50 w-full mb-4 bg-background">
                    <div className="px-0 w-full min-w-0">
                        <TopNav
                          tabs={tabs}
                          activeTabId={activeTab}
                          onTabChange={setActiveTab}
                        />
                  </div>
                </div>

          <div className="flex-1 w-full max-w-full">
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