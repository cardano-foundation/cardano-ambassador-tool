import { getUserProfile } from '@/services/ambassadorService';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string[] }> },
) {
  try {
    const { username } = await context.params;
    const data = await getUserProfile({ username: username[0] });
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
