import { IWallet } from "@meshsdk/core";
import { Quantity, Unit } from '@meshsdk/core';


export interface MembershipIntentPayoad {
    tokenUtxoHash: string;
    tokenUtxoIndex: number;
    userMetadata: MemberMetadata;
    wallet: IWallet;
    address: string;
    tokenPolicyId: string
    tokenAssetName: string
}

export interface MemberMetadata {
    fullname: string;
    bio: string;
    email: string;
    displayName: string;
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
    name: string
}

export interface NetworkValidationResult {
    isValid: boolean;
    walletNetwork?: string;
    expectedNetwork: string;
    error?: string;
    message?: string;
}