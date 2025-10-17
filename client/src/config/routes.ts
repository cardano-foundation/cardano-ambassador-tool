export const routes = {
  // Public routes
  home: '/',
  about: '/about',
  proposals: '/proposals',
  newProposal: '/proposals/new',
  signUp: '/sign-up',
  unauthorized: '/unauthorized',
  
  // Dynamic public routes
  proposal: (txhash: string) => `/proposals/${txhash}`,
  
  // User/Member routes 
  my: {
    profile: '/my/profile',
    submissions: '/my/submissions',
    proposalIntents: (txhash: string) => `/my/proposal-intents/${txhash}`,
  },
  
  // Admin routes
  manage: {
    ambassadors: '/manage/memberships',
    membershipIntents: '/manage/memberships-intents',
    membershipIntent: (txhash: string) => `/manage/memberships-intents/${txhash}`,
    proposalIntents: '/manage/proposal-intents',
    proposalIntent: (txhash: string) => `/manage/proposal-intents/${txhash}`,
  },
} as const;


// Helper function to get route with parameters
export const getRoute = {
  proposal: (txhash: string) => routes.proposal(txhash),
  myProposalIntent: (txhash: string) => routes.my.proposalIntents(txhash),
  manageMembershipIntent: (txhash: string) => routes.manage.membershipIntent(txhash),
  manageProposalIntent: (txhash: string) => routes.manage.proposalIntent(txhash),
} as const;