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
    proposals: (txhash: string) => `/my/proposals/${txhash}`,
  },
  
  // Admin routes
  manage: {
    ambassadors: '/manage/memberships',
    membershipApplications: '/manage/membership-applications',
    membershipApplication: (txhash: string) => `/manage/membership-applications/${txhash}`,
    proposals: '/manage/proposals',
    proposal: (txhash: string) => `/manage/proposals/${txhash}`,
  },
} as const;


// Helper function to get route with parameters
export const getRoute = {
  proposal: (txhash: string) => routes.proposal(txhash),
  myProposal: (txhash: string) => routes.my.proposals(txhash),
  manageMembershipApplication: (txhash: string) => routes.manage.membershipApplication(txhash),
  manageProposal: (txhash: string) => routes.manage.proposal(txhash),
} as const;
