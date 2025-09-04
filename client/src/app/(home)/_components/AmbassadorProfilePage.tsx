'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/atoms/Button';
import Title from '@/components/atoms/Title';
import Card, { CardContent } from '@/components/atoms/Card';
import TopNav from '@/components/Navigation/TabNav';
import { getCountryFlag } from '@/utils/countryFlags';
import UserAvatar from '@/components/atoms/UserAvatar';
import GithubIcon from '@/components/atoms/GithubIcon';
import EditIcon from '@/components/atoms/EditIcon';
import LinkedInIcon from '@/components/atoms/LinkedinIcon';
import XIcon from '@/components/atoms/XIcon';
import Progress, { ProgressStep } from '@/components/atoms/Progress';
import Switch from '@/components/atoms/Switch';
import Paragraph from '@/components/atoms/Paragraph';
import TextLink from '@/components/atoms/TextLink';
import NoNotificationsIcon from '@/components/atoms/NoNotificationsIcon';
import BadgeIcon from '@/components/atoms/BadgeIcon';
import { CardanoIcon } from '@/components/atoms/CardanoIcon';
import MapsIcon from '@/components/atoms/MapsIcon';

interface AmbassadorProfile {
  href: string;
  username: string;
  name: string;
  bio_excerpt: string;
  country: string;
  flag: string;
  avatar: string;
  created_at: string;
  summary: {
    stats: {
      topics_entered: number;
      posts_read_count: number;
      days_visited: number;
      likes_given: number;
      likes_received: number;
      topics_created: number;
      replies_created: number;
      time_read: number;
      recent_time_read: number;
    };
    top_replies: Array<{
      title: string;
      url: string;
      like_count: number;
      created_at: string;
    }>;
    top_topics: Array<{
      title: string;
      url: string;
      reply_count: number;
      like_count: number;
      created_at: string;
    }>;
  };
  activities: Array<{
    type: 'topic' | 'reply';
    title: string;
    url: string;
    created_at: string;
  }>;
  badges: Array<{
    name: string;
    description: string;
    icon: string;
    granted_at: string;
  }>;
}

interface AmbassadorProfilePageProps {
  ambassadorId: string;
}

