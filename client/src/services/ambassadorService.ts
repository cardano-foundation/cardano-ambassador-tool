// forumService.ts
import { NormalizedUser } from '@types';
import axios from 'axios';

const SUMMARY_URL = 'https://forum.cardano.org/u/{username}/summary.json';
const PROFILE_URL = 'https://forum.cardano.org/u/{username}.json';

export interface Ambassador {
  username: string;
  country?: string;
  flag?: string;
}

async function fetchJson(url: string) {
  const apiKey = process.env.CARDANO_FORUM_API_KEY;
  
  if (!apiKey) {
    console.error('❌ [Ambassador Service] CARDANO_FORUM_API_KEY environment variable is not set');
    throw new Error(
      'CARDANO_FORUM_API_KEY environment variable is not set. Please add it to your .env.local file.'
    );
  }

  console.log('🔑 [Ambassador Service] Using API key from environment variables');
  
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      family: 4,
      api_key: apiKey,
    });
    return res.data;
  } catch (error) {
    console.error('❌ [Ambassador Service] Failed to fetch data:', {
      url,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
}

export async function getUserProfile(
  ambassador: Ambassador,
): Promise<NormalizedUser> {
  const username = ambassador.username;

  const summaryRaw = await fetchJson(
    SUMMARY_URL.replace('{username}', username),
  );
  const profileRaw = await fetchJson(
    PROFILE_URL.replace('{username}', username),
  );

  const userSummary = summaryRaw?.user_summary ?? {};
  const topicsRaw = summaryRaw?.topics ?? [];
  const repliesRaw = userSummary?.replies ?? [];
  const profileUser = profileRaw?.user ?? {};
  const badgesRaw = profileRaw?.badges ?? [];
  const userBadgesRaw = profileRaw?.user_badges ?? [];

  const profile: NormalizedUser = {
    href: `https://forum.cardano.org/u/${username}/summary`,
    username,
    name: profileUser.name,
    bio_excerpt: profileUser.bio_excerpt,
    country: ambassador.country,
    flag: ambassador.flag,
    avatar: profileUser.avatar_template,
    created_at: profileUser.created_at,
    summary: {
      stats: {
        topics_entered: userSummary.topics_entered,
        posts_read_count: userSummary.posts_read_count,
        days_visited: userSummary.days_visited,
        likes_given: userSummary.likes_given,
        likes_received: userSummary.likes_received,
        topics_created: userSummary.topic_count,
        replies_created: userSummary.post_count,
        time_read: userSummary.time_read,
        recent_time_read: userSummary.recent_time_read,
      },
      top_replies: [],
      top_topics: [],
    },
    activities: [],
    badges: [],
  };

  // --- top topics ---
  const sortedTopics = [...topicsRaw]
    .sort(
      (a, b) =>
        (b.like_count ?? 0) - (a.like_count ?? 0) ||
        (b.posts_count ?? 0) - (a.posts_count ?? 0),
    )
    .slice(0, 5);
  profile.summary.top_topics = sortedTopics.map((t: any) => ({
    title: t.fancy_title || t.title,
    url: `https://forum.cardano.org/t/${t.slug}/${t.id}`,
    reply_count: t.posts_count,
    like_count: t.like_count,
    created_at: t.created_at,
  }));

  // --- top replies ---
  const topicLookup: Record<string, any> = {};
  topicsRaw.forEach((t: any) => (topicLookup[t.id] = t));
  const sortedReplies = [...repliesRaw]
    .sort(
      (a, b) =>
        (b.like_count ?? 0) - (a.like_count ?? 0) ||
        (b.created_at ?? '').localeCompare(a.created_at ?? ''),
    )
    .slice(0, 5);
  profile.summary.top_replies = sortedReplies.map((r: any) => ({
    title: topicLookup[r.topic_id]?.fancy_title,
    url: `https://forum.cardano.org/t/${topicLookup[r.topic_id]?.slug}/${r.topic_id}/${r.post_number}`,
    like_count: r.like_count,
    created_at: r.created_at,
  }));

  // --- activities mashup ---
  const activities: any[] = [];
  for (const r of repliesRaw) {
    const topic = topicLookup[r.topic_id] || {};
    activities.push({
      type: 'reply',
      title: topic.fancy_title,
      url: `https://forum.cardano.org/t/${topic.slug}/${r.topic_id}/${r.post_number}`,
      created_at: r.created_at,
    });
  }
  for (const t of topicsRaw) {
    activities.push({
      type: 'topic',
      title: t.fancy_title,
      url: `https://forum.cardano.org/t/${t.slug}/${t.id}`,
      created_at: t.created_at,
    });
  }
  for (const l of userSummary.likes ?? []) {
    const topic = topicLookup[l.topic_id] || {};
    activities.push({
      type: 'like',
      title: topic.fancy_title,
      url: `https://forum.cardano.org/t/${topic.slug}/${l.topic_id}/${l.post_number}`,
      created_at: l.created_at,
    });
  }
  for (const v of userSummary.votes ?? []) {
    const topic = topicLookup[v.topic_id] || {};
    activities.push({
      type: 'vote',
      title: topic.fancy_title,
      url: `https://forum.cardano.org/t/${topic.slug}/${v.topic_id}/${v.post_number}`,
      created_at: v.created_at,
    });
  }

  profile.activities = activities
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    .slice(0, 5);

  // --- badges ---
  const badgeLookup: Record<string, any> = {};
  badgesRaw.forEach((b: any) => (badgeLookup[b.id] = b));
  profile.badges = userBadgesRaw
    .map((ub: any) => {
      const badge = badgeLookup[ub.badge_id];
      return badge
        ? {
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            granted_at: ub.granted_at,
          }
        : null;
    })
    .filter(Boolean);

  return profile;
}
