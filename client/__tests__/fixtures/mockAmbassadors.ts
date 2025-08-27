import { Ambassador } from "@types";

export const mockAmbassadors: Ambassador[] = [
  {
    href: "https://forum.cardano.org/u/testuser1/summary",
    username: "testuser1",
    name: "Test User 1 [TEST1]",
    bio_excerpt: "Blockchain developer and educator passionate about Cardano ecosystem growth and decentralization.",
    country: "United States",
    flag: "/img/flags/US.svg",
    avatar: "/user_avatar/forum.cardano.org/testuser1/{size}/12345_2.png",
    created_at: "2020-01-15T10:30:00.000Z",
    summary: {
      stats: {
        topics_entered: 2500,
        posts_read_count: 15000,
        days_visited: 800,
        likes_given: 1200,
        likes_received: 1800,
        topics_created: 25,
        replies_created: 500,
        time_read: 180000,
        recent_time_read: 1000
      },
      top_replies: [
        {
          title: "Best practices for Cardano smart contract development",
          url: "https://forum.cardano.org/t/best-practices-for-cardano-smart-contract-development/12345/2",
          like_count: 42,
          created_at: "2023-06-15T14:20:00.000Z"
        },
        {
          title: "Understanding Cardano's UTXO model",
          url: "https://forum.cardano.org/t/understanding-cardanos-utxo-model/23456/5",
          like_count: 38,
          created_at: "2023-05-10T09:15:00.000Z"
        }
      ],
      top_topics: [
        {
          title: "Getting started with Plutus development",
          url: "https://forum.cardano.org/t/getting-started-with-plutus-development/34567",
          reply_count: 120,
          like_count: 250,
          created_at: "2023-03-01T12:00:00.000Z"
        },
        {
          title: "Cardano DApp deployment guide",
          url: "https://forum.cardano.org/t/cardano-dapp-deployment-guide/45678",
          reply_count: 85,
          like_count: 180,
          created_at: "2023-04-20T16:30:00.000Z"
        }
      ]
    },
    activities: [
      {
        type: "reply",
        title: "Latest Cardano node updates",
        url: "https://forum.cardano.org/t/latest-cardano-node-updates/56789/15",
        created_at: "2023-12-01T10:00:00.000Z"
      },
      {
        type: "topic",
        title: "Community feedback on governance proposals",
        url: "https://forum.cardano.org/t/community-feedback-on-governance-proposals/67890",
        created_at: "2023-11-15T14:30:00.000Z"
      }
    ],
    badges: [
      {
        name: "Regular",
        description: "Granted recategorize, rename, followed links, wiki, more likes",
        icon: "user",
        granted_at: "2021-03-01T00:00:00.000Z"
      },
      {
        name: "Great Topic",
        description: "Received 50 likes on a topic",
        icon: "file-signature",
        granted_at: "2023-04-25T00:00:00.000Z"
      },
      {
        name: "Devotee",
        description: "Visited 365 consecutive days",
        icon: "far-eye",
        granted_at: "2022-01-15T00:00:00.000Z"
      }
    ]
  },
  {
    href: "https://forum.cardano.org/u/testuser2/summary",
    username: "testuser2",
    name: "Test User 2 [TEST2]",
    bio_excerpt: "Community organizer focused on DeFi adoption and staking pool operations.",
    country: "Canada",
    flag: "/img/flags/CA.svg",
    avatar: "/user_avatar/forum.cardano.org/testuser2/{size}/23456_2.png",
    created_at: "2019-08-20T15:45:00.000Z",
    summary: {
      stats: {
        topics_entered: 1800,
        posts_read_count: 12000,
        days_visited: 650,
        likes_given: 900,
        likes_received: 1400,
        topics_created: 18,
        replies_created: 380,
        time_read: 150000,
        recent_time_read: 800
      },
      top_replies: [
        {
          title: "Staking rewards calculation explained",
          url: "https://forum.cardano.org/t/staking-rewards-calculation-explained/78901/3",
          like_count: 35,
          created_at: "2023-07-20T11:30:00.000Z"
        },
        {
          title: "DeFi protocols on Cardano comparison",
          url: "https://forum.cardano.org/t/defi-protocols-on-cardano-comparison/89012/7",
          like_count: 28,
          created_at: "2023-08-05T13:45:00.000Z"
        }
      ],
      top_topics: [
        {
          title: "Small stake pool sustainability discussion",
          url: "https://forum.cardano.org/t/small-stake-pool-sustainability-discussion/90123",
          reply_count: 95,
          like_count: 200,
          created_at: "2023-02-15T09:20:00.000Z"
        }
      ]
    },
    activities: [
      {
        type: "reply",
        title: "Pool operator guidelines update",
        url: "https://forum.cardano.org/t/pool-operator-guidelines-update/01234/8",
        created_at: "2023-11-28T16:20:00.000Z"
      },
      {
        type: "topic",
        title: "Community events calendar",
        url: "https://forum.cardano.org/t/community-events-calendar/12345",
        created_at: "2023-10-10T12:15:00.000Z"
      }
    ],
    badges: [
      {
        name: "Regular",
        description: "Granted recategorize, rename, followed links, wiki, more likes",
        icon: "user",
        granted_at: "2020-05-15T00:00:00.000Z"
      },
      {
        name: "Anniversary",
        description: "Active member for a year, posted at least once",
        icon: "cake-candles",
        granted_at: "2021-08-20T00:00:00.000Z"
      }
    ]
  },
  {
    href: "https://forum.cardano.org/u/testuser3/summary",
    username: "testuser3",
    name: "Test User 3 [TEST3]",
    bio_excerpt: null,
    country: "Germany",
    flag: "/img/flags/DE.svg",
    avatar: "/user_avatar/forum.cardano.org/testuser3/{size}/34567_2.png",
    created_at: "2021-03-10T08:15:00.000Z",
    summary: {
      stats: {
        topics_entered: 1200,
        posts_read_count: 8000,
        days_visited: 400,
        likes_given: 600,
        likes_received: 800,
        topics_created: 12,
        replies_created: 200,
        time_read: 90000,
        recent_time_read: 500
      },
      top_replies: [
        {
          title: "Cardano governance voting guide",
          url: "https://forum.cardano.org/t/cardano-governance-voting-guide/23456/4",
          like_count: 22,
          created_at: "2023-09-12T14:10:00.000Z"
        }
      ],
      top_topics: [
        {
          title: "Technical analysis of Hydra protocol",
          url: "https://forum.cardano.org/t/technical-analysis-of-hydra-protocol/34567",
          reply_count: 45,
          like_count: 120,
          created_at: "2023-05-30T11:00:00.000Z"
        }
      ]
    },
    activities: [
      {
        type: "reply",
        title: "Hydra development roadmap",
        url: "https://forum.cardano.org/t/hydra-development-roadmap/45678/12",
        created_at: "2023-11-20T09:45:00.000Z"
      }
    ],
    badges: [
      {
        name: "Licensed",
        description: "Completed our advanced user tutorial",
        icon: "stamp",
        granted_at: "2021-04-01T00:00:00.000Z"
      }
    ]
  }
];

export const mockSearchResults = {
  'test': mockAmbassadors.filter(a => a.username.includes('test')),
  'user': mockAmbassadors,
  'canada': mockAmbassadors.filter(a => a.country === 'Canada'),
  'germany': mockAmbassadors.filter(a => a.country === 'Germany'),
  'defi': mockAmbassadors.filter(a => a.bio_excerpt?.toLowerCase().includes('defi')),
  'blockchain': mockAmbassadors.filter(a => a.bio_excerpt?.toLowerCase().includes('blockchain'))
};

export const mockCountries = [...new Set(mockAmbassadors.map(a => a.country))].sort();
