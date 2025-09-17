// 'use client';

// import BadgeIcon from '@/components/atoms/BadgeIcon';
// import Button from '@/components/atoms/Button';
// import Card, { CardContent } from '@/components/atoms/Card';
// import { CardanoIcon } from '@/components/atoms/CardanoIcon';
// import EditIcon from '@/components/atoms/EditIcon';
// import GithubIcon from '@/components/atoms/GithubIcon';
// import LinkedInIcon from '@/components/atoms/LinkedinIcon';
// import MapsIcon from '@/components/atoms/MapsIcon';
// import NoNotificationsIcon from '@/components/atoms/NoNotificationsIcon';
// import Paragraph from '@/components/atoms/Paragraph';
// import Progress from '@/components/atoms/Progress';
// import Switch from '@/components/atoms/Switch';
// import TextLink from '@/components/atoms/TextLink';
// import Title from '@/components/atoms/Title';
// import UserAvatar from '@/components/atoms/UserAvatar';
// import XIcon from '@/components/atoms/XIcon';
// import TopNav from '@/components/Navigation/TabNav';
// import { getCountryFlag } from '@/utils/countryFlags';
// import Link from 'next/link';
// import React, { useEffect, useState } from 'react';

// interface AmbassadorProfile {
//   href: string;
//   username: string;
//   name: string;
//   bio_excerpt: string;
//   country: string;
//   flag: string;
//   avatar: string;
//   created_at: string;
//   summary: {
//     stats: {
//       topics_entered: number;
//       posts_read_count: number;
//       days_visited: number;
//       likes_given: number;
//       likes_received: number;
//       topics_created: number;
//       replies_created: number;
//       time_read: number;
//       recent_time_read: number;
//     };
//     top_replies: Array<{
//       title: string;
//       url: string;
//       like_count: number;
//       created_at: string;
//     }>;
//     top_topics: Array<{
//       title: string;
//       url: string;
//       reply_count: number;
//       like_count: number;
//       created_at: string;
//     }>;
//   };
//   activities: Array<{
//     type: 'topic' | 'reply';
//     title: string;
//     url: string;
//     created_at: string;
//   }>;
//   badges: Array<{
//     name: string;
//     description: string;
//     icon: string;
//     granted_at: string;
//   }>;
// }

// interface AmbassadorProfileProps {
//   ambassadorId: string;
// }

// const AmbassadorProfile: React.FC<AmbassadorProfileProps> = ({
//   ambassadorId,
// }) => {
//   const [activeTab, setActiveTab] = useState('summary');
//   const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);

//   // Add states for expanded sections
//   const [showAllTopics, setShowAllTopics] = useState(false);
//   const [showAllReplies, setShowAllReplies] = useState(false);
//   const [showAllActivities, setShowAllActivities] = useState(false);



//   useEffect(() => {
//     const fetchAmbassadorProfile = async () => {
//       try {
//         setLoading(true);
//         console.log('Fetching profile for:', ambassadorId);
//         const response = await fetch(`/api/member/${ambassadorId}`);
//         console.log('Response status:', response.status);

//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error('API Error:', errorText);
//           throw new Error(
//             `Failed to fetch ambassador profile: ${response.status} - ${errorText}`,
//           );
//         }

//         const data: AmbassadorProfile = await response.json();
//         console.log('Profile data loaded:', data.name);
//         setProfile(data);
//         setError(null);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError(err instanceof Error ? err.message : 'An error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (ambassadorId) {
//       fetchAmbassadorProfile();
//     }
//   }, [ambassadorId]);

//   if (loading) {
//     return (
//       <div className="bg-background flex min-h-screen items-center justify-center">
//         <div className="text-muted-foreground">
//           Loading ambassador profile...
//         </div>
//       </div>
//     );
//   }

//   if (error || !profile) {
//     return (
//       <div className="bg-background flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           <Title level="3" className="text-foreground mb-2">
//             Profile Not Found
//           </Title>
//           <Paragraph className="text-muted-foreground">
//             {error || 'Ambassador profile could not be loaded.'}
//           </Paragraph>
//         </div>
//       </div>
//     );
//   }

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year:
//         date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
//     });
//   };

//   const getRelativeTime = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInMs = now.getTime() - date.getTime();
//     const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
//     const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
//     const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
//     const diffInWeeks = Math.floor(diffInDays / 7);
//     const diffInMonths = Math.floor(diffInDays / 30);
//     const diffInYears = Math.floor(diffInDays / 365);

