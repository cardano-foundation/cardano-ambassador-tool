import {
  getUserProfile,
  getUserProfileUncached,
} from '@/services/ambassadorService';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await context.params;
    const url = new URL(req.url);
    const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
    const decodedUsername = decodeURIComponent(username);

    const data = forceRefresh
      ? await getUserProfileUncached({ username: decodedUsername })
      : await getUserProfile({ username: decodedUsername });
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': forceRefresh
          ? 'no-cache, no-store, must-revalidate'
          : 's-maxage=300, stale-while-revalidate=150',
      },
    });
  } catch (e: any) {
    console.error('Forum API error:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to fetch user profile' },
      { status: 500 },
    );
  }
}
