'use server'

import { deserializeAddress } from '@meshsdk/core';

function getAdminPubKeyHashes(): string[] {
  const adminList = Object.keys(process.env)
    .filter((key) => key.startsWith('ADMIN_WALLET'))
    .map((key) => {
      try {
        const address = process.env[key];
        if (!address) return null;
        return deserializeAddress(address).pubKeyHash;
      } catch (error) {
        console.error(`Error deserializing admin address ${key}:`, error);
        return null;
      }
    })
    .filter(Boolean) as string[];

  return adminList;
}



export async function resolveRoles(address: string): Promise<
  {
    role: string;
  }[]
> {
  const roles: { role: string }[] = [];

  try {
    
    // Get admin pub key hashes from environment
    const adminsPubKeyHashes = getAdminPubKeyHashes();
    
    // Get user's pub key hash
    const userPubKeyHash = deserializeAddress(address).pubKeyHash;
    
    // Check if user is admin
    if (adminsPubKeyHashes.includes(userPubKeyHash)) {
      roles.push({ role: 'admin' });
    } else {
      console.log('User is not admin');
    }
    
    
  } catch (error) {
    console.error('Error resolving user roles:', error);
  }

  return roles;
}