//     const formatTime = (date: Date) => {
//       return date.toLocaleTimeString('en-US', {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: true,
//       });
//     };

//     if (diffInMinutes < 60) {
//       return `${diffInMinutes} minutes ago`;
//     }

//     if (diffInHours < 24) {
//       return `${diffInHours} hours ago`;
//     }

//     const isToday = date.toDateString() === now.toDateString();
//     const yesterday = new Date(now);
//     yesterday.setDate(yesterday.getDate() - 1);
//     const isYesterday = date.toDateString() === yesterday.toDateString();

//     if (isToday) {
//       return `Today, ${formatTime(date)}`;
//     }

//     if (isYesterday) {
//       return `Yesterday, ${formatTime(date)}`;
//     }

//     if (diffInDays < 7) {
//       return `${diffInDays} days ago, ${formatTime(date)}`;
//     }

//     if (diffInWeeks < 4) {
//       return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
//     }

//     if (diffInMonths < 12) {
//       return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
//     }

//     return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
//   };

//   const cleanHtml = (html: string | null | undefined): string => {
//     return html?.replace(/<[^>]*>/g, '') ?? '';
//   };

//   const tabs = [
//     { id: 'summary', label: 'Summary' },
//     { id: 'badges', label: 'Badges' },
//     { id: 'announcements', label: 'Announcements' },
//     { id: 'proposals', label: 'Proposals' },
//   ];

//   const handleTabChange = (tabId: string) => {
//     setActiveTab(tabId);
//   };

//   const StatCard = ({
//     label,
//     value,
//     showHeart = false,
//   }: {
//     label: string;
//     value: number;
//     showHeart?: boolean;
//   }) => (
//     <div className="border-border/60 flex h-20 w-32 flex-col justify-center rounded-lg border-2 border-dotted p-4 text-center">
//       <div className="text-foreground text-2xl font-bold">{value}</div>
//       <div className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
//         {showHeart && <span className="text-primary-base text-base">❤</span>}
//         {label}
//       </div>
//     </div>
//   );

//   const BadgeCard = ({ badge }: { badge: AmbassadorProfile['badges'][0] }) => (
//     <Card className="p-4">
//       <CardContent>
//         <div className="flex items-start space-x-4">
//           <BadgeIcon className="flex-shrink-0" />
//           <div className="flex-1">
//             <Title level="6" className="text-neutral mb-2">
//               {badge.name}
//             </Title>
//             <Paragraph className="text-muted-foreground text-sm">
//               {cleanHtml(badge.description)}
//             </Paragraph>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   const TopicItem = ({
//     topic,
//   }: {
//     topic: AmbassadorProfile['summary']['top_topics'][0];
//   }) => (
//     <div className="border-border/60 flex items-start justify-between border-b py-3 last:border-b-0">
//       <div className="flex-1">
//         <Link href={topic.url} target="_blank" rel="noopener noreferrer">
//           <Paragraph className="text-foreground hover:text-primary-base mb-1 cursor-pointer text-sm font-medium transition-colors">
//             {topic.title}
//           </Paragraph>
//         </Link>
//         <div className="flex items-center space-x-2">
//           <Paragraph className="text-muted-foreground text-xs">
//             {formatDate(topic.created_at)}
//           </Paragraph>
//           <span className="text-primary-base text-sm">❤</span>
//           <span className="text-muted-foreground text-sm">
//             {topic.like_count}
//           </span>
//         </div>
//       </div>
//     </div>
//   );

//   const ReplyItem = ({
//     reply,
//   }: {
//     reply: AmbassadorProfile['summary']['top_replies'][0];
//   }) => (
//     <div className="border-primary-base flex items-start space-x-3 border-l-2 py-2 pl-3">
//       <div className="flex-1 pt-3">
//         <div className="mt-1 flex items-center space-x-4">
//           <span className="text-muted-foreground text-xs">
//             {formatDate(reply.created_at)}
//           </span>
//           <div className="flex items-center space-x-1">
//             <span className="text-primary-base text-xs">❤</span>
//             <span className="text-muted-foreground text-xs">
//               {reply.like_count}
//             </span>
//           </div>
//         </div>
//         <Link href={reply.url} target="_blank" rel="noopener noreferrer">
//           <Paragraph className="text-foreground hover:text-primary-base cursor-pointer text-sm font-medium transition-colors">
//             {reply.title}
//           </Paragraph>
//         </Link>
//       </div>
//     </div>
//   );

