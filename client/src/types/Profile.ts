export interface BaseProfileData {
  name: string;
  displayName: string;
  email: string;
  bio: string;
  country: string;
  city: string;
  wallet: string;
  github: string;
  twitter: string;
  discord: string;
  avatar?: string;
}

export interface ProfileFormData extends BaseProfileData {
  claimUrl: string;
  drep: string;
  poolId: string;
}

export interface ProfileStats {
  topicsCreated: number;
  given: number;
  received: number;
  daysVisited: number;
  postsCreated: number;
}

export interface ConnectedWallet {
  address: string;
  balance: string;
}

export interface MyProfileData extends BaseProfileData {
  id: string;
  countryCode: string;
  ambassadorUrl: string;
  spoId: string;
  stats: ProfileStats;
  connectedWallet?: ConnectedWallet;
  isActiveAmbassador: boolean;
}