import { NormalizedUser } from '@types';
import { unstable_cache, revalidateTag } from 'next/cache';
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
  const apiUser = process.env.CARDANO_FORUM_API_USERNAME ?? 'system';

  if (!apiKey) {
    throw new Error(
      'CARDANO_FORUM_API_KEY environment variable is not set. Please add it to your .env.local file.'
    );
  }
  
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      family: 4,
      headers: {
        'Api-Key': apiKey,
        'Api-Username': apiUser,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}
async function tryMultipleUsernameFormats(username: string): Promise<NormalizedUser | null> {
  const usernameVariations = [
    username,
    username.replace(/\s+/g, '_'), // "Eligendi_est_quod_ob"
    username.replace(/\s+/g, '-'), // "Eligendi-est-quod-ob"
    username.split(' ')[0], // "Eligendi" (first word only)
  ];

  for (const variation of usernameVariations) {
    try {
      const summaryUrl = SUMMARY_URL.replace('{username}', variation);
      await fetchJson(summaryUrl); // Test if this variation works
      const result = await getUserProfileUncached({ username: variation });
      if (result) {
        return result; // Return the valid result
      }
    } catch (error) {
      console.log(`Username variation "${variation}" failed, trying next...`);
      continue;
    }
  }
  
  return null; // Return null instead of throwing an error
}

async function getUserProfileUncached(
  ambassador: Ambassador,
): Promise<NormalizedUser | null> {
  const username = ambassador.username;

  // Encode the username for the URL
  const encodedUsername = encodeURIComponent(username);
  
  try {
    const summaryUrl = SUMMARY_URL.replace('{username}', encodedUsername);
    const profileUrl = PROFILE_URL.replace('{username}', encodedUsername);
    
    const summaryRaw = await fetchJson(summaryUrl);
    const profileRaw = await fetchJson(profileUrl);

    return processUserData(username, summaryRaw, profileRaw, ambassador);
  } catch (error: any) {
    // If it's a 404, try different username formats
    if (error.response?.status === 404) {
      console.log(`User "${username}" not found, trying variations...`);
      return tryMultipleUsernameFormats(username);
    }
    // Re-throw other errors (network issues, auth problems, etc.)
    throw error;
  }
}

function processUserData(
  username: string, 
  summaryRaw: any, 
  profileRaw: any, 
  ambassador: Ambassador
): NormalizedUser {
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
    country: profileUser.location || '',
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

export const getUserProfile = (ambassador: Ambassador) =>
  unstable_cache(
    async () => {
      const result = await getUserProfileUncached(ambassador);
      return result;
    },
    ['forum-profile', ambassador.username],
    {
      revalidate: 1800,
      tags: [`forum-${ambassador.username}`, 'all-forum-profiles'],
    }
  )();

export { getUserProfileUncached };

export async function invalidateUserProfileCache(username: string) {
  revalidateTag(`forum-${username}`);
}
