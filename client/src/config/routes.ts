export const routes = {
  // Public routes
  home: "/",
  userGuide: "/user-guide",
  proposals: "/proposals",
  newProposal: "/proposals/new",
  signUp: "/sign-up",
  unauthorized: "/unauthorized",

  // Dynamic public routes
  proposal: (txHash: string) => `/proposals/${txHash}`,
  completedProposal: (slug: string) => `/proposals/completed/${slug}`,

  // User/Member routes
  my: {
    profile: "/my/profile",
    submissions: "/my/submissions",
    proposals: (txHash: string) => `/my/proposals/${txHash}`,
  },

  // Admin routes
  manage: {
    ambassadors: "/manage/memberships",
    ambassador: (txHash: string) => `/manage/memberships/${txHash}`,
    membershipApplications: "/manage/membership-applications",
    membershipApplication: (txHash: string) =>
      `/manage/membership-applications/${txHash}`,
    proposalApplications: "/manage/proposal-applications",
    proposal: (txHash: string) => `/manage/proposal-applications/${txHash}`,
    treasurySignoffs: "/manage/treasury-signoffs",
    treasurySignoff: (txHash: string) => `/manage/treasury-signoffs/${txHash}`,
    adminGuide: "/admin-guide",
  },
} as const;

// Helper function to get route with parameters
export const getRoute = {
  proposal: (txHash: string) => routes.proposal(txHash),
  completedProposal: (slug: string) => routes.completedProposal(slug),
  myProposal: (txHash: string) => routes.my.proposals(txHash),
  manageMembershipApplication: (txHash: string) =>
    routes.manage.membershipApplication(txHash),
  manageProposal: (txHash: string) => routes.manage.proposal(txHash),
} as const;
