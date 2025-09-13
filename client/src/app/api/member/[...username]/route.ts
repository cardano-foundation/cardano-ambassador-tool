import { getUserProfile } from '@/services/ambassadorService';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { username: string } },
) {
  try {
    const data = await getUserProfile({ username: params.username });
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300', 
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
