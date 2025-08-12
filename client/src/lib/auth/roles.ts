
import { findAdmins, findMemberUtxo } from '@/utils';
import { deserializeAddress, } from '@meshsdk/core';


export async function resolveRoles(address: string): Promise<string[]> {

    const memberUtxo = await findMemberUtxo(address);

    const roles = [];

    const adminsPubk = await findAdmins();

    if (adminsPubk && adminsPubk.includes(deserializeAddress(address).pubKeyHash)) {
        roles.push('admin');
    }

    if (memberUtxo) {
        roles.push('ambassador');
    }

    return roles;
}