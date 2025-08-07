import 'server-only';

import type { SessionPayload } from '../definition';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = 'process.env.SECRET';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1hr')
        .sign(key);
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(address: string) {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const session = await encrypt({ address, expiresAt });

     (await cookies()).set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });

    redirect('/dashboard');
}

export async function verifySession() {
    const cookie =  (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);

    if (!session?.address) {
        redirect('/login');
    }

    return { isAuth: true, address: session.address };
}

export async function updateSession() {
    const session = (await cookies()).get('session')?.value;
    const payload = await decrypt(session);

    if (!session || !payload) {
        return null;
    }

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
     (await cookies()).set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expires,
        sameSite: 'lax',
        path: '/',
    });
}

export async function  deleteSession() {
     (await cookies()).delete('session');
    redirect('/login');
}