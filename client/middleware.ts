import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { SessionPayload } from '@types';

const secretKey = process.env.SECRET_KEY || 'dev-secret-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

const PROTECTED_PATHS = ['/manage', '/dashboard'];
const ADMIN_ONLY_PATHS = ['/manage'];

async function decrypt(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Check if route needs protection
    const shouldProtect = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
    if (!shouldProtect) return NextResponse.next();

    // Get session token
    const token = req.cookies.get('session_token')?.value;
    
    if (!token) {
        console.log('No session token found, redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Verify session
    const session = await decrypt(token);
    if (!session || !session.address) {
        console.log('Invalid session, redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
        console.log('Session expired, redirecting to home');
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Check admin-only routes
    const isAdminOnlyRoute = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
    if (isAdminOnlyRoute) {
        const hasAdminRole = session.roles.some(r => r.role === 'admin');
        if (!hasAdminRole) {
            console.log('Access denied: Admin role required for', pathname);
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
    }

    console.log(`Access granted to ${pathname} for user ${session.address}`);
    return NextResponse.next();
}

export const config = {
    matcher: [],
};
