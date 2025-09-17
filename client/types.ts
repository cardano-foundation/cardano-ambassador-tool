import { IWallet, Quantity, Unit } from '@meshsdk/core';
import { MemberData } from '@sidan-lab/cardano-ambassador-tool';

export interface MembershipIntentPayoad {
  tokenUtxoHash: string;
  tokenUtxoIndex: number;
  userMetadata: MemberData;
  wallet: IWallet;
  address: string;
  tokenPolicyId: string;
  tokenAssetName: string;
}

export type MemberTokenDetail = {
  txHash: string | null;
  outputIndex: number | null;
  unit: Unit;
  policyId: string;
  assetName: string;
  fingerprint: string;
  quantity: Quantity;
};

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

export interface Utxo {
  id: number;
  txHash: string;
  outputIndex: number;
  address: string;
  amount: string;
  dataHash: string | null;
  plutusData: string | null;
  context: string;
}

export type Ambassador = {
  href: string;
  username: string;
  name: string;
  bio_excerpt: string | null;
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
    type: 'reply' | 'topic';
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
};

/**
 * Cardano Network Configuration
 *
 * This module handles environment-driven network configuration for Cardano.
 * It supports preprod (testnet) and mainnet environments with proper validation.
 */

export type CardanoNetwork = 'mainnet' | 'preprod';

export interface NetworkConfig {
  network: CardanoNetwork;
  networkId: number;
  isTestnet: boolean;
  blockfrostUrl: string;
  explorerUrl: string;
  name: string;
}

export interface NetworkValidationResult {
  isValid: boolean;
  walletNetwork?: string;
  expectedNetwork: string;
  error?: string;
  message?: string;
}

export type SessionPayload = {
  address: string;
  expiresAt: Date;
  roles: {
    role: string;
  }[];
};

export interface NormalizedUser {
  href: string;
  username: string;
  name?: string;
  bio_excerpt?: string;
  country?: string;
  flag?: string;
  avatar?: string;
  created_at?: string;
  summary: {
    stats: Record<string, any>;
    top_replies: any[];
    top_topics: any[];
  };
  activities: any[];
  badges: any[];
}

export type TimelineStatus = 'pending' | 'current' | 'completed';

export interface TimelineStep {
  id: string;
  title: string | React.ReactNode;
  content?:  React.ReactNode;
  status: TimelineStatus;
}

export interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
  onStepClick?: (stepId: string, stepIndex: number) => void;
  clickable?: boolean;
}


export type ExtendedMemberData = MemberData & {
  txHash?: string;
};