const AmbassadorProfilePage: React.FC<AmbassadorProfilePageProps> = ({ ambassadorId }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Add states for expanded sections
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    const fetchAmbassadorProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching profile for:', ambassadorId);
        const response = await fetch(`/api/ambassadors/${ambassadorId}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Failed to fetch ambassador profile: ${response.status} - ${errorText}`);
        }
        
        const data: AmbassadorProfile = await response.json();
        console.log('Profile data loaded:', data.name);
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (ambassadorId) {
      fetchAmbassadorProfile();
    }
  }, [ambassadorId]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `Today, ${formatTime(date)}`;
    }
    
    if (isYesterday) {
      return `Yesterday, ${formatTime(date)}`;
    }
    
    if (diffInDays < 7) {
      return `${diffInDays} days ago, ${formatTime(date)}`;
    }
    
    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  const cleanHtml = (html: string | null | undefined): string => {
    return html?.replace(/<[^>]*>/g, '') ?? '';
  };

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'badges', label: 'Badges' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'proposals', label: 'Proposals' }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const StatCard = ({ label, value, showHeart = false }: { 
    label: string; 
    value: number; 
    showHeart?: boolean;
  }) => (
    <div className="text-center border-2 border-dotted border-border/60 p-4 rounded-lg w-32 h-20 flex flex-col justify-center">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
        {showHeart && <span className="text-base text-primary-base">❤</span>}
        {label}
      </div>
    </div>
  );

  const BadgeCard = ({ badge }: { badge: AmbassadorProfile['badges'][0] }) => (
    <Card className="p-4">
      <CardContent>
        <div className="flex items-start space-x-4">
          <BadgeIcon className="flex-shrink-0" />
          <div className="flex-1">
            <Title level="6" className="mb-2 text-neutral">{badge.name}</Title>
            <Paragraph className="text-sm text-muted-foreground">
              {cleanHtml(badge.description)}
            </Paragraph>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TopicItem = ({ topic }: { topic: AmbassadorProfile['summary']['top_topics'][0] }) => (
    <div className="flex items-start justify-between py-3 border-b border-border/60 last:border-b-0">
      <div className="flex-1">
        <Link href={topic.url} target="_blank" rel="noopener noreferrer">
          <Paragraph className="text-sm font-medium text-foreground mb-1 hover:text-primary-base transition-colors cursor-pointer">
            {topic.title}
          </Paragraph>
        </Link>
        <div className="flex items-center space-x-2">
          <Paragraph className="text-xs text-muted-foreground">{formatDate(topic.created_at)}</Paragraph>
          <span className="text-sm text-primary-base">❤</span>
          <span className="text-sm text-muted-foreground">{topic.like_count}</span>
        </div>
      </div>
    </div>
  );

  const ReplyItem = ({ reply }: { reply: AmbassadorProfile['summary']['top_replies'][0] }) => (
    <div className="flex items-start space-x-3 py-2 border-l-2 border-primary-base pl-3">
      <div className="flex-1 pt-3">
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-primary-base">❤</span>
            <span className="text-xs text-muted-foreground">{reply.like_count}</span>
          </div>
        </div>
        <Link href={reply.url} target="_blank" rel="noopener noreferrer">
          <Paragraph className="text-sm font-medium text-foreground hover:text-primary-base transition-colors cursor-pointer">
            {reply.title}
          </Paragraph>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6 flex-1">
              <div className="relative flex-shrink-0">
                <UserAvatar 
                  size="size-30" 
                  name={profile.name} 
                />
                <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-6 h-6 sm:w-9 sm:h-9 p-[2px] sm:p-[3px] bg-white rounded-xl sm:rounded-2xl border-2 sm:border-[3px] border-white flex items-center justify-center z-10">
                  <div className="text-primary-base">
                    <CardanoIcon size={16} className="sm:w-5 sm:h-5" color="currentColor" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-start w-full">
                <div className="flex-shrink-0">
                  <Title level="5" className="text-neutral text-2xl">{profile.name}</Title>
                  <Paragraph className="text-muted-foreground">Ambassador</Paragraph>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-base rounded-full">
                      {getCountryFlag(profile.country)}
                    </span>
                    <span className="text-sm text-muted-foreground">{profile.country}</span>
                  </div>
                </div>
                <div className="flex justify-center space-x-4 mx-8">
                  <StatCard label="Topics Created" value={profile.summary.stats.topics_created} />
                  <StatCard label="Given" value={profile.summary.stats.likes_given} showHeart={true} />
                  <StatCard label="Received" value={profile.summary.stats.likes_received} showHeart={true} />
                  <StatCard label="Days Visited" value={profile.summary.stats.days_visited} />
                  <StatCard label="Posts Created" value={profile.summary.stats.replies_created} />
                </div>
                <div className="flex-shrink-0">
                  <Button variant="primary" size="md" className="bg-primary-base hover:bg-primary-400">
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex p-6 ">
        <div className="w-80 flex-shrink-0 p-2 space-y-6">
          <Card>
            <CardContent>
                <div className="flex items-center border-b border-border/60 justify-between pb-2 mb-4">
                <Title level="6" className="text-neutral text-lg">About</Title>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <EditIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </div>
              </div>
              <Paragraph className="text-foreground text-sm font-normal leading-snug mb-6 break-words overflow-wrap-anywhere">
                {cleanHtml(profile.bio_excerpt)}
              </Paragraph>
              
              <div className="space-y-3 text-sm">
                <div><span className="font-semibold text-neutral">Country:</span> <span className="text-muted-foreground">{profile.country}</span></div>
                <div><span className="font-semibold text-neutral">Username:</span> <span className="text-muted-foreground">{profile.username}</span></div>
                <div><span className="font-semibold text-neutral">Phone:</span> <span className="text-muted-foreground">{formatDate(profile.created_at)}</span></div>
                <div><span className="font-semibold text-neutral">Role:</span> <span className="text-muted-foreground"></span></div>
                <div><span className="font-semibold text-neutral">Website:</span> <span className="text-muted-foreground"></span></div>
                <div><span className="font-semibold text-neutral">Languages:</span> <span className="text-muted-foreground"></span></div>
              </div>
              <div className="mt-6 rounded-lg flex flex-col items-center justify-center bg-muted/20 border border-border/40">
                <MapsIcon size={50} color="var(--color-muted-foreground)" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2">
              <Title level="6" className="text-neutral text-lg mb-4">Network</Title>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <LinkedInIcon  size={15} />
                  <span className="text-neutral ">{profile.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <XIcon size={15} />
                  <span className="text-neutral ">{profile.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GithubIcon size={15}/>
                  <span className="text-neutral ">{profile.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Paragraph className="text-base text-muted-foreground mt-4">
            Member Since: {formatDate(profile.created_at)}
          </Paragraph>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border bg-card">
            <div className="px-6">
              <TopNav
                tabs={tabs}
                activeTabId={activeTab}
                onTabChange={handleTabChange}
              />
            </div>
          </div>
          <div className="p-6 flex-1">
            {activeTab === 'summary' && (
              <div className="space-y-8">
                <Card>
                  <CardContent className="p-2 border-b border-border/60">
                    <div className="flex items-center justify-between border-b border-border/60 pb-4">
                      <Title level="6" className="text-neutral text-lg">Recent Activities</Title>
                      <div className="flex items-center gap-3">
                        <Paragraph size="sm" className="text-muted-foreground">Enable Notifications:</Paragraph>
                        <Paragraph size="sm" className="text-muted-foreground">{notificationsEnabled ? 'On' : 'Off'}</Paragraph>
                        <Switch 
                          checked={notificationsEnabled}
                          onCheckedChange={setNotificationsEnabled}
                        />
                      </div>
                    </div>
                    <Progress
                      steps={(showAllActivities ? profile.activities : profile.activities.slice(0, 5)).map((activity, index) => ({
                        id: `activity-${index}`,
                        title: (
                          <Link href={activity.url} target="_blank" rel="noopener noreferrer" className="inline">
                            <span className="hover:text-primary-base transition-colors cursor-pointer">
                              {activity.title}
                            </span>
                          </Link>
                        ),
                        description: getRelativeTime(activity.created_at),
                        status: 'pending' as const
                      }))}
                    />
                    {profile.activities.length > 5 && (
                      <div className="mt-4 text-center">
                        <TextLink 
                          href="#" 
                          variant="dotted" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowAllActivities(!showAllActivities);
                          }}
                        >
                          {showAllActivities ? 'Show Less' : `View All `}
                        </TextLink>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-4">
                      <Title level="6" className="text-neutral text-lg">Top Topics</Title>
                      {profile.summary.top_topics.length > 5 && (
                        <TextLink 
                          href="#" 
                          variant="dotted" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowAllTopics(!showAllTopics);
                          }}
                        >
                          {showAllTopics ? 'Show Less' : `View All `}
                        </TextLink>
                      )}
                    </div>
                    <div className="space-y-1">
                      {(showAllTopics ? profile.summary.top_topics : profile.summary.top_topics.slice(0, 5)).map((topic, index) => (
                        <TopicItem key={index} topic={topic} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-4">
                      <Title level="6" className="text-neutral text-lg">Top Replies</Title>
                      {profile.summary.top_replies.length > 5 && (
                        <TextLink 
                          href="#" 
                          variant="dotted" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowAllReplies(!showAllReplies);
                          }}
                        >
                          {showAllReplies ? 'Show Less' : `View All `}
                        </TextLink>
                      )}
                    </div>
                    <div className="space-y-3">
                      {(showAllReplies ? profile.summary.top_replies : profile.summary.top_replies.slice(0, 5)).map((reply, index) => (
                        <ReplyItem key={index} reply={reply} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.badges.map((badge, index) => (
                  <BadgeCard key={index} badge={badge} />
                ))}
              </div>
            )}

            {activeTab === 'announcements' && (
               <div className="flex flex-col items-center justify-center py-24">
                <NoNotificationsIcon className="mb-6" />
                <Paragraph size="sm" className="text-muted-foreground">No new notifications</Paragraph>
              </div>
            )}

            {activeTab === 'proposals' && (
              <div className="text-center py-12">
                <Paragraph size="sm" className="text-muted-foreground">No proposals yet</Paragraph>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorProfilePage;