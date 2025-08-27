

import type { SessionPayload } from '../definition';
import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.NEXT_PUBLIC_SECRET || 'dev-secret';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1hr')
        .sign(key);
}

export async function decrypt(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

export async function createClientSession(data: SessionPayload) {
    const token = await encrypt(data);
    sessionStorage.setItem('session', token);
    return token;
}

export function destroyClientSession() {
    sessionStorage.removeItem('session');
}