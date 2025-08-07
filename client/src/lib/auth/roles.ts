import type { Unit } from '@meshsdk/core';

const ADMIN_PUBKEYS = (process.env.ADMIN_PUBKEYS || '').split(','); 


export function resolveRoles(pubKeyHash: string, assets: Unit[]): string[] {
    const roles = [];

    if (ADMIN_PUBKEYS.includes(pubKeyHash)) {
        roles.push('admin');
    }

    if (assets.some((a) => a.startsWith(process.env.AMBASSADOR_POLICY_ID!))) {
        roles.push('ambassador');
    }

    return roles;
}