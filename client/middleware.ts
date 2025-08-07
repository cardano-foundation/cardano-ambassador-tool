
import { NextRequest, NextResponse } from 'next/server';
// import { verifySessionToken } from './lib/auth/verify';
import {resolveRoles} from "@/lib/auth/roles"

const PROTECTED_PATHS = ['/admin-dashboard', '/dashboard'];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const shouldProtect = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
    if (!shouldProtect) return NextResponse.next();

    const token = req.cookies.get('session_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/login', req.url));

    // const payload = await verifySessionToken(token);
    // if (!payload || typeof payload.address !== 'string') {
    //     return NextResponse.redirect(new URL('/login', req.url));
    // }

    const roles = 'admin'; // optionally preload assets
    const isAmbassadorRoute = pathname.startsWith('/ambassadors');

    if (isAmbassadorRoute && !roles.includes('ambassador')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin-dashboard/:path*', '/dashboard/:path*'],
};