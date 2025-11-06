'use client';

import Card from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import TopNav from '@/components/Navigation/TabNav';
import {
  ActivityPulse,
  BadgesPulse,
  RepliesPulse,
  TopicsPulse,
} from '@/components/PulseLoader';
import { useApp } from '@/context';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import { useDateFormatting } from '@/hooks/UseDateFormatting';
import { parseMemberDatum } from '@/utils';
import { getCountryByCode } from '@/utils/locationData';
import React, { useMemo, useState } from 'react';
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

  const { members } = useApp();
  const { formatDate, getRelativeTime, cleanHtml } = useDateFormatting();
  const decodedUsername = decodeURIComponent(ambassadorUsername);

  const memberData = useMemo(() => {
    const defaultData = {
      name: decodedUsername,
      username: decodedUsername,
      country: '',
      city: '',
      bio_excerpt: '',
      created_at: '',
    };

    const member = members.find((utxo) => {
      if (!utxo.plutusData) return false;
      try {
        const parsed = parseMemberDatum(utxo.plutusData);
        if (!parsed?.member?.metadata) return false;
        return (
          parsed.member.metadata.displayName?.toLowerCase() ===
          decodedUsername.toLowerCase()
        );
      } catch {
        return false;
      }
    });

    if (!member?.plutusData) return defaultData;

    try {
      const parsed = parseMemberDatum(member.plutusData);
      if (!parsed?.member?.metadata) return defaultData;

      const memberMetadata = parsed.member.metadata;
      const countryData = memberMetadata.country
        ? getCountryByCode(memberMetadata.country)
        : null;

      return {
        name:
          memberMetadata.fullName ||
          memberMetadata.displayName ||
          decodedUsername,
        username: memberMetadata.displayName || decodedUsername,
        country: countryData?.name || memberMetadata.country || '',
        city:  memberMetadata.city || '',
        bio_excerpt: memberMetadata.bio || '',
        created_at: '',
      };
    } catch {
      return defaultData;
    }
  }, [members, decodedUsername]);

  const {
    profile,
    loading: forumLoading,
    error,
  } = useAmbassadorProfile(decodedUsername);

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'badges', label: 'Badges' },
    { id: 'proposals', label: 'Proposals' },
  ];

  const displayProfile = {
    name: memberData.name,
    country: memberData.country,
    summary: {
      stats: forumLoading
        ? null
        : profile?.summary.stats || {
            topics_created: 0,
            likes_given: 0,
            likes_received: 0,
            days_visited: 0,
            replies_created: 0,
          },
    },
  };

  const hasActivities = profile?.activities && profile.activities.length > 0;
  const hasTopics = profile?.summary.top_topics && profile.summary.top_topics.length > 0;
  const hasReplies = profile?.summary.top_replies && profile.summary.top_replies.length > 0;
  const hasAnyContent = hasActivities || hasTopics || hasReplies;
  const currentTabLabel = tabs.find(tab => tab.id === activeTab)?.label || 'Content';

  return (
    <div className="bg-background min-h-screen max-w-full"
      role="main"
      aria-label={`Ambassador profile for ${memberData.name}`}>
      <ProfileHeader profile={displayProfile} isLoading={forumLoading} />

      <div className="block p-6 lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-6 " aria-label="Profile content">
        <div className="w-full lg:sticky lg:top-0 lg:z-20 lg:w-auto"
          role="complementary"
          aria-label="Ambassador information"
          >
          <ProfileSidebar
            profile={{
              name: memberData.name,
              username: memberData.username,
              country: memberData.country,
              bio_excerpt: memberData.bio_excerpt,
              created_at: memberData.created_at,
              city: memberData.city
            }}
            formatDate={formatDate}
            cleanHtml={cleanHtml}
          />
        </div>
        <div className="mt-6 flex w-full min-w-0 flex-col lg:mt-0 lg:w-auto"
          role="region"
          aria-label={`${currentTabLabel} section`}
          >
          <div className="border-border bg-background mb-4 w-full border-b lg:sticky lg:top-0 lg:z-50"
            role="navigation"
            aria-label="Profile sections"
            >
            <div className="w-full min-w-0 px-0">
              <TopNav
                tabs={tabs}
                activeTabId={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
          <div className="w-full max-w-full flex-1"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            >
            {activeTab === 'summary' && (
              <div className="w-full space-y-6 lg:space-y-8">
                {forumLoading ? (
                  <>
                    <Card>
                      <div className="space-y-4 p-4">
                        <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-4">
                          <Title level="6" className="text-neutral text-base">
                            Recent Activity
                          </Title>
                        </div>
                        <ActivityPulse />
                      </div>
                    </Card>
                    <Card>
                      <div className="space-y-4 p-4">
                        <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-4">
                          <Title level="6" className="text-neutral text-base">
                            Top Topics
                          </Title>
                        </div>
                        <TopicsPulse />
                      </div>
                    </Card>
                    <Card>
                      <div className="space-y-4 p-4">
                        <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-4">
                          <Title level="6" className="text-neutral text-base">
                            Top Replies
                          </Title>
                        </div>
                        <RepliesPulse />
                      </div>
                    </Card>
                  </>
                ) : profile && hasAnyContent ? (
                  <>
                    {hasActivities && (
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
                    )}
                    {hasTopics && (
                      <TopicsSection
                        topics={profile.summary.top_topics}
                        showAllTopics={showAllTopics}
                        onToggleShowAll={() => setShowAllTopics(!showAllTopics)}
                        formatDate={formatDate}
                      />
                    )}
                    {hasReplies && (
                      <RepliesSection
                        replies={profile.summary.top_replies}
                        showAllReplies={showAllReplies}
                        onToggleShowAll={() => setShowAllReplies(!showAllReplies)}
                        formatDate={formatDate}
                      />
                    )}
                  </>
                ) : (
                  <EmptyState message="No recent activities" />
                )}
              </div>
            )}

            {activeTab === 'badges' &&
              (forumLoading ? (
                <BadgesPulse />
              ) : profile?.badges && profile.badges.length > 0 ? (
                <BadgesSection badges={profile.badges} cleanHtml={cleanHtml} />
              ) : (
                <EmptyState message="No badges yet" />
              ))}
            
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