//   return (
//     <div className="bg-background min-h-screen">
//       <div className="bg-card">
//         <div className="p-6">
//           <div className="flex items-start justify-between">
//             <div className="flex flex-1 items-start space-x-6">
//               <div className="relative flex-shrink-0">
//                 <UserAvatar size="size-30" name={profile.name} />
//                 <div className="absolute right-0.5 bottom-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-xl border-2 border-white bg-white p-[2px] sm:right-1 sm:bottom-1 sm:h-9 sm:w-9 sm:rounded-2xl sm:border-[3px] sm:p-[3px]">
//                   <div className="text-primary-base">
//                     <CardanoIcon
//                       size={16}
//                       className="sm:h-5 sm:w-5"
//                       color="currentColor"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex w-full items-start justify-between">
//                 <div className="flex-shrink-0">
//                   <Title level="5" className="text-neutral text-2xl">
//                     {profile.name}
//                   </Title>
//                   <Paragraph className="text-muted-foreground">
//                     Ambassador
//                   </Paragraph>
//                   <div className="mt-1 flex items-center space-x-2">
//                     <span className="rounded-full text-base">
//                       {getCountryFlag(profile.country)}
//                     </span>
//                     <span className="text-muted-foreground text-sm">
//                       {profile.country}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="mx-8 flex justify-center space-x-4">
//                   <StatCard
//                     label="Topics Created"
//                     value={profile.summary.stats.topics_created}
//                   />
//                   <StatCard
//                     label="Given"
//                     value={profile.summary.stats.likes_given}
//                     showHeart={true}
//                   />
//                   <StatCard
//                     label="Received"
//                     value={profile.summary.stats.likes_received}
//                     showHeart={true}
//                   />
//                   <StatCard
//                     label="Days Visited"
//                     value={profile.summary.stats.days_visited}
//                   />
//                   <StatCard
//                     label="Posts Created"
//                     value={profile.summary.stats.replies_created}
//                   />
//                 </div>
//                 <div className="flex-shrink-0">
//                   <Button
//                     variant="primary"
//                     size="md"
//                     className="bg-primary-base hover:bg-primary-400"
//                   >
//                     Follow
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="flex p-6 gap-6">
//         <aside className="sticky top-6 h-fit w-80 flex-shrink-0 space-y-6">
//           <Card>
//             <CardContent>
//               <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-2">
//                 <Title level="6" className="text-neutral text-lg">
//                   About
//                 </Title>
//                 <div className="text-muted-foreground flex items-center gap-2">
//                   <EditIcon className="h-4 w-4" />
//                   <span>Edit</span>
//                 </div>
//               </div>
//               <Paragraph className="text-foreground overflow-wrap-anywhere mb-6 text-sm leading-snug font-normal break-words">
//                 {cleanHtml(profile.bio_excerpt)}
//               </Paragraph>

