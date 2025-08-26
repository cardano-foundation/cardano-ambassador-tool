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