// src/app/api/member/[...username]/route.ts
import { getUserProfile } from '@/services/ambassadorService';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { username: string[] } }
) {
  try {
    const username = params.username?.[0];
    console.log("🔍 API Route received username:", username);

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const data = await getUserProfile({ username });
    console.log("✅ Profile fetched for:", username);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (e: any) {
    console.error("❌ Error fetching profile:", e?.message || e);
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}