//               <div className="space-y-3 text-sm">
//                 <div>
//                   <span className="text-neutral font-semibold">Country:</span>{' '}
//                   <span className="text-muted-foreground">
//                     {profile.country}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-neutral font-semibold">Username:</span>{' '}
//                   <span className="text-muted-foreground">
//                     {profile.username}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-neutral font-semibold">Phone:</span>{' '}
//                   <span className="text-muted-foreground">
//                     {formatDate(profile.created_at)}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-neutral font-semibold">Role:</span>{' '}
//                   <span className="text-muted-foreground"></span>
//                 </div>
//                 <div>
//                   <span className="text-neutral font-semibold">Website:</span>{' '}
//                   <span className="text-muted-foreground"></span>
//                 </div>
//                 <div>
//                   <span className="text-neutral font-semibold">Languages:</span>{' '}
//                   <span className="text-muted-foreground"></span>
//                 </div>
//               </div>
//               <div className="bg-muted/20 border-border/40 mt-6 flex flex-col items-center justify-center rounded-lg border">
//                 <MapsIcon
//                   size={50}
//                 />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-2">
//               <Title level="6" className="text-neutral mb-4 text-lg">
//                 Network
//               </Title>
//               <div className="space-y-3">
//                 <div className="flex items-center space-x-3">
//                   <LinkedInIcon size={15} />
//                   <span className="text-neutral">{profile.name}</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <XIcon size={15} />
//                   <span className="text-neutral">{profile.name}</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <GithubIcon size={15} />
//                   <span className="text-neutral">{profile.name}</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Paragraph className="text-muted-foreground mt-4 text-base">
//             Member Since: {formatDate(profile.created_at)}
//           </Paragraph>
//         </aside>
//         <main className="flex flex-1 flex-col min-w-0">
//           <div className="border-border bg-card border-b">
//             <div className="px-6">
//               <TopNav
//                 tabs={tabs}
//                 activeTabId={activeTab}
//                 onTabChange={handleTabChange}
//               />
//             </div>
//           </div>
//           <div className="flex-1 p-6">
//             {activeTab === 'summary' && (
//               <div className="space-y-8">
//                 <Card>
//                   <CardContent className="border-border/60 border-b p-2">
//                     <div className="border-border/60 flex items-center justify-between border-b pb-4">
//                       <Title level="6" className="text-neutral text-lg">
//                         Recent Activities
//                       </Title>
//                       <div className="flex items-center gap-3">
//                         <Paragraph size="sm" className="text-muted-foreground">
//                           Enable Notifications:
//                         </Paragraph>
//                         <Paragraph size="sm" className="text-muted-foreground">
//                           {notificationsEnabled ? 'On' : 'Off'}
//                         </Paragraph>
//                         <Switch
//                           checked={notificationsEnabled}
//                           onCheckedChange={setNotificationsEnabled}
//                         />
//                       </div>
//                     </div>
//                     <Progress
//                       steps={(showAllActivities
//                         ? profile.activities
//                         : profile.activities.slice(0, 5)
//                       ).map((activity, index) => ({
//                         id: `activity-${index}`,
//                         title: (
//                           <Link
//                             href={activity.url}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline"
//                           >
//                             <span className="hover:text-primary-base cursor-pointer transition-colors">
//                               {activity.title}
//                             </span>
//                           </Link>
//                         ),
//                         description: getRelativeTime(activity.created_at),
//                         status: 'pending' as const,
//                       }))}
//                     />
//                     {profile.activities.length > 5 && (
//                       <div className="mt-4 text-center">
//                         <TextLink
//                           href="#"
//                           variant="dotted"
//                           size="sm"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             setShowAllActivities(!showAllActivities);
//                           }}
//                         >
//                           {showAllActivities ? 'Show Less' : `View All `}
//                         </TextLink>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-2">
//                     <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-4">
//                       <Title level="6" className="text-neutral text-lg">
//                         Top Topics
//                       </Title>
//                       {profile.summary.top_topics.length > 5 && (
//                         <TextLink
//                           href="#"
//                           variant="dotted"
//                           size="sm"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             setShowAllTopics(!showAllTopics);
//                           }}
//                         >
//                           {showAllTopics ? 'Show Less' : `View All `}
//                         </TextLink>
//                       )}
//                     </div>
//                     <div className="space-y-1">
//                       {(showAllTopics
//                         ? profile.summary.top_topics
//                         : profile.summary.top_topics.slice(0, 5)
//                       ).map((topic, index) => (
//                         <TopicItem key={index} topic={topic} />
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-2">
//                     <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-4">
//                       <Title level="6" className="text-neutral text-lg">
//                         Top Replies
//                       </Title>
//                       {profile.summary.top_replies.length > 5 && (
//                         <TextLink
//                           href="#"
//                           variant="dotted"
//                           size="sm"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             setShowAllReplies(!showAllReplies);
//                           }}
//                         >
//                           {showAllReplies ? 'Show Less' : `View All `}
//                         </TextLink>
//                       )}
//                     </div>
//                     <div className="space-y-3">
//                       {(showAllReplies
//                         ? profile.summary.top_replies
//                         : profile.summary.top_replies.slice(0, 5)
//                       ).map((reply, index) => (
//                         <ReplyItem key={index} reply={reply} />
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             )}

//             {activeTab === 'badges' && (
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//                 {profile.badges.map((badge, index) => (
//                   <BadgeCard key={index} badge={badge} />
//                 ))}
//               </div>
//             )}

//             {activeTab === 'announcements' && (
//               <div className="flex flex-col items-center justify-center py-24">
//                 <NoNotificationsIcon className="mb-6" />
//                 <Paragraph size="sm" className="text-muted-foreground">
//                   No new notifications
//                 </Paragraph>
//               </div>
//             )}

//             {activeTab === 'proposals' && (
//               <div className="py-12 text-center">
//                 <Paragraph size="sm" className="text-muted-foreground">
//                   No proposals yet
//                 </Paragraph>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AmbassadorProfile;
